import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const settings = await getSiteSettings();

    // 1. If explicit Google News / Preferred Source URL is configured in site_settings
    if (settings?.google_news_url && settings.google_news_url.trim() !== '') {
      return NextResponse.redirect(settings.google_news_url.trim(), 307);
    }

    // 2. If user requests direct Google preferences
    if (mode === 'preferences') {
      return NextResponse.redirect('https://www.google.com/preferences/source-preferences', 307);
    }

    // 3. Fallback: Official Google News search query for Jharkhand Express
    const fallbackUrl = 'https://news.google.com/search?q=Jharkhand+Express&hl=en-IN&gl=IN&ceid=IN%3Aen';
    return NextResponse.redirect(fallbackUrl, 307);
  } catch (error) {
    return NextResponse.redirect('https://news.google.com/search?q=Jharkhand+Express', 307);
  }
}
