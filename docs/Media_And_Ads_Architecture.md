# Truth24x7: Intelligent Media & Ads Architecture

This document explains the unified architecture of the Media processing pipeline, the Ad insertion engine, and the Client rendering system in the Truth24x7 platform.

## 1. Overview
The platform seamlessly handles multiple mixed media types (images and YouTube videos) and active Ad Campaigns. The system is designed to intelligently weave these elements into the article's text automatically during content generation, reducing layout shift and maximizing viewability and engagement.

## 2. Media Upload Pipeline
When an editor or author uploads media via the Admin interface (`MediaUploader`):
1. **Images:** Uploaded securely to Cloudflare R2 via presigned URLs.
2. **Videos:** Uploaded automatically to a connected YouTube account using the YouTube Data API v3 to save R2 storage bandwidth and costs. 
3. **Video Thumbnails:** The system automatically extracts 3 distinct frames from the uploaded video.
4. **Featured Video Selection:** If a video is marked as a "Feature Video", the author is prompted to select a specific frame as the poster. The system logs the exact timestamp (e.g., `1m30s`) of this frame and saves it to the Neon DB under `featured_video_timestamp`.

## 3. The AI Weaving Engine (Admin Side)
When the user submits an article, the system coordinates with an AI (Gemini Flash / Llama) to format the raw text into structured HTML paragraphs. 

To ensure the article length perfectly accommodates all active ads and media without crowding, the system uses the following formula to tell the AI exactly how many paragraphs to generate:
`requiredInserts = MediaCount + ActiveAdCount`
The AI is instructed to generate exactly `requiredInserts + 1` paragraphs.

The frontend editor (`new/page.tsx` or `EditClient.tsx`) then prepares an array of placeholders, perfectly alternating between:
- **Media Placeholders:** `<!-- wp:truth/media-placeholder id="X" /-->`
- **Ad Placeholders:** `<!-- wp:truth/ad-slot type="leaderboard|rectangle" /-->`

The system sandwiches these placeholders seamlessly between the AI-generated paragraphs before passing the payload to the backend Server Action.

## 4. Backend Processing (`actions.ts`)
The server action receives the woven HTML string.
1. **Ad Pass-through:** It allows the `<!-- wp:truth/ad-slot -->` comments to remain intact in the HTML, stripping only the temporary admin UI preview tags.
2. **Media Replacement:** It replaces the `media-placeholder` tags with actual HTML elements:
   - For YouTube videos, it outputs a responsive `<figure><iframe src="..."></iframe></figure>`.
   - For images, it outputs a standard `<!-- wp:image --><figure><img src="..." /></figure>`.
3. **Save to DB:** The final `content_html` is written to the Neon Database alongside the `featured_video_timestamp`.
4. **Deletion Sync:** When an article is deleted, the backend automatically queries the R2 storage to delete images and calls the YouTube API to permanently delete all uploaded videos (`video_gallery`) associated with that article to prevent orphaned files.

## 5. Client Rendering Engine
### Article View (`SingleArticleView.tsx`)
When the frontend fetches an article, it checks for explicit Ad placements by splitting the HTML using regex:
- `article.content.split(/(<!-- wp:truth\/ad-slot type=".*?" \/-->)/g)`

It iterates through the split chunks. 
- If a chunk matches an Ad placeholder, it dynamically renders the React `<AdPlacement />` component, which tracks impressions and loads active campaigns from the `site_ads` and `ad_campaigns` database tables. 
- If it's a standard HTML chunk, it securely injects it using `dangerouslySetInnerHTML`. Because the backend already replaced media placeholders with `<iframe>` and `<img>` tags, they render flawlessly inline!

### Hover-to-Play (`Hero.tsx` & `ClientHome.tsx`)
On the homepage, the Hero component and Saved Article cards natively parse the `featured_video_timestamp`.
- By default, it displays the high-quality image poster.
- **On Mouse Hover:** The system instantly dynamically mounts a YouTube iframe passing `?autoplay=1&mute=1&controls=0&start={timestamp_in_seconds}`. This creates a lightweight, interactive "hover-to-play" preview exactly at the chosen featured moment without slowing down initial page loads.
