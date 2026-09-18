/**
 * Translation system for Jharkhand Express
 *
 * Strategy: TRANSLATE-AT-PUBLISH (not on-demand per user request)
 * ----------------------------------------------------------------
 * - Admin clicks "Translate" when publishing/editing an article
 * - Gemini is called ONCE per article per language (admin action)
 * - Translated content is stored in the `article_translations` DB table
 * - Public readers get translations directly from DB — zero AI calls at read time
 * - This approach uses 1 Gemini call per article × N languages (controlled by admin)
 *   versus unlimited calls if we translated per user request
 *
 * DB Schema required (add via migration):
 *   CREATE TABLE IF NOT EXISTS article_translations (
 *     id          SERIAL PRIMARY KEY,
 *     article_guid TEXT NOT NULL,
 *     lang        TEXT NOT NULL,        -- 'hi', 'bn', 'or', 'te', 'pa'
 *     title       TEXT NOT NULL,
 *     excerpt     TEXT,
 *     content_html TEXT NOT NULL,
 *     created_at  TIMESTAMP DEFAULT NOW(),
 *     UNIQUE (article_guid, lang)
 *   );
 */

import { sql } from './db';
import { SUPPORTED_LANGUAGES, LanguageCode } from './brand';

export type TranslatedArticle = {
  lang: LanguageCode;
  title: string;
  excerpt: string;
  content_html: string;
};

/** Fetch a single stored translation from DB (no AI call) */
export async function getTranslation(
  articleGuid: string,
  lang: LanguageCode
): Promise<TranslatedArticle | null> {
  if (lang === 'en') return null; // English is the source, no translation needed

  try {
    const rows = await sql`
      SELECT lang, title, excerpt, content_html
      FROM article_translations
      WHERE article_guid = ${articleGuid} AND lang = ${lang}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    return rows[0] as TranslatedArticle;
  } catch (err) {
    console.error('[translation] getTranslation error:', err);
    return null;
  }
}

/** Fetch all available translations for an article (for the language selector) */
export async function getAvailableTranslations(
  articleGuid: string
): Promise<LanguageCode[]> {
  try {
    const rows = await sql`
      SELECT lang FROM article_translations WHERE article_guid = ${articleGuid}
    `;
    return (rows || []).map((r: any) => r.lang as LanguageCode);
  } catch (err) {
    console.error('[translation] getAvailableTranslations error:', err);
    return [];
  }
}

/** Store a translation in DB (called by the admin translate API route) */
export async function storeTranslation(
  articleGuid: string,
  lang: LanguageCode,
  title: string,
  excerpt: string,
  content_html: string
): Promise<void> {
  await sql`
    INSERT INTO article_translations (article_guid, lang, title, excerpt, content_html)
    VALUES (${articleGuid}, ${lang}, ${title}, ${excerpt}, ${content_html})
    ON CONFLICT (article_guid, lang) DO UPDATE
      SET title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content_html = EXCLUDED.content_html,
          created_at = NOW()
  `;
}

/** Delete all translations for an article (called when article is deleted) */
export async function deleteTranslations(articleGuid: string): Promise<void> {
  try {
    await sql`DELETE FROM article_translations WHERE article_guid = ${articleGuid}`;
  } catch (err) {
    console.error('[translation] deleteTranslations error:', err);
  }
}

/** Language metadata helper */
export function getLanguageLabel(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.label ?? code;
}

export function getLanguageNativeName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)?.nativeName ?? code;
}
