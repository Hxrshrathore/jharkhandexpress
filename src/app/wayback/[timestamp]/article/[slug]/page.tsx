import { getMappedArticles, getArticleByIdOrSlug, getSiteSettings } from '@/lib/db';
import ClientHome from '@/app/ClientHome';
import { parseWaybackDateTime } from '@/lib/wayback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WaybackArticleSlugPage({ params, searchParams }: any) {
  const paramsResolved = await params;
  const searchParamsResolved = await searchParams;
  
  const timestamp = paramsResolved?.timestamp;
  const slug = paramsResolved?.slug;
  const time = searchParamsResolved?.time || searchParamsResolved?.t;
  const campaign_id = searchParamsResolved?.campaign_id;
  
  const { targetDate, isoString, displayDateString, hasExplicitTime } = parseWaybackDateTime(timestamp, time);

  const [articles, directArticle, globalSettings] = await Promise.all([
    getMappedArticles(100, targetDate),
    slug ? getArticleByIdOrSlug(slug) : Promise.resolve(null),
    getSiteSettings(targetDate)
  ]);
  
  if (directArticle && !articles.find((a: any) => a.id === directArticle.id || a.slug === directArticle.slug)) {
    articles.unshift(directArticle);
  }

  const waybackSettings = {
    ...globalSettings,
    simulated_date: displayDateString || isoString,
    has_explicit_time: hasExplicitTime,
    wayback_base: `/wayback/${decodeURIComponent(timestamp)}`,
    force_ad_campaign_id: campaign_id ? parseInt(campaign_id, 10) : null
  };

  return (
    <ClientHome 
      initialArticleSlug={slug} 
      dbArticles={articles} 
      globalSettings={waybackSettings} 
    />
  );
}
