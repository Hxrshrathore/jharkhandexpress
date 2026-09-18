import { NextResponse } from 'next/server';
import { getAuthenticatedClient, clearTokens } from '@/lib/youtube/auth';

export async function POST(request: Request) {
  try {
    const { title, description, tags } = await request.json();

    const auth = await getAuthenticatedClient();
    const token = await auth.getAccessToken();
    if (!token.token) {
      throw new Error('Failed to get access token');
    }

    const url = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';
    
    const metadata = {
      snippet: {
        title: title || 'New Video',
        description: description || '',
        tags: tags || [],
        categoryId: '25'
      },
      status: {
        privacyStatus: 'unlisted'
      }
    };

    const origin = request.headers.get('origin') || '*';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*',
        'Origin': origin,
      },
      body: JSON.stringify(metadata)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to init resumable upload:', errorText);
      return NextResponse.json({ error: 'Failed to initialize upload' }, { status: 500 });
    }

    const uploadUrl = res.headers.get('location');

    if (!uploadUrl) {
      return NextResponse.json({ error: 'No location header returned' }, { status: 500 });
    }

    return NextResponse.json({ uploadUrl });

  } catch (error: any) {
    console.error('Error generating upload URL:', error);
    
    const isNotConnected = error.message === 'YouTube not connected';
    const isInvalidGrant = error.message && (error.message.includes('invalid_grant') || error.message.includes('Token has been expired or revoked'));
    
    if (isNotConnected || isInvalidGrant) {
      if (isInvalidGrant) {
        try {
          await clearTokens(); // Purge expired tokens from DB to force reconnect
        } catch (e) {
          console.error("Failed to clear expired tokens:", e);
        }
      }
      return NextResponse.json({ error: 'NotConnected' }, { status: 401 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
