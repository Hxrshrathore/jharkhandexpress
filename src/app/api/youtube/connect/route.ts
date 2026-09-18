import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/youtube/auth';

export async function GET(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/admin/youtube?error=MissingCredentials', request.url));
  }
  
  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
