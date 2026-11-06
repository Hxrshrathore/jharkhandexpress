import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { sql } from '@/lib/db';

function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) return match[1];
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last > first) return text.slice(first, last + 1);
  return text;
}

export async function POST(req: Request) {
  try {
    const { text, targetParagraphCount = 4 } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Fetch dynamic categories from the database
    let dynamicCategoryList = "Breaking News"; // Fallback
    try {
      const cats = await sql`SELECT name FROM categories ORDER BY name ASC`;
      if (cats && cats.length > 0) {
        dynamicCategoryList = cats.map((c: any) => c.name).join(', ');
      }
    } catch (dbErr) {
      console.error('Failed to fetch categories for AI prompt:', dbErr);
    }

    const prompt = `You are an expert senior news editor and SEO specialist for Jharkhand Express, an authoritative English-language digital news channel focused on Jharkhand and Eastern India.

CRITICAL LANGUAGE REQUIREMENT:
- You MUST write the ENTIRE response in high-quality, professional, standard JOURNALISTIC ENGLISH.
- Even if the raw text provided is in Hindi, Devanagari, Bengali, or another language, you MUST TRANSLATE, REWRITE, AND DELIVER ALL FIELDS (title, slug, excerpt, content_blocks, tags) STRICTLY IN ENGLISH.
- Absolutely NO Hindi words, Devanagari script, or non-English text is permitted anywhere in the output.

Read the following raw news text:
${text}

Format it into a structured, highly professional news article IN ENGLISH.

Return a JSON object EXACTLY in the following format (no markdown code blocks, just raw JSON):
{
  "title": "A catchy, SEO-friendly, professional headline in English",
  "slug": "english-headline-slugified-with-lowercase-dashes",
  "excerpt": "A compelling 1-2 sentence journalistic summary in English",
  "content_blocks": [
    "<p>First beautifully written HTML paragraph in English.</p>",
    "<p>Second detailed paragraph with facts and context in English.</p>"
  ],
  "tags": ["english-tag-1", "english-tag-2", "english-tag-3"],
  "categories": ["Jharkhand", "Politics"]
}

CRITICAL RULES:
1. You MUST GENERATE EXACTLY ${targetParagraphCount} paragraphs in the content_blocks array. Not one more, not one less. Each paragraph must be wrapped in <p>...</p> and written in fluent English.
2. Include "Breaking News" in categories ONLY if the news is highly urgent, time-sensitive, or of major importance. IMPORTANT: You MUST ALWAYS use a MINIMUM OF 2 CATEGORIES (Breaking News + 1 or more) when marking as breaking news, because the "Breaking News" category expires after a time limit while the other ones remain.
3. You MUST ONLY select categories from the following exact list (do not invent new ones):
   ${dynamicCategoryList}
4. All tags MUST be in English (e.g. "jharkhand-development", "ranchi-crime", "economic-policy").
5. The slug MUST consist solely of lowercase English alphanumeric characters and hyphens.
6. Maintain strict editorial neutrality, journalistic rigor, and relevance to Jharkhand and India.
`;

    let resultText = '';
    let successModel = '';

    const rawGeminiKey = process.env.GEMINI_API_KEY || '';
    const geminiApiKey = rawGeminiKey.trim().replace(/^["']+|["']+$/g, '');

    // 1. Sequence of Gemini Models:
    // Gemini 3.5 Flash Lite → Gemini 3.1 Flash Lite → Gemini 3.8 Flash → Gemini 2.5 Flash
    if (geminiApiKey) {
      const geminiModels = [
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
        'gemini-2.5-flash',
      ];

      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        for (const model of geminiModels) {
          const startTime = Date.now();
          try {
            const response = await ai.models.generateContent({
              model,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
              },
            });

            if (response && response.text) {
              resultText = response.text;
              successModel = model;
              const latency = Date.now() - startTime;
              import('@/lib/gemini-tracker')
                .then((m) => m.recordGeminiCall(latency, model))
                .catch(() => {});
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Gemini model ${model} failed, attempting next fallback:`, modelErr?.message || modelErr);
          }
        }
      } catch (geminiInitErr: any) {
        console.warn('GoogleGenAI initialization or dispatch failed:', geminiInitErr?.message || geminiInitErr);
      }
    }

    // 2. NVIDIA NIM Fallback (Optimised: non-streaming, reduced token limits, stricter system instructions, 28-second client timeout)
    const rawNvidiaKey = process.env.NVIDIA_API_KEY || '';
    const nvidiaApiKey = rawNvidiaKey.trim().replace(/^["']+|["']+$/g, '');

    if (!resultText && nvidiaApiKey) {
      console.warn('Gemini sequence failed or unavailable. Falling back to NVIDIA NIM...');
      try {
        const nvidia = new OpenAI({
          baseURL: 'https://integrate.api.nvidia.com/v1',
          apiKey: nvidiaApiKey,
          timeout: 28000, // 28-second client timeout to help prevent Nginx 504 errors
        });

        const completion = await nvidia.chat.completions.create(
          {
            model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
            messages: [
              {
                role: 'system',
                content: 'You are an expert news editor and SEO specialist. Return ONLY a valid, single JSON object adhering strictly to the requested schema. Do not output markdown, preambles, reasoning blocks, or commentary.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 4096,
            stream: false,
          },
          { timeout: 28000 }
        );

        const content = completion.choices?.[0]?.message?.content;
        if (content) {
          resultText = extractJson(content);
          successModel = 'nvidia/nemotron-3.5-lightning-30b-a3b';
        }
      } catch (nvidiaErr: any) {
        console.error('NVIDIA NIM fallback failed:', nvidiaErr?.message || nvidiaErr);
      }
    }

    // 3. OpenAI Fallback
    const rawOpenAiKey = process.env.OPENAI_API_KEY || '';
    const openAiApiKey = rawOpenAiKey.trim().replace(/^["']+|["']+$/g, '');

    if (!resultText && openAiApiKey) {
      console.warn('NVIDIA NIM failed or unavailable. Falling back to OpenAI...');
      try {
        const openai = new OpenAI({
          apiKey: openAiApiKey,
          timeout: 28000,
        });

        const completion = await openai.chat.completions.create(
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert news editor and SEO specialist. Return ONLY a valid JSON object matching the requested schema.',
              },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4096,
          },
          { timeout: 28000 }
        );

        const content = completion.choices?.[0]?.message?.content;
        if (content) {
          resultText = extractJson(content);
          successModel = 'gpt-4o-mini';
        }
      } catch (openAiErr: any) {
        console.error('OpenAI fallback failed:', openAiErr?.message || openAiErr);
      }
    }

    if (!resultText || resultText === '{}') {
      return NextResponse.json(
        { error: 'All AI processing providers (Gemini fallback sequence, NVIDIA NIM, OpenAI) failed or timed out.' },
        { status: 504 }
      );
    }

    const cleanedJson = extractJson(resultText);
    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch (parseError: any) {
      console.error('Failed to parse AI JSON response:', resultText, parseError);
      return NextResponse.json(
        { error: `AI generated non-parseable response: ${parseError.message}` },
        { status: 502 }
      );
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('AI Processing Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process text' }, { status: 500 });
  }
}
