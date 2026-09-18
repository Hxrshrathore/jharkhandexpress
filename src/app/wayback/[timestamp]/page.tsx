import { getMappedArticles, getSiteSettings } from '@/lib/db';
import ClientHome from '@/app/ClientHome';
import { parseWaybackDateTime } from '@/lib/wayback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WaybackPage({ params, searchParams }: any) {
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
  
  const is_screenshot = searchParamsResolved?.is_screenshot;

  // Inject the wayback time and campaign without modifying the actual DB
  const waybackSettings = {
    ...globalSettings,
    simulated_date: displayDateString || isoString,
    has_explicit_time: hasExplicitTime,
    wayback_base: `/wayback/${decodeURIComponent(timestamp)}`,
    force_ad_campaign_id: campaign_id ? parseInt(campaign_id, 10) : null,
    is_screenshot: is_screenshot === '1' || is_screenshot === 'true',
  };
  
  return <ClientHome dbArticles={dbArticles} globalSettings={waybackSettings} />;
}

