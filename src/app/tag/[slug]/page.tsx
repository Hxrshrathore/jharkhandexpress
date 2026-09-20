import type { Metadata } from 'next';
import ClientHome from '../../ClientHome';
import { getMappedArticles, getSiteSettings } from '@/lib/db';
import { BRAND } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const decodedSlug = decodeURIComponent(slug).replace(/^#/, '');
  const displayName = decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const tagUrl = `${BRAND.url}/tag/${slug}`;
  const description = `Latest #${displayName} news and updates — Read accurate, up-to-date coverage on ${BRAND.name}.`;

  return {
    title: `#${displayName} News | ${BRAND.name}`,
    description,
    openGraph: {
      type: 'website',
      url: tagUrl,
      title: `#${displayName} News | ${BRAND.name}`,
      description,
      siteName: BRAND.name,
      images: [
        {
          url: `${BRAND.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `#${displayName} | ${BRAND.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${displayName} News | ${BRAND.name}`,
      description,
      images: [`${BRAND.url}/og-image.png`],
      site: '@jharkhandexpress',
    },
    alternates: {
      canonical: tagUrl,
    },
  };
}

export default async function TagPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const cleanSlug = decodeURIComponent(slug).replace(/^#/, '');

  const [allArticles, globalSettings] = await Promise.all([
    getMappedArticles(100),
    getSiteSettings(),
  ]);

  return (
    <ClientHome
      dbArticles={allArticles}
      globalSettings={globalSettings}
      initialTopic={cleanSlug}
    />
  );
}
