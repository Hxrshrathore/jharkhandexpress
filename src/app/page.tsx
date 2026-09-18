import { getMappedArticles, getSiteSettings } from '@/lib/db';
import ClientHome from './ClientHome';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const [dbArticles, globalSettings] = await Promise.all([
    getMappedArticles(100),
    getSiteSettings()
  ]);
  
  return <ClientHome dbArticles={dbArticles} globalSettings={globalSettings} />;
}

