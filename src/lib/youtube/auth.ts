import { google } from 'googleapis';
import { sql } from '@/lib/db';

export function getOAuth2Client() {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${siteUrl}/api/youtube/callback`
  );
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/analytics.readonly'
    ],
    prompt: 'consent'
  });
}

export async function saveTokens(tokens: any) {
  if (tokens.refresh_token) {
    await sql`DELETE FROM youtube_accounts`;
    await sql`
      INSERT INTO youtube_accounts (channel_id, refresh_token, access_token, updated_at)
      VALUES ('default', ${tokens.refresh_token}, ${tokens.access_token || null}, CURRENT_TIMESTAMP)
    `;
  }
}

export async function clearTokens() {
  await sql`DELETE FROM youtube_accounts`;
}

export async function getAuthenticatedClient() {
  const accounts = await sql`
    SELECT refresh_token FROM youtube_accounts ORDER BY id DESC LIMIT 1
  `;
  
  if (!accounts || accounts.length === 0) {
    throw new Error('YouTube not connected');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: accounts[0].refresh_token
  });

  return oauth2Client;
}
