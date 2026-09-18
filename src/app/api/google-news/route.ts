import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_PREFERRED_SOURCE_URL = 'https://www.google.com/preferences/source?q=newswavejharkhand.com';

export async function GET(request: Request) {
  try {
    const settings = await getSiteSettings();

    // 1. If explicit Google News / Preferred Source URL is configured in site_settings
    if (settings?.google_news_url && settings.google_news_url.trim() !== '') {
      return NextResponse.redirect(settings.google_news_url.trim(), 307);
    }

    // 2. Default: Direct Google Preferred Source prompt
    return NextResponse.redirect(DEFAULT_PREFERRED_SOURCE_URL, 307);
  } catch (error) {
    return NextResponse.redirect(DEFAULT_PREFERRED_SOURCE_URL, 307);
  }
}
