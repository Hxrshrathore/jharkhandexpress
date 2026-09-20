'use server';

import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import webpush from 'web-push';
import { BRAND } from '@/lib/brand';

export interface FormState {
  success: boolean;
  message: string;
}

export async function addFeedItem(prevState: FormState, formData: FormData): Promise<FormState> {
  const title = formData.get('title') as string;
  const excerpt = formData.get('description') as string;
  const content_html = formData.get('content_html') as string || excerpt;
  const canonical_url = formData.get('link') as string || '';
  
  if (!title || !content_html) {
    return { success: false, message: 'All required core fields must be provided.' };
  }

  // CM-02: Duplication Prevention
  try {
    const duplicateCheck = await sql`
      SELECT id FROM articles
      WHERE (canonical_url = ${canonical_url} AND canonical_url != '')
         OR title = ${title}
      LIMIT 1
    `;
    if (duplicateCheck && duplicateCheck.length > 0) {
      return { success: false, message: 'Duplicate article detected.' };
    }
  } catch (err) {
    console.error('Error checking for duplicates:', err);
  }

  // Receive pre-uploaded media URLs and IDs from the client
  const featured_image = formData.get('featured_image') as string || '';
  const galleryStr = formData.get('gallery') as string;
  const gallery_urls: string[] = galleryStr ? JSON.parse(galleryStr) : [];
  
  const youtubeVideoIdsStr = formData.get('youtube_video_ids') as string;
  const youtubeVideoIds: string[] = youtubeVideoIdsStr ? JSON.parse(youtubeVideoIdsStr) : [];
  
  const featured_video_timestamp = formData.get('featured_video_timestamp') as string || null;
  const featured_video_id = formData.get('featured_video_id') as string || (youtubeVideoIds.length > 0 ? youtubeVideoIds[0] : null);

  const video_gallery_urls: string[] = youtubeVideoIds;

  try {
    const guid = crypto.randomUUID();
    
    // Use the explicitly provided slug (English), or fallback to title stripping
    let baseSlug = formData.get('slug') as string;
    if (!baseSlug) {
      baseSlug = title.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)+/g, '') || guid;
    }

    let slug = baseSlug;
    let isUnique = false;
    let counter = 1;

    // Ensure global uniqueness across articles
    while (!isUnique) {
      const existing = await sql`
        SELECT slug FROM articles WHERE slug = ${slug}
        LIMIT 1
      `;
      
      if (existing && existing.length > 0) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      } else {
        isUnique = true;
      }
    }

    // Advanced Metadata
    const categoriesInput = formData.get('categories') as string || '';
    const tagsInput = formData.get('tags') as string || '';
    const is_breaking = formData.get('is_breaking') === 'true';
    
    let categoriesArray = categoriesInput.split(',').map(c => c.trim()).filter(Boolean);
    
    // CM-03: Simplify Breaking News admin workflow
    if (is_breaking) {
      if (!categoriesArray.includes('Breaking News')) {
        categoriesArray.push('Breaking News');
      }
    }
    
    // Ensure there is at least one category apart from Breaking News
    const otherCategories = categoriesArray.filter(c => c !== 'Breaking News' && c.trim() !== '');
    if (otherCategories.length === 0) {
      categoriesArray.push('News');
    }
    
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const categories = JSON.stringify(categoriesArray.length > 0 ? categoriesArray : ['Uncategorized']);
    const tags = JSON.stringify(tagsArray);
    const gallery = JSON.stringify(gallery_urls);
    const video_gallery = JSON.stringify(video_gallery_urls);
    const author = JSON.stringify({ name: 'Jharkhand Express Desk', email: 'desk@jharkhandexpress.com' });
    const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "NewsArticle" });
    const seo_title = `${title} - Enterprise Feed`;
    const meta_description = excerpt.substring(0, 160);

    let final_content_html = content_html;
    
    // Replace custom UI placeholders and specific MEDIA_PLACEHOLDER markers
    // TinyMCE often modifies inner HTML or attributes, so we match any div with the truth-ad-placeholder class
    final_content_html = final_content_html.replace(/<div[^>]*class="[^"]*truth-ad-placeholder[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

    // Now, replace wp:truth/media-placeholder with the actual uploaded items
    // First we weave Youtube Videos, then Images
    let unusedGalleryUrls = [...gallery_urls];
    let unusedYoutubeIds = youtubeVideoIds.filter(id => id !== featured_video_id); // Don't embed featured twice if it's already top
    
    final_content_html = final_content_html.replace(/<!-- wp:truth\/media-placeholder id="(\d+)" \/-->/g, (match, idStr) => {
       if (unusedYoutubeIds.length > 0) {
         const ytId = unusedYoutubeIds.shift();
         return `<!-- wp:core-embed/youtube {"url":"https://youtu.be/${ytId}"} -->\n<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">\n<iframe width="100%" height="450" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div></figure>\n<!-- /wp:core-embed/youtube -->`;
       } else if (unusedGalleryUrls.length > 0) {
         const imgUrl = unusedGalleryUrls.shift();
         return `<!-- wp:image --><figure class="wp-block-image size-large"><img src="${imgUrl}" alt="" /></figure><!-- /wp:image -->`;
       }
       return match; // If not found, leave as is
    });

    // Automatically append WordPress Gutenberg Gallery Block if there are EXTRA images that didn't get placed
    if (unusedGalleryUrls.length > 0) {
      let galleryHtml = `\n\n<!-- wp:gallery {"linkTo":"none"} -->\n<figure class="wp-block-gallery has-nested-images columns-default is-cropped">\n`;
      for (const url of unusedGalleryUrls) {
        galleryHtml += `<!-- wp:image --><figure class="wp-block-image size-large"><img src="${url}" alt="" /></figure><!-- /wp:image -->\n`;
      }
      galleryHtml += `</figure>\n<!-- /wp:gallery -->`;
      final_content_html += galleryHtml;
    }
    
    // Automatically append leftover youtube videos that didn't fit into placeholders
    if (unusedYoutubeIds.length > 0) {
       for (const ytId of unusedYoutubeIds) {
         final_content_html += `\n\n<!-- wp:core-embed/youtube {"url":"https://youtu.be/${ytId}"} -->\n<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">\n<iframe width="100%" height="450" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div></figure>\n<!-- /wp:core-embed/youtube -->\n\n`;
       }
    }
    
    const published_at_input = formData.get('published_at') as string;
    const published_at = published_at_input ? new Date(published_at_input).toISOString() : new Date().toISOString();

    const youtube_status = formData.get('youtube_status') as string || null;
    const expires_at_input = formData.get('expires_at') as string;
    const expires_at = expires_at_input ? new Date(expires_at_input).toISOString() : null;

    if (featured_video_id) {
       const ytEmbed = `\n\n<!-- wp:core-embed/youtube {"url":"https://youtu.be/${featured_video_id}"} -->\n<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">\n<iframe width="100%" height="450" src="https://www.youtube.com/embed/${featured_video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n</div></figure>\n<!-- /wp:core-embed/youtube -->\n\n`;
       final_content_html = ytEmbed + final_content_html;
    }

    await sql`
      INSERT INTO articles (
        guid, title, slug, excerpt, content_html, featured_image, featured_video, gallery, video_gallery,
        categories, tags, author, canonical_url, seo_title, meta_description, schema, published_at,
        youtube_video_id, youtube_status, expires_at, featured_video_timestamp
      ) VALUES (
        ${guid}, ${title}, ${slug}, ${excerpt}, ${final_content_html}, ${featured_image}, ${null}, ${gallery}::jsonb, ${video_gallery}::jsonb,
        ${categories}::jsonb, ${tags}::jsonb, ${author}::jsonb, ${canonical_url}, ${seo_title}, ${meta_description}, ${schema}::jsonb, ${published_at},
        ${featured_video_id}, ${youtube_status}, ${expires_at}, ${featured_video_timestamp}
      )
    `;

    revalidatePath('/');
    revalidatePath('/feed.xml');
    revalidatePath('/feed.json');
    revalidatePath('/sitemap.xml');
    revalidatePath('/news-sitemap.xml');
    revalidatePath('/admin');
    revalidatePath('/admin/articles');
    revalidatePath(`/article/${slug}`);

    // Instant Sub-Second IndexNow Ping to Search Engines (Bing, Yandex, Seznam, Naver)
    try {
      const articleFullUrl = `${BRAND.url}/article/${slug}`;
      fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: new URL(BRAND.url).host,
          key: 'jharkhandexpress2026seo',
          keyLocation: `${BRAND.url}/jharkhandexpress2026seo.txt`,
          urlList: [articleFullUrl],
        }),
      }).catch(err => console.error('IndexNow async dispatch failed:', err));
    } catch (indexNowErr) {
      console.error('IndexNow trigger error:', indexNowErr);
    }



    // Trigger Push Notifications if broadcast is enabled
    const pushBroadcast = formData.get('pushBroadcast') === 'true';
    if (pushBroadcast) {
      try {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
        const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@jharkhandexpress.com';

        if (vapidPublicKey && vapidPrivateKey) {
          webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
          
          const subscribers = await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions`;
          
          const payload = JSON.stringify({
            title: title,
            body: excerpt.substring(0, 100) + '...',
            icon: featured_image || '/logo.webp',
            url: `/article/${slug}`
          });

          // Send to all subscribers asynchronously
          Promise.allSettled(
            subscribers.map((sub: any) => 
              webpush.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                  }
                },
                payload
              )
            )
          ).then(results => {
            const successful = results.filter(r => r.status === 'fulfilled').length;
            console.log(`Successfully sent push notifications to ${successful}/${subscribers.length} devices.`);
          });
        }
      } catch (err) {
        console.error('Failed to broadcast push notification:', err);
      }
    }

    return { success: true, message: 'ARTICLE ADDED' };
  } catch (error) {
    console.error('Error adding feed item:', error);
    return { success: false, message: 'Database error. Please check configuration.' };
  }
}
