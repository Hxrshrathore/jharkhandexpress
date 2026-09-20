/**
 * POST /api/admin/translate
 *
 * Admin-only route: translates a single article into one or all supported languages.
 * Gemini is called ONCE per language per article (at admin publish time).
 * Translated content is stored in `article_translations` DB table.
 * Public readers pay ZERO API cost — they read from DB directly.
 *
 * Body:
 *   { guid: string, lang?: LanguageCode | 'all', title: string, excerpt: string, content_html: string }
 *
 * If lang === 'all', translates into all supported non-English languages.
 */

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { storeTranslation } from '@/lib/translation';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/lib/brand';
import { auth } from '@/auth';

const NON_ENGLISH = SUPPORTED_LANGUAGES.filter(l => l.code !== 'en');

async function translateViaGemini(
  ai: GoogleGenAI,
  targetLang: string,
  targetLangName: string,
  title: string,
  excerpt: string,
  content_html: string
): Promise<{ title: string; excerpt: string; content_html: string }> {
  const prompt = `You are a professional news translator. Translate the following English news article into ${targetLangName}.

RULES:
1. Preserve all HTML tags exactly — only translate the text content inside them.
2. Keep proper nouns (people, places, organisations) in their commonly used ${targetLangName} form.
3. Keep numbers, dates, and URLs unchanged.
4. Return ONLY a raw JSON object (no markdown blocks) in this exact format:
{
  "title": "...",
  "excerpt": "...",
  "content_html": "..."
}

TITLE: ${title}

EXCERPT: ${excerpt}

CONTENT HTML:
${content_html}`;

  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  const latency = Date.now() - startTime;
  // Non-blocking track
  import('@/lib/gemini-tracker').then(m => m.recordGeminiCall(latency)).catch(() => {});

  const text = response.text || '{}';
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/, '$1').trim();
  return JSON.parse(cleaned.startsWith('{') ? cleaned : '{}');
}

export async function POST(req: Request) {
  // Auth guard — admin only
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { guid, lang = 'all', title, excerpt, content_html } = body;

    if (!guid || !title || !content_html) {
      return NextResponse.json(
        { error: 'guid, title, and content_html are required' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Determine which languages to translate into
    const targets: typeof NON_ENGLISH =
      lang === 'all'
        ? NON_ENGLISH
        : NON_ENGLISH.filter(l => l.code === lang);

    if (targets.length === 0) {
      return NextResponse.json({ error: `Unknown language: ${lang}` }, { status: 400 });
    }

    const results: Record<string, 'ok' | string> = {};

    for (const target of targets) {
      try {
        const translated = await translateViaGemini(
          ai,
          target.code,
          target.label,
          title,
          excerpt || '',
          content_html
        );
        await storeTranslation(
          guid,
          target.code as LanguageCode,
          translated.title || title,
          translated.excerpt || excerpt || '',
          translated.content_html || content_html
        );
        results[target.code] = 'ok';
      } catch (err: any) {
        console.error(`[translate] Failed for lang=${target.code}:`, err);
        results[target.code] = err?.message || 'failed';
      }
    }

    return NextResponse.json({
      success: true,
      guid,
      results,
      message: `Translated ${Object.values(results).filter(v => v === 'ok').length}/${targets.length} languages`,
    });
  } catch (err: any) {
    console.error('[translate] Route error:', err);
    return NextResponse.json({ error: err.message || 'Translation failed' }, { status: 500 });
  }
}
