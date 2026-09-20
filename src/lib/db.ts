import { neon } from '@neondatabase/serverless';
import { unstable_noStore as noStore } from 'next/cache';
import { BRAND } from './brand';

let sqlClient: any = null;

function getSql() {
  if (!sqlClient) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
        return () => [];
      }
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    sqlClient = neon(dbUrl);
  }
  return sqlClient;
}

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  const client = getSql();
  return client(strings, ...values);
}

export async function getSiteSettings(simulatedDate?: Date, forceCampaignId?: number) {
  noStore();
  try {
    const settings = await sql`SELECT * FROM site_settings ORDER BY id DESC LIMIT 1`;
    const settingsRow = settings[0] || null;
    
    if (settingsRow) {
      let ads;
      const effectiveCampaignId = forceCampaignId || settingsRow.force_ad_campaign_id;
      if (effectiveCampaignId) {
        ads = await sql`
          SELECT a.*, c.valid_from, c.valid_to
          FROM site_ads a
          JOIN ad_campaigns c ON a.campaign_id = c.id
          WHERE a.active = true AND c.id = ${effectiveCampaignId}
        `;
      } else {
        if (simulatedDate) {
          const simDateStr = simulatedDate.toISOString();
          ads = await sql`
            SELECT a.*, c.valid_from, c.valid_to
            FROM site_ads a
            JOIN ad_campaigns c ON a.campaign_id = c.id
            WHERE a.active = true 
            AND ${simDateStr} >= c.valid_from 
            AND ${simDateStr} <= (c.valid_to + INTERVAL '1 day')
            ORDER BY c.valid_from DESC
          `;
        } else {
          ads = await sql`
            SELECT a.*, c.valid_from, c.valid_to
            FROM site_ads a
            JOIN ad_campaigns c ON a.campaign_id = c.id
            WHERE a.active = true 
            AND CURRENT_TIMESTAMP >= c.valid_from 
            AND CURRENT_TIMESTAMP <= (c.valid_to + INTERVAL '1 day')
            ORDER BY c.valid_from DESC
          `;
        }
      }
      settingsRow.site_ads = ads;
    }
    
    return settingsRow;
  } catch (error) {
    console.error('Error fetching site_settings:', error);
    return null;
  }
}

// We only need read access to rss_items from articles
export async function getRssItems(limit: number = 20, beforeDate?: Date) {
  noStore();
  try {
    const settings = await getSiteSettings();
    const cutoffDate = settings?.visibility_cutoff_date;

    const beforeDateStr = beforeDate ? beforeDate.toISOString() : null;

    if (cutoffDate) {
      if (beforeDateStr) {
        return await sql`
          SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
          FROM articles
          WHERE published_at <= ${cutoffDate} AND published_at <= ${beforeDateStr} AND (expires_at IS NULL OR expires_at > NOW())
          ORDER BY published_at DESC 
          LIMIT ${limit}
        `;
      } else {
        return await sql`
          SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
          FROM articles
          WHERE published_at <= ${cutoffDate} AND (expires_at IS NULL OR expires_at > NOW())
          ORDER BY published_at DESC 
          LIMIT ${limit}
        `;
      }
    } else {
      if (beforeDateStr) {
        return await sql`
          SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
          FROM articles
          WHERE published_at <= ${beforeDateStr} AND (expires_at IS NULL OR expires_at > NOW())
          ORDER BY published_at DESC 
          LIMIT ${limit}
        `;
      } else {
        return await sql`
          SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
          FROM articles
          WHERE (expires_at IS NULL OR expires_at > NOW())
          ORDER BY published_at DESC 
          LIMIT ${limit}
        `;
      }
    }
  } catch (error) {
    console.error('Error fetching rss_items:', error);
    return [];
  }
}

import { Article } from '@/types';

