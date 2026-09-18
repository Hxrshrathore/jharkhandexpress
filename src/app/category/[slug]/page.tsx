import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClientHome from '../../ClientHome';
import { getArticlesByCategory, getMappedArticles, getSiteSettings } from '@/lib/db';
import { sql } from '@/lib/db';
import { BRAND } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Resolve the display name from the categories DB table, or fall back to slug formatting
async function resolveCategoryName(slug: string): Promise<string | null> {
  try {
    const rows = await sql`
      SELECT name FROM categories
      WHERE lower(slug) = lower(${slug})
         OR lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) = lower(${slug})
      LIMIT 1
    `;
    return rows[0]?.name ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const categoryName = await resolveCategoryName(slug);

  const displayName = categoryName ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const categoryUrl = `${BRAND.url}/category/${slug}`;
  const description = `Latest ${displayName} news from Jharkhand — Read accurate, up-to-date coverage on ${BRAND.name}.`;

  return {
    title: `${displayName} News | ${BRAND.name}`,
    description,
    openGraph: {
      type: 'website',
      url: categoryUrl,
      title: `${displayName} News | ${BRAND.name}`,
      description,
      siteName: BRAND.name,
      images: [
        {
          url: `${BRAND.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${displayName} | ${BRAND.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} News | ${BRAND.name}`,
      description,
      images: [`${BRAND.url}/og-image.png`],
      site: '@jharkhandexpress',
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const [categoryArticles, allArticles, globalSettings] = await Promise.all([
    getArticlesByCategory(slug, 100),
    getMappedArticles(100),
    getSiteSettings(),
  ]);

  // If no articles found for this category, return 404
  if (categoryArticles.length === 0) {
    // Check if the category exists at all in the DB — if so, show an empty page
    const categoryName = await resolveCategoryName(slug);
    if (!categoryName) {
      notFound();
    }
  }

  // Merge category-specific articles (deduplicated) with the full article list so
  // ClientHome can render the article detail view for any article clicked from this page.
  const categoryIds = new Set(categoryArticles.map((a) => a.id));
  const mergedArticles = [
    ...categoryArticles,
    ...allArticles.filter((a) => !categoryIds.has(a.id)),
  ];

  // Derive the display name for the initial category filter
  const categoryName = categoryArticles[0]?.category ?? slug.replace(/-/g, ' ');

  return (
    <ClientHome
      dbArticles={mergedArticles}
      globalSettings={globalSettings}
      initialCategory={categoryName}
    />
  );
}
