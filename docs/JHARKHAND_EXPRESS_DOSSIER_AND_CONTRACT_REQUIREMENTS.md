# JHARKHAND EXPRESS MEDIA — TECHNICAL PROJECT DOSSIER AND CONTRACT REQUIREMENTS

**Prepared For:** Harsh Kumar (Independent Software Developer)  
**Client / Business:** Jharkhand Express Media  
**Target Milestone Date:** 20 September 2026  
**Audit & Review Date:** 19 October 2026  
**Document Classification:** Technical Project Dossier & Legal Preparation Brief (Under Applicable Indian Law)  
**Status:** Non-Destructive Forensic Audit & Contractual Requirements Specification  

---

## 1. EXECUTIVE SUMMARY

This dossier provides a comprehensive, evidence-based technical, structural, and commercial project audit of the **Jharkhand Express Media** web platform (`jharkhandexpress.com`). It has been prepared on behalf of **Harsh Kumar**, the independent freelance software engineer who developed the website, to serve as the factual and architectural foundation for drafting a legally enforceable Website Development, Delivery, and Complimentary Hosting Agreement under Indian law.

The primary commercial objective of this dossier is to establish a rigorous, objective baseline of what was developed, configured, and delivered as of the website development milestone date of **20 September 2026**, and to erect enforceable legal and technical safeguards protecting the developer from:
- Uncontrolled scope creep, arbitrary revisions, and retroactive feature demands.
- The dangerous conflation of "free hosting" with indefinite application maintenance, editorial support, server administration, or feature upgrades.
- Vague verbal understandings or one-sided client clauses (such as legacy clauses demanding that *"any new problem arising must be resolved by the developer"*).
- Financial liability or operational exposure resulting from third-party API rate limits, third-party pricing changes, cloud outages, or platform deprecations.
- Client misclassification of the freelance developer as a quasi-employee or salaried technical director.
- Defamation, regulatory, or intellectual property claims arising from news, photographs, advertisements, or editorial statements published by the client.

### Key Audit Findings:
1. **Delivered Architecture:** The system is an enterprise-grade digital news publishing and media wire application built on **Next.js 16 (App Router / Turbopack)**, **React 19**, **Neon Serverless PostgreSQL**, **Cloudflare R2 (S3-compatible)**, **Upstash Redis**, and multi-model AI synthesis (**Google Gemini Flash** primary with **NVIDIA NIM Nemotron** fallback).
2. **Project Evolution & Identity:** The codebase represents a localized, vernacular-ready evolution from an initial news platform foundation. The schema was formalized on 20 September 2026 (commit `b8b487b` renaming the core storage table to `articles`), followed by programmatic 24-district geo-hubs, dynamic category feeds, Google News XML protocols, IndexNow sub-second pinging, YouTube video upload automation, and a specialized advertisement screenshot verification suite for print/display billing proofs.
3. **Delivery Milestone:** The repository confirms 29 git commits on branch `main` in `Hxrshrathore/jharkhandexpress`, with the core production-ready delivery finalized on **20 September 2026** (commits `c540c4c` through `3ab6da3`). Subsequent commits on 16 October 2026 represent component refactoring and performance modularization.
4. **Complimentary Hosting Scope:** The arrangement includes 1 year of complimentary hosting from the development date (20 September 2026 to 19 September 2027). The technical evidence proves that hosting relies on third-party cloud infrastructure (Neon, Cloudflare, Upstash, AWS) and developer-configured accounts. This obligation must be contractually circumscribed to base compute/runtime hosting, strictly excluding maintenance, feature modifications, domain renewal, third-party API quotas, and storage overages.

---

## 2. VERIFIED PROJECT FACTS

The following operational and commercial facts have been verified through forensic inspection of workspace files, git commit histories, configuration manifests, and database initialization scripts:

