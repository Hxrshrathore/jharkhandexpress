import { permanentRedirect, notFound } from 'next/navigation';
import { getArticleByIdOrSlug } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LegacyRedirectorPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // We only run this on single-segment paths (e.g. /15-20).
  // If it's something clearly static or internal that slipped past middleware, ignore it.
  if (slug.includes('.') || slug.startsWith('_')) {
    notFound();
  }

  // 1. Check if this slug matches a valid article in the database.
  const article = await getArticleByIdOrSlug(slug);

  if (article) {
    // 2. If valid, issue a 301 Permanent Redirect to the correct modern route.
    // This tells Google to update its index and passes all link equity (SEO power).
    permanentRedirect(`/article/${slug}`);
  } else {
    // 3. If no article exists, show a standard 404 page.
    notFound();
  }
}
