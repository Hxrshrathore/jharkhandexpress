import { getMappedArticles, getSiteSettings } from '@/lib/db';
import ClientHome from '@/app/ClientHome';
import { parseWaybackDateTime } from '@/lib/wayback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WaybackArticlePage({ params, searchParams }: any) {
  const paramsResolved = await params;
  const searchParamsResolved = await searchParams;
  
  const timestamp = paramsResolved?.timestamp;
  const time = searchParamsResolved?.time || searchParamsResolved?.t;
  const campaign_id = searchParamsResolved?.campaign_id;
  
  const { targetDate, isoString, displayDateString, hasExplicitTime } = parseWaybackDateTime(timestamp, time);

  const parsedCampaignId = campaign_id ? parseInt(campaign_id, 10) : undefined;

  const [dbArticles, globalSettings] = await Promise.all([
    getMappedArticles(100, targetDate),
    getSiteSettings(targetDate, parsedCampaignId)
  ]);
  
  // Find the latest article published ON or BEFORE the simulated timestamp
  const targetDateMs = targetDate.getTime();
  const pastArticles = dbArticles.filter(a => new Date(a.publishedAt).getTime() <= targetDateMs);
  const targetArticle = pastArticles.length > 0 ? pastArticles[0] : dbArticles[0];

  const rawSlug = targetArticle?.slug ? String(targetArticle.slug).replace(/^["']|["']$/g, '').trim() : '';
  const cleanSlug = (rawSlug && rawSlug !== '"') ? rawSlug : (targetArticle?.id ? String(targetArticle.id) : '');
  
  const is_screenshot = searchParamsResolved?.is_screenshot;

  const waybackSettings = {
    ...globalSettings,
    simulated_date: displayDateString || isoString,
    has_explicit_time: hasExplicitTime,
    wayback_base: `/wayback/${decodeURIComponent(timestamp)}`,
    force_ad_campaign_id: campaign_id ? parseInt(campaign_id, 10) : null,
    is_screenshot: is_screenshot === '1' || is_screenshot === 'true',
  };
  
  return (
    <ClientHome 
      initialArticleSlug={cleanSlug} 
      dbArticles={dbArticles} 
      globalSettings={waybackSettings} 
    />
  );
}

