# Automated YouTube Publishing Architecture

This plan translates the generic architecture provided into the exact technical stack currently used by Truth24x7.

## Current Stack Mapping
- **Framework**: Next.js App Router (`src/app`)
- **Database**: Neon Serverless Postgres (`@neondatabase/serverless` using raw SQL, not Prisma)
- **Object Storage**: S3 Client (`@aws-sdk/client-s3`) is available for video hosting.
- **Queue/Worker**: Since we do not have Redis/BullMQ, we will implement a lightweight database-backed queue polled by an API endpoint, or handle uploads synchronously/asynchronously via Next.js background execution (`unstable_after` or fire-and-forget Promises).

## Open Questions
> [!IMPORTANT]
> 1. **Serverless Timeout**: Next.js on standard Vercel has a 10s-60s timeout. If your videos are large, uploading them through the Next.js backend might time out. We will implement Google's Resumable Upload, but do you want to handle large video uploads directly from the client to YouTube (via presigned tokens) to bypass Vercel limits, or is standard backend uploading fine for now?
> 2. **Google Cloud Credentials**: You will need to create the Google Cloud project and OAuth credentials as per your guide. Once you have `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, you'll add them to `.env.local`. Should I proceed to scaffold the code assuming these will be provided later?

## Proposed Changes

### Database Schema Updates
We will modify `setup_db.mjs` and run it to update your Neon database:
# Screenshot & Ad Mapping Integration (Temporary Solution)

Based on your constraints (we cannot alter the main news tables because they are hooked to other services, and WP is being replaced), this plan uses a **non-destructive temporary solution** to handle visibility filtering and ad mapping entirely within the Next.js frontend layer.

## Proposed Solution

1. **Global Settings Table (No touch to main tables)**: 
   We will create a new, separate table called `site_settings` in your Neon database. This table will hold global UI states like `visibility_cutoff_date`, `simulated_date`, `ad1_url`, and `ad2_url`.
2. **Dynamic Frontend Filtering**: 
   We will modify the database query in `src/lib/db.ts`. If a `visibility_cutoff_date` is set in the settings, the query will automatically append a `WHERE published_at <= cutoff` clause. This temporarily hides the news *only* on the frontend for the screenshot, without modifying any actual news records.
3. **Screenshot Generation**: 
   Since WordPress is being replaced, we will implement the Thum.io screenshot logic directly in Next.js. The Admin Dashboard will trigger the screenshot and save it to your Cloudflare R2 bucket.

## Proposed Changes

### Database Setup
#### [MODIFY] [setup_db.mjs](file:///d:/KIIT-MUN/truth24x7/setup_db.mjs)
- Create a `site_settings` table to store temporary UI states.
- Insert a default row with null values.

### API & Data Fetching
#### [MODIFY] [src/lib/db.ts](file:///d:/KIIT-MUN/truth24x7/src/lib/db.ts)
- Modify `getRssItems()` to first check `site_settings`. If a cutoff date is active, dynamically filter the query.
- Add a new helper `getSiteSettings()` to fetch global ad configurations.

### Admin Dashboard Updates
#### [NEW] [src/app/admin/screenshot/page.tsx](file:///d:/KIIT-MUN/truth24x7/src/app/admin/screenshot/page.tsx)
- Create a new "Screenshot & Ads" page.
- Add fields for `ad1_url`, `ad2_url`, and `simulated_date`.
- Add a date picker to set the "Hide posts after" date.
- Add a "Take Screenshot" button that hits Thum.io and uploads the result to R2.

### Frontend Ad Mapping
#### [MODIFY] [src/app/page.tsx](file:///d:/KIIT-MUN/truth24x7/src/app/page.tsx) or Layout
- Fetch `getSiteSettings()` on the server side and pass the dynamic `simulatedDate`, `ad1_url`, and `ad2_url` down to the `AdPlacement` components instead of using hardcoded mock data.

## Verification Plan
1. **Visibility Toggle**: Ensure setting a cutoff date hides newer posts on the frontend news grid, and clearing it restores them, without altering the main tables.
2. **Screenshot Capture**: Ensure clicking "Take Screenshot" captures a full-page image of the frontend via Thum.io and uploads it to Cloudflare R2.
3. **Ad Expiration**: Verify that changing the global `simulated_date` and Ad URLs in the new admin panel instantly reflects on the frontend ads.
