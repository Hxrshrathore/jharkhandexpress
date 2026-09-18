import { NextResponse } from 'next/server';
import { getOAuth2Client, saveTokens } from '@/lib/youtube/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/admin/youtube?error=NoCode', request.url));
  }

  try {
    const oauth2Client = getOAuth2Client();

    const { tokens } = await oauth2Client.getToken(code);
    await saveTokens(tokens);

    return NextResponse.redirect(new URL('/admin/youtube?success=true', request.url));
  } catch (error) {
    console.error('Error during YouTube OAuth callback:', error);
    return NextResponse.redirect(new URL('/admin/youtube?error=AuthFailed', request.url));
  }
}