| Attribute | Verified Value / Current State | Evidentiary Source |
|---|---|---|
| **Project Name** | Jharkhand Express (झारखंड एक्सप्रेस) | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L2; [README.md](file:///d:/KIIT-MUN/jharkhandexpress/README.md) L1; [src/lib/brand.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/brand.ts) L8 |
| **Developer** | Harsh Kumar (Git Author: Harsh Rathore) | Git log commits `fa63eee` through `14961b2` |
| **Client Entity** | Jharkhand Express Media | User Instructions & Workspace Documentation |
| **Primary Domain** | `jharkhandexpress.com` | [src/lib/brand.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/brand.ts) L12; [layout.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/layout.tsx) L40 |
| **Media CDN Domain** | `cdn.jharkhandexpress.in` & Cloudflare R2 public URL | [next.config.ts](file:///d:/KIIT-MUN/jharkhandexpress/next.config.ts) L11; [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/media/upload/route.ts) L24 |
| **Development Date** | **20 September 2026** | Confirmed by sprint commits `c540c4c` through `3ab6da3` (2026-09-20) |
| **Hosting Commitment** | 1 Year Complimentary (20 Sept 2026 – 19 Sept 2027) | Commercial understanding stated in user instructions; requires formal contract |
| **Repository URL** | `https://github.com/Hxrshrathore/jharkhandexpress.git` | `git remote -v` |
| **Active Branch / Commits** | `main` / 29 total commits | `git rev-list --count HEAD` |
| **Current Working Directory** | `D:\KIIT-MUN\jharkhandexpress` | Workspace environment inspection |
| **Website Purpose** | Regional digital news publishing platform covering all 24 districts of Jharkhand with AI editorial assistance, programmatic SEO, dynamic ad placement, and RSS ingestion. | [README.md](file:///d:/KIIT-MUN/jharkhandexpress/README.md) L8-70; [src/app/district/[slug]/page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/district/[slug]/page.tsx) |
| **Administrative Access** | Single password-protected admin portal (`/admin`) without role-based access control (RBAC). | [src/auth.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/auth.ts) L8-18; [src/app/admin/layout.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/layout.tsx) |

---

## 3. TECHNOLOGY STACK AND ARCHITECTURE

### 3.1 Software Composition & Versions

```
                           +------------------------------------------------+
                           |           Visitor / Browser / Mobile           |
                           +-----------------------+------------------------+
                                                   |
                                                   v
                           +------------------------------------------------+
                           |       DNS & Edge CDN / Cloudflare Caching      |
                           +-----------------------+------------------------+
                                                   |
                                                   v
                           +------------------------------------------------+
                           |          Next.js 16.3.4 (App Router)           |
                           |       React 19.2.8 / Node.js LTS Runtime       |
                           +-------+---------------+----------------+-------+
                                   |               |                |
             +---------------------+               |                +---------------------+
             |                                     v                                      |
             v                        +-------------------------+                         v
+-------------------------+           |  Upstash Redis (REST)   |            +-------------------------+
|   Neon PostgreSQL DB    |           |  Feed Timeline & Locks  |            |  Cloudflare R2 Storage  |
|  Serverless Connection  |           +-------------------------+            |  WebP Images & Proofs   |
+-------------------------+                        |                         +-------------------------+
             |                                     v                                      |
             |                        +-------------------------+                         |
             +----------------------->| External APIs & AI Gate |<------------------------+
                                      | • Google Gemini Flash   |
                                      | • NVIDIA NIM Nemotron   |
                                      | • YouTube Data API v3   |
                                      | • Open-Meteo Weather    |
                                      | • Yahoo Finance Stocks  |
                                      | • IndexNow Search API   |
                                      +-------------------------+
```

| Layer | Component / Package | Version | Architectural Role | Evidence Reference |
|---|---|---|---|---|
| **Core Framework** | Next.js | `^16.3.4` | Server-Side Rendering (SSR), Server Components, Server Actions, Route Handlers | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L38 |
| **UI Library** | React & React DOM | `19.2.8` | Client component hydration, hooks, and virtual DOM | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L43, 45 |
| **Language** | TypeScript | `~7.0.2` | Static type checking and interface contracts | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L64 |
| **Styling** | Tailwind CSS & PostCSS | `^4.3.3` | Utility-first responsive CSS styling with Turbopack integration | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L57, 63 |
| **UI Components** | Radix UI & shadcn/ui | `^1.6.7` / `^4.19.0` | Accessible primitives: dialogs, select dropdowns, command menus, date pickers | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L42, 49; [components.json](file:///d:/KIIT-MUN/jharkhandexpress/components.json) |
| **Animations** | GSAP & Framer Motion | `^3.15.0` / `^13.1.1` | Editorial hero transitions, reading progress animations, floating mobile dock | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L32, 37 |
| **Database** | `@neondatabase/serverless` | `^1.1.0` | Serverless PostgreSQL client over HTTP/WebSockets with connection pooling | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L20; [src/lib/db.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/db.ts) L1 |
| **Object Storage** | `@aws-sdk/client-s3` | `^3.1116.0` | S3-compatible interface to Cloudflare R2 bucket (`jharkhand-express`) | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L14; [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/media/upload/route.ts) L5 |
| **Image Optimization** | `sharp` & `browser-image-compression` | `^0.35.4` / `^2.0.2` | Client-side pre-upload downsampling and server-side WebP (Q75) transformation | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L24, 50 |
| **Caching & Rate Limit** | `@upstash/redis` & `@upstash/ratelimit` | `^1.38.2` / `^2.0.8` | Distributed locking for RSS sync, 300-item timeline caching, IP rate limiting | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L22, 23; [src/lib/redis.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/redis.ts) |
| **AI Processing** | `@google/genai` | `^2.18.0` | Primary AI for raw news rewriting, paragraph structuring, and multi-language translation | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L16; [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/process-news/route.ts) L2 |
| **AI Fallback** | `openai` (NVIDIA NIM) | `^7.5.0` | Secondary AI failover using `nvidia/nemotron-3.5-lightning-30b-a3b` | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L41; [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/process-news/route.ts) L96-124 |
| **Video Integration** | `googleapis` (YouTube v3) | `^176.0.0` | Direct YouTube video upload and deletion via OAuth2 refresh tokens | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L31; [actions.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/articles/actions.ts) L70-110 |
| **Push Notifications** | `web-push` | `^3.6.7` | Browser VAPID push notification subscription handling | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L54; [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/push/subscribe/route.ts) |
| **Document Export** | `jspdf` & `html-to-image` | `^4.2.1` / `^1.11.13` | Automated generation of PDF client advertisement billing proofs | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L33, 35; [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/ads/page.tsx) L9 |
| **Authentication** | `next-auth` | `^5.0.0-beta.32` | Administrative session cookie handling via single password credential provider | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L39; [src/auth.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/auth.ts) |

---

## 4. COMPLETE IMPLEMENTED-FEATURE INVENTORY

The following table categorizes all modules identified within the project, distinguishing implemented code from configured or unverified dependencies:

| Feature / Module | Actual Implemented Functionality | Evidentiary File References | Status | Dependencies | Proposed Contract Treatment |
|---|---|---|---|---|---|
| **Homepage Editorial Portal** | Auto-rotating hero carousel (8s interval), breaking news ticker, live clock, weather widget, Jharkhand regional radar, dynamic category grids, and opinion columns. | [ClientHome.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/ClientHome.tsx); [Hero.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/home/Hero.tsx); [Header.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/Header.tsx); [Ticker.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/home/Ticker.tsx) | **Implemented** | Neon DB, Open-Meteo API | **Included Deliverable** |
| **Article Reading Experience** | Server-rendered canonical articles (`/article/[slug]`), estimated reading time calculation, responsive inline bento photo collage, embedded YouTube players, and sticky reading bar. | [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/article/[slug]/page.tsx); [SingleArticleView.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/SingleArticleView.tsx); [BentoMediaCollage.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/BentoMediaCollage.tsx) | **Implemented** | Neon DB, Cloudflare R2 | **Included Deliverable** |
| **Programmatic 24 District Hubs** | Dynamic localized routes for all 24 administrative districts of Jharkhand (`/district/[slug]`) with pre-rendered district metadata, geo-coordinates, and local feeds. | [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/district/[slug]/page.tsx); [jharkhand-districts.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/jharkhand-districts.ts) | **Implemented** | Neon DB | **Included Deliverable** |
| **Dedicated Category Pages** | Server-side category routes (`/category/[slug]`) with dynamic title generation, OpenGraph metadata, and database article querying. | [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/category/[slug]/page.tsx); [src/lib/db.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/db.ts) | **Implemented** | Neon DB | **Included Deliverable** |
| **AI News Processing & Formatting** | Backend endpoint converting unformatted raw news into structured English journalistic articles with calculated paragraph counts, tags, and category assignment. | [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/process-news/route.ts); [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/articles/new/page.tsx) | **Implemented** | Google Gemini API, NVIDIA NIM API | **Included Deliverable** (API usage limits apply) |
| **Multi-Language Translation Engine** | Admin-triggered translation of articles into Hindi, Bengali, Odia, Telugu, and Punjabi using Gemini with persistent storage in `article_translations`. | [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/admin/translate/route.ts); [translation.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/translation.ts) | **Implemented** | Google Gemini API, Neon DB | **Included Deliverable** (Zero public reader API cost) |
| **RSS Wire Ingestion & Sync** | Manual trigger fetching feeds from active RSS media houses, XML sanitization, parsing top 10 items, deduplication, and storing 300 items in Redis cache. | [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/admin/rss-sync/route.ts); [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/live/page.tsx) | **Implemented (Manual)** | Upstash Redis, Third-party RSS feeds | **Included Deliverable** (No automated cron in repo) |
| **Media Upload & Optimization** | Drag-and-drop media uploader converting images to WebP (Q75) via Sharp and uploading to Cloudflare R2 bucket with 1-year cache headers. | [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/media/upload/route.ts); [MediaUploader.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/admin/MediaUploader.tsx) | **Implemented** | Cloudflare R2, Sharp, Node Buffer | **Included Deliverable** |
| **YouTube Media Publishing Pipeline** | Integration uploading video files to YouTube via Data API v3 and capturing poster frames at `featured_video_timestamp` for hover-to-play previews. | [Dashboard.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/youtube/Dashboard.tsx); [actions.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/articles/actions.ts); [Hero.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/home/Hero.tsx) | **Implemented** | Google YouTube Data API v3, Google OAuth2 | **Included Deliverable** (Client Google Quotas) |
| **Ad Campaign & Placement Engine** | Weaving leaderboard (`HP-LEAD-01` to `06`) and rectangle (`HP-REC-01` to `06`) banners into homepage and article paragraphs based on active date ranges. | [AdPlacement.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/AdPlacement.tsx); [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/ads/page.tsx) | **Implemented** | Neon DB (`site_ads`, `ad_campaigns`) | **Included Deliverable** |
| **Ad Screenshot Proof Verification** | Automated full-page rendering via Thum.io with R2 persistence and multi-page PDF export via `jspdf` for advertising client audit proofs. | [screenshotHelper.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/screenshotHelper.ts); [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/screenshot/route.ts); [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/ads/page.tsx) | **Implemented** | Thum.io API, Cloudflare R2, jsPDF | **Included Deliverable** (Thum.io subscription required) |
| **Automated SEO & Knowledge Graph** | JSON-LD schema (`NewsArticle`, `NewsMediaOrganization`), dynamic master sitemap (`/sitemap.xml`), Google News XML sitemap (`/news-sitemap.xml`), and IndexNow endpoint. | [layout.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/layout.tsx); [sitemap.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/sitemap.ts); [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/news-sitemap.xml/route.ts); [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/seo/indexnow/route.ts) | **Implemented** | IndexNow Protocol, Next.js Metadata API | **Included Deliverable** |
| **Contact & Feedback Form** | Public contact form dispatching emails via Nodemailer with Gmail OAuth2 authentication (fails with HTTP 503 if credentials are unconfigured). | [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/contact/page.tsx); [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/contact/route.ts) | **Implemented** | Google OAuth2, Gmail SMTP | **Included Deliverable** (Client OAuth required) |
| **Financial Markets Ticker** | Server-side proxy fetching real-time NIFTY 50 and SENSEX quotes from Yahoo Finance v8 API with 60s cache control. | [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/market/route.ts); [Sidebar.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/home/Sidebar.tsx) | **Configured** | Yahoo Finance (Unofficial scraping API) | **Included Deliverable** (No SLA / May be blocked) |
| **Geolocation Resolution** | Server-side IP lookup resolving visitor city and region via `ip-api.com` with Upstash sliding-window rate limiting. | [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/geo/route.ts) | **Configured** | `ip-api.com` free tier, Upstash Redis | **Included Deliverable** (Best-effort fallback to Delhi) |
| **Web Push Subscriptions** | Service worker registration and VAPID public/private key subscription storage in `push_subscriptions` table. | [route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/push/subscribe/route.ts); [NotificationPrompt.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/NotificationPrompt.tsx) | **Partially Implemented** | Web-Push library, VAPID keys | **Included Deliverable** (Subscriber capture only; broadcast UI excluded) |
| **Admin Maintenance Mode** | Global switch disabling public frontend with custom return countdown timer and HTTP 503 header response. | [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/settings/page.tsx); [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/maintenance/page.tsx) | **Implemented** | Neon DB (`site_settings`) | **Included Deliverable** |
| **Time-Machine Wayback Archive** | Frontend archive filter simulating historic homepage state based on `visibility_cutoff_date` and `simulated_date`. | [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/wayback/[timestamp]/page.tsx); [wayback.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/wayback.ts) | **Implemented** | Neon DB | **Included Deliverable** |
| **Cookie Consent & Analytics Gating** | Persistent cookie consent banner blocking Google Analytics 4 tracking script until explicit visitor acceptance. | [CookieConsent.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/CookieConsent.tsx); [AnalyticsWrapper.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/AnalyticsWrapper.tsx) | **Implemented** | Google Analytics 4 | **Included Deliverable** |
| **Single-Password Admin Auth** | NextAuth v5 credentials provider validating against single server environment variable `ADMIN_PASSWORD`. | [src/auth.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/auth.ts); [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/login/page.tsx) | **Implemented** | NextAuth v5 beta | **Included Deliverable** (Multi-user RBAC excluded) |
| **Admin Mock File Explorer** | Visual desktop file-manager simulation displaying mock brand guides, architecture sheets, and credential templates. | [page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/support/page.tsx) | **Mock UI Only** | Client-side mock state | **Explicitly Excluded** (Not live document storage) |
| **Google Trends Live Feed** | Package `google-trends-api` installed in `package.json` but not wired to dynamic frontend trending badges. | [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json) L30; [TrendingBar.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/TrendingBar.tsx) | **Configured / Unwired** | `google-trends-api` | **Explicitly Excluded** (Hardcoded/recency tags delivered) |

---

## 5. DELIVERABLES AND ACCEPTANCE CRITERIA

### 5.1 Identified Contract Deliverables

1. **Production Web Application:** Complete, deployable Next.js 16 source code containing the public news portal, 24 district portals, category feeds, article views, and administrative dashboard.
2. **Serverless Database Schema:** Configured Neon PostgreSQL relational database including all seed categories, tables (`articles`, `categories`, `site_settings`, `site_ads`, `ad_campaigns`, `article_translations`, `push_subscriptions`, `rss_sources`), indexes, and SQL helper routines.
3. **Media Storage Pipeline:** Configured Cloudflare R2 bucket integration with automated Sharp WebP compression and cache-control headers.
4. **Content Generation Suite:** Configured Google Gemini Flash and NVIDIA NIM API prompt chaining routes for automated news formatting and vernacular translation.
5. **Ad Verification Tool:** Working PDF billing proof generator utilizing Thum.io full-page capture and jsPDF document generation.
6. **SEO Infrastructure:** Fully functional XML sitemaps (`/sitemap.xml`, `/news-sitemap.xml`), RSS feed (`/feed.xml`), `robots.txt`, and IndexNow webhook trigger.

### 5.2 Objective Acceptance Criteria for the Contract

To protect the developer from subjective aesthetic objections or changing client preferences, the agreement must incorporate strict, testable acceptance benchmarks:

```
[Delivery Verification Protocol]
1. Build Verification: `npm run build` executes to completion without fatal TypeScript or linting errors.
2. HTTP Status Check: Root (`/`), Article (`/article/[slug]`), District (`/district/[slug]`), and Admin (`/admin`) return HTTP 200 OK under standard testing conditions.
3. Core Publishing Test: Admin can create an article via `/admin/articles/new`, upload a feature image, save to Neon DB, and verify instant display on the homepage feed.
4. Automated Deletion Test: Admin can delete an article, verifying automatic purge of associated image assets from Cloudflare R2.
5. Deemed Acceptance Clause: Deliverables are deemed conclusively accepted if client fails to submit a consolidated, reproducible defect log within 14 calendar days of handover.
```

*Status of Evidence:* As of the audit date, no formal signed acceptance certificate or written client sign-off document exists in the repository. The agreement must establish a retroactive or confirmatory deemed-acceptance mechanism.

---

## 6. SCOPE BOUNDARIES AND EXCLUSIONS

The agreement must draw an unbreachable perimeter between the completed software deliverables and future ongoing digital services.

### Explicitly Excluded Categories (Out-of-Scope):

1. **Content Creation & Editorial Operations:**
   - Writing, reporting, interviewing, investigative journalism, or rewriting articles.
   - Proofreading, grammatical editing, or legal vetting of news content.
   - Sourcing stock photography, graphic design, video editing, or audio mixing.
   - Ongoing moderation of user comments, contact submissions, or push subscriber notifications.
2. **Third-Party Subscription & License Costs:**
   - Any recurring subscription fees for Google Workspace / Cloud, Gemini AI, NVIDIA NIM, OpenAI, Cloudflare R2 egress overages, Neon PostgreSQL database tier upgrades, Upstash Redis overages, Thum.io screenshot credits, IndianAPI keys, or domain registration renewals.
3. **Search Engine & Traffic Guarantees:**
   - Guarantees of specific Google Search, Google News, or Bing rankings, indexed page counts, or ad revenue/AdSense approvals.
   - Ongoing organic SEO auditing, backlink campaigns, or digital marketing.
4. **Administrative & Feature Extensions:**
   - Development of multi-user Role-Based Access Control (RBAC) (e.g., Sub-editor, Author, Editor-in-Chief roles).
   - Automated push notification broadcast dashboard (mass-sending UI).
   - Live automated background cron workers (e.g., automated 15-minute RSS ingestion without admin trigger).
   - Integration of dynamic Google Trends live scraping.
   - Migration of historical news archives from legacy WordPress sites (`truth24x7.site.je`) beyond the existing seed database.
5. **Security, Compliance & Infrastructure Auditing:**
   - Independent cyber security audits, penetration testing, DDoS defense beyond Cloudflare standard proxy, or digital forensics.
   - Compliance filings with the Ministry of Information & Broadcasting (MIB) under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
6. **On-Site & Emergency Availability:**
   - On-site newsroom visits, hardware support, office networking, or 24/7 on-call technical dispatch.

---

## 7. DEFECT CORRECTION VERSUS ADDITIONAL WORK

To prevent the client from utilizing broad phrasing (*"any new problem must be resolved by the developer"*) to demand perpetual unpaid development, the contract must institute strict contractual definitions:

```
                                  +---------------------------------------+
                                  |         Client Support Request        |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  | Did feature exist in accepted scope?  |
                                  +---------+-------------------+---------+
                                            |                   |
                                       YES  |                   |  NO
                                            v                   v
                     +--------------------------------+   +--------------------------------+
                     | Is code broken or failing its  |   |        NEW FEATURE             |
                     | original functional spec?      |   | • Formal Change Request        |
                     +-------+----------------+-------+   | • Hourly or Fixed Quotation    |
                             |                |           | • Requires Written Approval    |
                        YES  |                |  NO       +--------------------------------+
                             v                v
+---------------------------------+  +---------------------------------+
|        WARRANTY DEFECT          |  |       CHANGE OF INTENT          |
| • Reproducible bug              |  | • Visual redesign               |
| • Free correction within finite |  | • Altered business logic        |
|   warranty period (e.g., 30 d)  |  | • Out-of-scope modification     |
+---------------------------------+  +---------------------------------+
```

### Contractual Classifications:
1. **Reproducible Defect (Warranty Work):** A demonstrable failure of delivered code to perform in substantial accordance with its verified specifications (e.g., an article failing to save due to an unhandled SQL error in `db.ts`). Correctable at developer's cost solely within the finite Warranty Period.
2. **Change of Intent (Billable Modification):** A request to alter the visual layout, styling, font hierarchy, paragraph sorting, or operational flow of an existing, properly functioning feature (e.g., altering the 8-second hero carousel speed, redesigning category pills, or changing ad placement ratios).
3. **New Feature (Out-of-Scope Development):** Any capability, route, database table, or third-party integration not present in the 20 September 2026 codebase (e.g., user login, paywall, newsletter dispatch, live cricket scoreboards).
4. **Third-Party Degradation (External Event):** Failures caused by API quota exhaustion (Gemini, Thum.io), provider structural changes (Yahoo Finance API blocking), browser policy modifications, or upstream cloud downtime (AWS, Neon, Cloudflare). Explicitly excluded from developer liability and billable if remediation is requested.
5. **Client-Induced Fault:** Errors arising from corrupted content, unauthorized administrative configuration, exposed passwords, or external DNS tampering.

### Recommended Defect Correction Window:
A single, finite **Warranty Period of thirty (30) calendar days** commencing upon contract execution or confirmed handover date, after which all developer technical interventions are billable under an hourly or retainer arrangement.

---

## 8. HOSTING INFRASTRUCTURE AND ONE-YEAR HOSTING OBLIGATION

### 8.1 Technical Audit of Current Infrastructure

| Component | Provider & Tier | Administrative Owner | Contractual Reality & Cost Exposure |
|---|---|---|---|
| **Primary Compute / Web Server** | AWS EC2 (Mumbai `ap-south-1`) / Node.js Standalone via PM2 | Developer Account | Server runtime managed by developer. Subject to monthly AWS compute, EBS storage, and data transfer charges. |
| **Serverless Database** | Neon PostgreSQL (`ap-southeast-1`) | Developer Account | Serverless architecture. Free tier has limits on active compute hours, data storage (0.5 GiB default), and read queries. Scaled usage accrues direct developer cost. |
| **Object & Media Storage** | Cloudflare R2 (`jharkhand-express` bucket) | Developer Account | Zero-egress bandwidth model, but storage above 10 GB and Class A/B write/read operations incur charges. |
| **Distributed Caching** | Upstash Redis | Developer Account | Serverless REST tier. Daily message caps apply; exceeding limits throttles RSS caching and IP rate limiting. |
| **DNS, SSL & DDoS Edge** | Cloudflare DNS | Client or Shared | SSL termination provided at Cloudflare edge. Domain nameservers must remain pointed to developer's designated records. |
| **Third-Party APIs** | Google Cloud / Gemini / NVIDIA / Thum.io | Developer Account | Consumptive pay-per-call services. High-volume news publishing or frequent ad proof generation rapidly exhausts free tiers. |

### 8.2 Contractual Formulation of the Complimentary Hosting Obligation

The agreement must translate the informal arrangement into a tightly bounded contractual license:

1. **Term:** Exactly twelve (12) consecutive calendar months commencing retroactively on **20 September 2026** and expiring automatically on **19 September 2027**, unless earlier terminated.
2. **Scope of "Hosting":** Bounded exclusively to providing server runtime compute, network availability to the server edge, and database connectivity.
3. **Usage Fair-Use Caps:**
   - **Monthly Web Traffic / Bandwidth:** Capped at 250,000 page views or 50 GB transfer per month.
   - **Media Storage:** Capped at a maximum of 10.0 GB of compressed media assets within Cloudflare R2.
   - **Database Capacity:** Capped at 1.0 GB of PostgreSQL storage.
4. **Pass-Through & Overage Protocol:** Any third-party costs arising from the client exceeding the Fair-Use Caps, or from high-volume AI generation / screenshot capture, shall be invoiced directly to the client at cost plus a 15% administrative fee.
5. **No Guarantee of Continuous Uptime:** Hosting is provided on a commercially reasonable, "as-is" basis, subject to upstream provider availability (AWS, Neon, Cloudflare). No financial service level credits or liquidated uptime damages apply.
6. **Post-Complimentary Expiration (Post-19 September 2027):**
   - At least 60 days prior to expiration (i.e., on or before 20 July 2027), developer shall provide client with commercial renewal terms for ongoing managed hosting.
   - If client declines renewal, developer's hosting obligation terminates completely on 19 September 2027. Developer shall provide a single raw database dump (`.sql`) and exported media archive (`.zip` or presigned download links) within 14 business days, following which developer may securely decommission all server instances and delete tenant records. Migration to a third-party server is billable as a separate technical engagement.

---

## 9. MAINTENANCE AND SUPPORT BOUNDARIES

The contract must establish a formal Service Level Guideline (SLG) that completely disassociates "hosting" from "free technical labor."

| Dimension | Standard Maintenance Boundary (Complimentary Hosting) | Paid Extended Maintenance Retainer (Optional) |
|---|---|---|
| **Included Monthly Development Hours** | **Zero (0.0) Hours** (All code modifications are billable) | Defined tier (e.g., 5 to 10 hours/month) |
| **Supported Channel** | Single designated email address (`contact@harshkumar.dev` or similar) | Email + Dedicated Slack/WhatsApp Group |
| **Support Hours** | Business Hours: 10:00 AM – 6:00 PM IST (Monday through Friday; excluding public holidays) | Extended Business Hours (10:00 AM – 8:00 PM IST, Monday through Saturday) |
| **Initial Response Window** | Critical Outage: within 12 Business Hours; General Inquiry: within 48 Business Hours | Critical Outage: within 4 Hours; General: within 12 Hours |
| **Acknowledged vs Resolved** | "Response" constitutes written acknowledgement and preliminary triage, NOT guaranteed resolution time. | Triage within target window; resolution based on technical severity. |
| **Scheduled Maintenance Windows** | Off-peak hours (1:00 AM – 5:00 AM IST) with 24 hours prior email notice. | Coordinated maintenance windows. |
| **Excluded Interventions** | Restoring systems after client password compromise, debugging client-modified code, resolving ISP-level DNS propagation, or updating broken external feeds. | Covered under monthly retainer allocation. |

---

## 10. CLIENT RESPONSIBILITIES

The agreement must explicitly impose reciprocal obligations upon Jharkhand Express Media to maintain legal and operational integrity:

1. **Domain Ownership & DNS Continuity:** Client shall maintain registered ownership and timely financial renewal of `jharkhandexpress.com` and ensure DNS records point uninterruptedly to the developer-specified IP / Cloudflare nameservers.
2. **Editorial Legality & Press Regulations:** Client assumes exclusive civil and criminal legal liability for all news reports, headlines, investigative articles, photographs, and user-generated comments published on the platform. Client warrants full compliance with the Press and Registration of Periodicals Act, 2023, and the Digital Media Ethics Code under the Information Technology Rules, 2021.
3. **Intellectual Property Clearances:** Client warrants that all logos, trademarks, press images, wire articles, and advertising copy supplied or published do not infringe third-party copyrights or trademarks.
4. **Credential Security:** Client agrees to safeguard the single administrative password (`ADMIN_PASSWORD`). Any data loss, defacement, or unintended deletion resulting from leaked credentials is the sole liability of the client.
5. **Prompt Defect Notification:** Client must submit defects via written logs containing precise reproduction steps, browser versions, and device specifications within the contractual review period.
6. **Statutory Data Privacy & Consent:** Client warrants that its privacy policy (`/privacy`) and editorial practices comply with the Digital Personal Data Protection Act, 2023 (DPDPA 2023), including proper notices for cookie tracking and push notifications.

---

## 11. INTELLECTUAL PROPERTY AND HANDOVER

### 11.1 Forensic Code Categorization

| Code / Asset Layer | Provenance & Nature | Proprietary Ownership Treatment |
|---|---|---|
| **Bespoke Project Code** | Custom Next.js routes, district hubs (`/district/[slug]`), and ad weaving layout written specifically for Jharkhand Express. | **Client Ownership or Exclusive License**, conditional upon complete payment of all agreed development fees and contract execution. |
| **Developer Pre-Existing Tools** | Reusable deployment automation scripts (`scripts/deploy.ps1`), schema synchronization helpers (`sync_database.cjs`), and generic UI boilerplate. | **Developer Retained Ownership**. Client receives a perpetual, non-exclusive, non-transferable, royalty-free license to use as embedded in the website. |
| **Open-Source Dependencies** | React (MIT), Next.js (MIT), Lucide (ISC), Radix UI (MIT), Tailwind CSS (MIT), Sharp (Apache 2.0). | **Governed by Respective Open-Source Licenses**. No warranties passed through beyond upstream licenses. |
| **Client Assets & Trademarks** | "Jharkhand Express" branding, editorial masthead, logos, and publication content. | **Client Exclusive Ownership**. Developer receives limited license for portfolio demonstration. |

### 11.2 Critical IP Safeguard — Payment Condition Precedent
> **Contract Rule:** *Title, copyright, and intellectual property rights in the bespoke deliverables shall remain vested in the Developer and shall NOT pass to the Client unless and until the Developer has received full, cleared, and unconditional payment of the total agreed development fee.*

---

## 12. COMMERCIAL AND LEGAL RISKS

The following critical unknowns, missing terms, and commercial risks must be resolved prior to drafting the final contract:

| Category | Missing Information / Unconfirmed Term | Legal & Commercial Impact | Specific Question to Resolve |
|---|---|---|---|
| **Party Identity** | Legal structure of Jharkhand Express Media (Sole proprietorship, partnership, LLP, or Pvt. Ltd. company). | An agreement signed with an unregistered trade name lacks corporate personality and is difficult to enforce under Section 10 of the Indian Contract Act. | What is the exact registered legal entity name, CIN/LLPIN/Registration Number, and registered office address of Jharkhand Express Media? |
| **Signatory Authority** | Identity and designation of the person executing the agreement on behalf of the client. | Without corporate authorization (e.g., Board Resolution or Power of Attorney), the contract may be challenged as ultra vires or unauthorized. | Who is the authorized director, partner, or proprietor authorized to sign, and can they furnish proof of signing authority? |
| **Developer Identity** | Full legal name and identity verification of the developer. | Git logs cite "Harsh Rathore" while prompt cites "Harsh Kumar". | What is the developer's formal legal name (as per PAN / Aadhaar) and permanent address for legal notices? |
| **Commercial Fees** | Total contract price, billing milestones, advance received, and outstanding balance. | If the developer has not received full payment, IP assignment must be strictly withheld and hosting subject to suspension. | What was the total agreed development fee, what amount has been paid to date, and what balance remains outstanding? |
| **Taxation & GST** | GST registration status of both parties. | If developer is unregistered (turnover under ₹20 Lakhs threshold), GST is not levied. If registered, reverse charge or forward GST (18% for IT services under SAC 998314) applies. | Is the developer or client registered under GST, and should invoices be issued under GSTIN? |
| **Governing Law & Forum** | Jurisdiction for dispute resolution. | Defaulting to client's location may force the developer to litigate in remote courts. | Shall exclusive jurisdiction lie with the competent courts at the Developer's home city (e.g., Ranchi / Delhi / Bhubaneswar)? |

---

## 13. RECOMMENDED DEVELOPER-PROTECTION CLAUSES

The clause-planning matrix below outlines the specific protections that must be integrated into the forthcoming contract:

| Risk to Developer | Relevant Evidence in Project | Recommended Contractual Protection | Proposed Clause Heading | Information Still Required | Negotiation Status |
|---|---|---|---|---|---|
| **Perpetual Feature Requests** | Broad expectations in legacy scope ("any new problem must be resolved") | Hard scope fence limited strictly to 20 September 2026 commit state. Any additions require formal Change Order. | *Scope of Work & Change Order Procedure* | Client confirmation of accepted feature inventory | Mandatory / Non-negotiable |
| **Free Hosting Scope Creep** | Third-party cloud infrastructure (AWS EC2, Neon, Cloudflare R2) paid by developer | Define hosting as passive runtime compute with specific traffic/storage fair-use caps. Exclude maintenance and third-party fees. | *Complimentary Hosting Terms & Limitations* | Confirmation of AWS / Neon tier limits | Mandatory / Non-negotiable |
| **Third-Party API Disruption** | Heavy dependency on Gemini, NVIDIA, Yahoo Finance, Open-Meteo, Thum.io | Developer expressly disclaims liability for external API outages, rate limits, deprecations, or pricing changes. | *Third-Party Services & API Dependencies* | Current API account billing owner | Mandatory / Non-negotiable |
| **Employee Misclassification** | Extended operational involvement creating presumption of full-time employment | Explicit affirmation of independent contractor status; developer free to engage other clients; no employment benefits. | *Independent Contractor Relationship* | Developer legal business details | Mandatory / Non-negotiable |
| **Defamation & Media Lawsuits** | News publishing across sensitive regional, crime, and political beats | Complete client indemnity protecting developer against criminal defamation, contempt of court, copyright infringement, or IT Act notices. | *Client Content Warranty & Editorial Indemnification* | None (Standard media clause) | Mandatory / Non-negotiable |
| **Financial Over-Exposure** | Absence of liability limitation in informal arrangements | Cap developer's total aggregate liability under any legal theory to the total development fee actually received. | *Limitation of Liability & Exclusion of Consequential Damages* | Total fee amount received | Mandatory / Non-negotiable |
| **Unresponsive Client Approval** | Absence of formal sign-off sheet | Handover deemed accepted if no reproducible defect report is received within 14 calendar days of delivery. | *Delivery, Review & Deemed Acceptance* | Final handover date | Recommended standard |
| **Intellectual Property Dispute** | Bespoke codebase containing developer's proprietary automation tooling | IP transfer conditional on 100% full payment; developer retains ownership of generic utility libraries. | *Intellectual Property Rights & Retention of Know-How* | Payment status confirmation | Mandatory / Non-negotiable |

---

## 14. APPLICABLE INDIAN-LAW CONSIDERATIONS

When finalizing the agreement, the legal drafter must structure provisions in compliance with relevant Indian statutes:

### 1. Contract Enforceability & Electronic Records:
- **Indian Contract Act, 1872 (Sections 10, 73 & 74):** Ensure clear consideration, lawful object, and pre-estimated reasonable liquidated damages. Section 27 prohibits unreasonable restraints of trade—ensure developer's right to build similar websites for other media houses is untrammeled.
- **Information Technology Act, 2000 (Sections 4, 10A & 65B):** Electronic execution via digital signatures (e-Sign/Aadhaar or DocuSign) is legally valid and admissible as an electronic record.

### 2. Copyright Assignment Formalities:
- **Copyright Act, 1957 (Section 19):** In India, an assignment of copyright in software is void unless in writing signed by the assignor. The assignment must specify the exact work, rights assigned, duration, territorial extent (India vs Worldwide), and royalty/consideration. If duration is not specified, it is statutorily presumed to be 5 years; if territory is not specified, it is presumed limited to India.

### 3. Digital Media Regulations & Intermediary Liabilities:
- **Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (Part III):** Applicable to publishers of news and current affairs content. The contract must declare that the Developer is solely a technical solutions vendor and not a publisher, editor, or intermediary under the IT Act, placing all compliance duties (Grievance Redressal Officer, self-regulatory body disclosures) exclusively on the Client.

### 4. Data Protection & Privacy:
- **Digital Personal Data Protection Act, 2023 (DPDPA 2023):** The Client is the **Data Fiduciary** determining the purpose of collecting visitor contact details, push subscriptions, and analytics cookies. The Developer is at most a technical **Data Processor** during setup and has no independent rights in user personal data.

### 5. Execution Formalities & Stamp Duty:
- **Indian Stamp Act, 1899 / Relevant State Stamp Act:** To be admissible in evidence before an Indian court or arbitrator, the agreement must be executed on non-judicial stamp paper of appropriate value (typically ₹100 or ₹500 depending on the state of execution, such as Jharkhand or NCT of Delhi).

---

## 15. MISSING INFORMATION AND QUESTIONS FOR BOTH PARTIES

Prior to drafting the executable contract, the developer and client must furnish written responses to the following schedule of queries:

### For Client (Jharkhand Express Media):
1. **Corporate Verification:** What is the legal name of the entity operating Jharkhand Express Media (e.g., Sole Proprietorship, Partnership Firm, Private Limited Company)? Please provide the Registration Number, PAN, and Registered Office Address.
2. **Authorized Signatory:** What is the full name, designation, and email address of the person authorized to execute this agreement?
3. **Domain Ownership:** Is the domain `jharkhandexpress.com` registered in the name of the client entity?
4. **Third-Party API Accounts:** When will the client assume billing ownership for the Google Cloud (Gemini), Cloudflare, and Thum.io accounts?
5. **Acceptance Confirmation:** Does the client acknowledge and confirm that the website as deployed on 20 September 2026 satisfies the agreed functional scope?

### For Developer (Harsh Kumar):
1. **Contractual Name:** Please confirm your formal legal name as recorded on your PAN card (Harsh Kumar vs. Harsh Rathore) and official postal address.
2. **Commercial Consideration:** What was the agreed contract price for the development of the website, what amount has been received to date, and what is the outstanding balance?
3. **Warranty Duration:** Do you approve a 30-day post-execution defect correction period for reproducible bugs?
4. **Hourly Rate for Extra Work:** What is your standard hourly billing rate (in INR) for new features or maintenance requested outside the agreement?
5. **Hosting Expiration Policy:** Do you intend to offer a paid monthly hosting maintenance retainer after 19 September 2027, or should the agreement specify an automatic migration handover?

---

## 16. PROPOSED CONTRACT SCHEDULE AND ANNEXURES

To ensure structural clarity, the final agreement should be assembled using the following schedule architecture:

- **Main Body:** Terms of engagement, definitions, commercial consideration, delivery and acceptance, intellectual property, representations, warranties, indemnification, limitation of liability, term and termination, dispute resolution, and miscellaneous provisions.
- **Schedule A — Verified Technical Deliverables:** The complete technical specification of the application, components, and schema as frozen on 20 September 2026.
- **Schedule B — Excluded Services & Out-of-Scope Roadmap:** Detailed enumeration of excluded editorial, marketing, and future architectural features.
- **Schedule C — Complimentary Hosting Terms & Fair-Use Policy:** Defined hosting parameters, 1-year term (20 Sept 2026 – 19 Sept 2027), fair-use traffic and storage thresholds, and overage billing schedules.
- **Schedule D — Defect Correction & Support SLA:** Classification of reproducible bugs vs. change requests, support hours, ticket submission guidelines, and target response windows.
- **Schedule E — Change Request Form:** Standardized template for quoting, approving, and executing future billable software enhancements.

---

## 17. EVIDENCE APPENDIX

### A. Core Workspace File References
- **Package Manifest:** [package.json](file:///d:/KIIT-MUN/jharkhandexpress/package.json)
- **Deployment & Standalone Config:** [next.config.ts](file:///d:/KIIT-MUN/jharkhandexpress/next.config.ts); [amplify.yml](file:///d:/KIIT-MUN/jharkhandexpress/amplify.yml)
- **Brand Definition & Metadata:** [src/lib/brand.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/brand.ts)
- **Database Connection & Query Engine:** [src/lib/db.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/db.ts)
- **Administrative Authentication:** [src/auth.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/auth.ts)
- **AI Processing Pipeline:** [src/app/api/process-news/route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/process-news/route.ts)
- **Multi-Language Translation Engine:** [src/app/api/admin/translate/route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/api/admin/translate/route.ts); [src/lib/translation.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/translation.ts)
- **Ad Engine & Screenshot Proofs:** [src/app/admin/ads/page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/admin/ads/page.tsx); [src/lib/screenshotHelper.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/screenshotHelper.ts); [src/components/AdPlacement.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/components/AdPlacement.tsx)
- **Programmatic 24 District Hubs:** [src/app/district/[slug]/page.tsx](file:///d:/KIIT-MUN/jharkhandexpress/src/app/district/[slug]/page.tsx); [src/lib/jharkhand-districts.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/lib/jharkhand-districts.ts)
- **SEO & Sitemaps:** [src/app/sitemap.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/sitemap.ts); [src/app/news-sitemap.xml/route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/news-sitemap.xml/route.ts); [src/app/robots.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/robots.ts); [src/app/feed.xml/route.ts](file:///d:/KIIT-MUN/jharkhandexpress/src/app/feed.xml/route.ts)
- **Database Migration Scripts:** [scripts/sync_database.cjs](file:///d:/KIIT-MUN/jharkhandexpress/scripts/sync_database.cjs); [scripts/init_database.cjs](file:///d:/KIIT-MUN/jharkhandexpress/scripts/init_database.cjs)

### B. Key Git Commit Milestones (Repository: `Hxrshrathore/jharkhandexpress`)
- `9500368` (2026-09-18): Initial commit - Jharkhand Express news and media platform.
- `ffb5b41` (2026-09-18): Redesign view article page and implement smart scroll-up reveal header.
- `c59029e` (2026-09-18): Merge categories into main masthead bar and ensure complete header + sticky reading bar.
- `c540c4c` (2026-09-20): Configure Cloudflare R2 custom domain and update media upload handling.
- `88feb26` (2026-09-20): Fix build: remove hardcoded standalone output mode for Vercel deployment.
- `b8b487b` (2026-09-20): Refactor database: flush database and rename `truth_articles` table to `articles`.
- `ea8d4a4` (2026-09-20): AI feature: configure reasoning budget and chat template kwargs for Nemotron model.
- `3ab6da3` (2026-09-20): Final delivery fix: article media bento grid, mobile header collision, skeleton loader, official WhatsApp icon.
- `56560aa` to `14961b2` (2026-10-16): Post-delivery component modularization and ad management views.
