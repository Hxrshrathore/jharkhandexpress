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

    let resultText = '{}';

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not defined. Please restart your Next.js server to load the new environment variables.');
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      resultText = response.text || '{}';
    } catch (geminiError: any) {
      console.error('Gemini AI failed, falling back to NVIDIA:', geminiError);

      if (!process.env.NVIDIA_API_KEY) {
        throw new Error('NVIDIA_API_KEY is not defined. Fallback failed.');
      }

      const openai = new OpenAI({
        baseURL: "https://integrate.api.nvidia.com/v1",
        apiKey: process.env.NVIDIA_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "nvidia/nemotron-3.5-lightning-30b-a3b",
        messages: [{ role: "user", content: prompt }],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 16384,
        stream: true
      } as any);

      let fullContent = '';
      for await (const chunk of completion as any) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullContent += content;
        }
      }

      resultText = fullContent || '{}';
      resultText = extractJson(resultText);
    }

    const parsedData = JSON.parse(resultText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('AI Processing Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process text' }, { status: 500 });
  }
}
