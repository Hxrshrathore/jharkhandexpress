-- Jharkhand Express: Article Translations Table
-- Run this once against your NeonDB (PostgreSQL) instance.
-- This adds multi-language translation storage without touching truth_articles.

CREATE TABLE IF NOT EXISTS article_translations (
  id           SERIAL PRIMARY KEY,
  article_guid TEXT NOT NULL,
  lang         TEXT NOT NULL,       -- 'hi', 'bn', 'or', 'te', 'pa'
  title        TEXT NOT NULL,
  excerpt      TEXT,
  content_html TEXT NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE (article_guid, lang)
);

CREATE INDEX IF NOT EXISTS idx_article_translations_guid
  ON article_translations(article_guid);

CREATE INDEX IF NOT EXISTS idx_article_translations_lang
  ON article_translations(lang);

-- Verify
SELECT 'article_translations table created successfully' AS status;
