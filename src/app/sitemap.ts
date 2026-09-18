import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';
import { BRAND } from '@/lib/brand';
import { JHARKHAND_DISTRICTS } from '@/lib/jharkhand-districts';

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BRAND.url;

  // 1. Static high-priority pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/category/jharkhand`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/category/politics`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/category/crime`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/business`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/category/sports`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Programmatic 24 District Hubs
  const districtPages: MetadataRoute.Sitemap = JHARKHAND_DISTRICTS.map((d) => ({
    url: `${baseUrl}/district/${d.slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.85,
  }));

  // 3. Dynamic Categories from DB
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await sql`SELECT slug FROM categories ORDER BY name ASC`;
    categoryPages = categories.map((c: any) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Error fetching categories for sitemap:', e);
  }

  // 4. Articles from DB (up to 5,000 top articles)
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await sql`
      SELECT slug, published_at, created_at 
      FROM truth_articles 
      WHERE (expires_at IS NULL OR expires_at > NOW())
      ORDER BY published_at DESC 
      LIMIT 5000
    `;

    articlePages = articles.map((a: any) => ({
      url: `${baseUrl}/article/${a.slug}`,
      lastModified: new Date(a.published_at || a.created_at || new Date()),
      changeFrequency: 'daily',
      priority: 0.75,
    }));
  } catch (e) {
    console.error('Error fetching articles for sitemap:', e);
  }

  return [...staticPages, ...districtPages, ...categoryPages, ...articlePages];
}