function calculateReadingTime(html: string): string {
  if (!html) return '1 min';
  const text = html.replace(/<[^>]+>/g, '').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min`;
}

/**
 * Shared row mapper — converts a raw DB row from articles into an Article.
 * Used by getMappedArticles, getArticleByIdOrSlug, and getArticlesByCategory
 * to avoid 3× duplication.
 */
function mapArticleRow(row: any, expiryHours: number, now: Date): Article {
  let finalCategories = Array.isArray(row.categories) ? [...row.categories] : [];

  if (finalCategories.includes('Breaking News') && row.published_at) {
    const publishedAt = new Date(row.published_at);
    const hoursSince = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
    if (hoursSince > expiryHours) {
      finalCategories = finalCategories.filter((c: string) => c !== 'Breaking News');
    }
  }

  return {
    id: String(row.guid || row.id),
    slug: row.slug,
    title: row.title,
    subtitle: row.excerpt?.substring(0, 120),
    excerpt: row.excerpt || '',
    content: row.content_html || '',
    category: finalCategories.length > 0 ? finalCategories[0] : 'News',
    categories: finalCategories,
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: row.author?.name
      ? { id: row.author.name, name: row.author.name, role: 'Staff Writer', avatar: row.author.avatar || '' }
      : { id: BRAND.systemAuthorId, name: BRAND.defaultAuthor, role: 'Desk', avatar: '' },
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : new Date().toISOString(),
    readingTime: calculateReadingTime(row.content_html || ''),
    imageUrl: row.featured_image || '',
    featuredVideo: row.featured_video,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    videoGallery: Array.isArray(row.video_gallery) ? row.video_gallery : [],
    trending: false,
    aiSummary: row.excerpt,
    factCheck: { status: 'Verified', details: `Verified by ${BRAND.name} editorial team.` },
    youtubeVideoId: row.youtube_video_id,
    featuredVideoTimestamp: row.featured_video_timestamp,
  };
}

export async function getMappedArticles(limit: number = 100, beforeDate?: Date): Promise<Article[]> {
  const dbRows = await getRssItems(limit, beforeDate);
  const settings = await getSiteSettings();
  const expiryHours = settings?.breaking_news_expiry_hours || 36;
  const now = new Date();
  
  return dbRows.map((row: any) => mapArticleRow(row, expiryHours, now));
}

export async function getArticleByIdOrSlug(idOrSlug: string, isAdmin: boolean = false): Promise<Article | null> {
  noStore();
  try {
    const settings = await getSiteSettings();
    const cutoffDate = settings?.visibility_cutoff_date;
    const expiryHours = settings?.breaking_news_expiry_hours || 36;
    const now = new Date();

    let res;
    if (cutoffDate) {
      res = await sql`
        SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
        FROM articles
        WHERE published_at <= ${cutoffDate} AND (slug = ${idOrSlug} OR guid::text = ${idOrSlug} OR id::text = ${idOrSlug}) AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
      `;
    } else {
      res = await sql`
        SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
        FROM articles
        WHERE (slug = ${idOrSlug} OR guid::text = ${idOrSlug} OR id::text = ${idOrSlug}) AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1
      `;
    }

    if (!res || res.length === 0) return null;

    const row = res[0];
    // For admin view, don't strip Breaking News; for public, apply expiry
    const effectiveNow = isAdmin ? new Date(0) : now; // epoch = never expire for admin
    const mappedArticle = mapArticleRow(row, expiryHours, effectiveNow);
    // But admin may still want to see the raw categories — restore them
    if (isAdmin) {
      mappedArticle.categories = Array.isArray(row.categories) ? [...row.categories] : [];
      mappedArticle.category = mappedArticle.categories[0] ?? 'News';
    }
    return mappedArticle;
  } catch (error) {
    console.error('Error fetching single article by id/slug:', error);
    return null;
  }
}

export async function getArticlesByCategory(categorySlug: string, limit: number = 50): Promise<Article[]> {
  noStore();
  try {
    const settings = await getSiteSettings();
    const cutoffDate = settings?.visibility_cutoff_date;
    const expiryHours = settings?.breaking_news_expiry_hours || 36;
    const now = new Date();

    // Match category slug or name — categories are stored as text[] in the DB.
    // We match case-insensitively against the slug (dash-separated) and the display name.
    let rows;
    if (cutoffDate) {
      rows = await sql`
        SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video,
               featured_video_timestamp, gallery, video_gallery, categories, tags,
               published_at, author, youtube_video_id, expires_at
        FROM articles
        WHERE published_at <= ${cutoffDate}
          AND (expires_at IS NULL OR expires_at > NOW())
          AND EXISTS (
            SELECT 1 FROM unnest(categories) AS cat
            WHERE lower(regexp_replace(cat, '[^a-zA-Z0-9]+', '-', 'g')) = lower(${categorySlug})
               OR lower(cat) = lower(${categorySlug})
          )
        ORDER BY published_at DESC
        LIMIT ${limit}
      `;
    } else {
      rows = await sql`
        SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video,
               featured_video_timestamp, gallery, video_gallery, categories, tags,
               published_at, author, youtube_video_id, expires_at
        FROM articles
        WHERE (expires_at IS NULL OR expires_at > NOW())
          AND EXISTS (
            SELECT 1 FROM unnest(categories) AS cat
            WHERE lower(regexp_replace(cat, '[^a-zA-Z0-9]+', '-', 'g')) = lower(${categorySlug})
               OR lower(cat) = lower(${categorySlug})
          )
        ORDER BY published_at DESC
        LIMIT ${limit}
      `;
    }

    return rows.map((row: any) => mapArticleRow(row, expiryHours, now));
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return [];
  }
}
