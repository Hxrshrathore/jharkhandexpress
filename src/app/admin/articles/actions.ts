'use server';

import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function deleteArticleAction(id: string) {
  try {
    // 1. Fetch the article to get media URLs and Youtube ID
    const res = await sql`
      SELECT featured_image, gallery, youtube_video_id, video_gallery FROM articles WHERE id = ${id} OR id::text = ${id} OR guid::text = ${id} LIMIT 1
    `;

    if (!res || res.length === 0) {
      return { success: false, message: 'Article not found.' };
    }

    const article = res[0];

    // 2. Delete media from Cloudflare R2
    const bucketName = process.env.R2_BUCKET_NAME || 'jharkhand-express';
    const r2PublicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.jharkhandexpress.in';
    const keysToDelete: { Key: string }[] = [];

    const extractKey = (url: string) => {
      if (!url) return null;
      if (r2PublicUrl && url.startsWith(r2PublicUrl)) {
        return url.replace(`${r2PublicUrl}/`, '');
      }
      const match = url.match(/(?:media|ads)\/[^\/?#]+/);
      if (match) return match[0];
      return null;
    };

    if (article.featured_image) {
      const key = extractKey(article.featured_image);
      if (key) keysToDelete.push({ Key: key });
    }

    if (article.gallery && Array.isArray(article.gallery)) {
      article.gallery.forEach((url: string) => {
        const key = extractKey(url);
        if (key) keysToDelete.push({ Key: key });
      });
    }

    if (keysToDelete.length > 0) {
      try {
        await r2.send(new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: keysToDelete,
            Quiet: true,
          }
        }));
      } catch (r2Err) {
        console.error('Error deleting from R2:', r2Err);
      }
    }

    // 3. Delete YouTube video if exists (Option B)
    if (article.youtube_video_id || (article.video_gallery && article.video_gallery.length > 0)) {
      try {
        let oauth2Client: any = null;
        try {
          const { getAuthenticatedClient } = await import('@/lib/youtube/auth');
          oauth2Client = await getAuthenticatedClient();
        } catch {
          const googleClientId = process.env.GOOGLE_CLIENT_ID;
          const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
          const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
          if (googleClientId && googleClientSecret && googleRefreshToken) {
            const { google } = await import('googleapis');
            oauth2Client = new google.auth.OAuth2(googleClientId, googleClientSecret);
            oauth2Client.setCredentials({ refresh_token: googleRefreshToken });
          }
        }
        
        if (oauth2Client) {
          const { google } = await import('googleapis');
          const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
          
          const vidsToDelete = new Set<string>();
          if (article.youtube_video_id) vidsToDelete.add(article.youtube_video_id);
          if (article.video_gallery) {
            article.video_gallery.forEach((v: string) => vidsToDelete.add(v));
          }

          for (const vid of Array.from(vidsToDelete)) {
            try {
              await youtube.videos.delete({ id: vid });
              console.log(`Deleted YouTube video ${vid}`);
            } catch(e) {
              console.error('Failed to delete vid', vid, e);
            }
          }
        }
      } catch (ytErr) {
        console.error('Error deleting from YouTube:', ytErr);
      }
    }

    // 4. Delete from Database
    await sql`DELETE FROM articles WHERE id = ${id} OR id::text = ${id} OR guid::text = ${id}`;

    // 5. Revalidate Paths
    revalidatePath('/');
    revalidatePath('/feed.xml');
    revalidatePath('/feed.json');
    revalidatePath('/admin/articles');

    return { success: true, message: 'Article deleted successfully.' };
  } catch (error) {
    console.error('Error deleting article:', error);
    return { success: false, message: 'Database error during deletion.' };
  }
}
