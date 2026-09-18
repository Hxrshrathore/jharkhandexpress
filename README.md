# Jharkhand Express (झारखंड एक्सप्रेस)

> **The Premier Digital News & Media Wire Platform for Jharkhand**  
> *Real stories, investigative reporting, regional governance, and ground realities from the heart of India.*

---

## 📖 Overview

**Jharkhand Express** is an enterprise-grade digital news publishing platform engineered specifically to deliver fast, authoritative, and verified regional coverage across all 24 districts of Jharkhand. Built on Next.js 16 (Turbopack) with a serverless cloud backend powered by **Neon PostgreSQL**, **Cloudflare R2**, and **Google Gemini AI**, Jharkhand Express delivers sub-second page loads, automated vernacular translations, and an intelligent ad-weaving monetization engine.

---

## ⚡ Key Highlights & Core Capabilities

### 1. Modern Media House Architecture
- **Framework**: Next.js 16 with App Router, React Server Components, and Turbopack compiler.
- **Database**: Neon Serverless Lakebase PostgreSQL with connection pooling, zero-latency branching, and JSONB handling.
- **Styling & Aesthetics**: High-end modern layout featuring **Plus Jakarta Sans** (sans-serif), **Newsreader** (editorial serif), and signature palette:
  - **Midnight Navy** (`#0B132B`)
  - **Forest Emerald** (`#0D5C46`)
  - **Express Crimson** (`#E63946`)
  - **Warm Paper Canvas** (`#FAF9F6`)
- **Storage & Media Delivery**: Cloudflare R2 for zero-egress image CDN and direct integration with Google YouTube Data API v3 for high-efficiency video distribution.
- **Caching & Real-Time Sync**: Upstash Redis for distributed locks, live market index ticker, and RSS feed ingestion.

---

### 2. The "SEO God" Search Dominance Engine

Jharkhand Express incorporates a white/grey-hat tactical SEO architecture designed to outrank legacy state dailies (*Prabhat Khabar, Dainik Bhaskar, Dainik Jagran, The Telegraph*) across Google Search, Google News, Discover, and AI search engines (Perplexity, Gemini, ChatGPT):

| SEO Component | Technology / Route | Strategic Advantage |
| :--- | :--- | :--- |
| **Sub-Second Indexation** | `api.indexnow.org` & `/api/seo/indexnow` | Instantly notifies Bing, Yandex, Seznam, and Naver whenever an article is published or modified. |
| **Google News XML Protocol** | `/news-sitemap.xml` | Conforms strictly to Google News standards, filtering articles published in the last 48 hours with 15-minute revalidation. |
| **Dynamic Master Sitemap** | `/sitemap.xml` | Automatically compiles static landing pages, categories, 24 district geo-silos, and up to 5,000 articles. |
| **Crawl Budget Optimization** | `/robots.txt` | Grants priority access to Googlebot, Googlebot-News, Bingbot, GPTBot, and PerplexityBot while locking down admin routes. |
| **Full Knowledge Graph Schema** | JSON-LD `@graph` in `/article/[slug]` & `layout.tsx` | Injects `NewsArticle`, `NewsMediaOrganization` (linked to Wikidata `Q1199` and `Q1070`), `BreadcrumbList`, and `ImageObject`. |
| **Generative Engine Optimization (GEO)** | Semantic `.key-takeaways` & `SpeakableSpecification` | Fact-dense synthesized bullet points matching Google's **Information Gain** patent and feeding AI Overviews and Voice Search. |
| **Programmatic 24-District Geo-Silos** | `/district/[slug]` | Dedicated, pre-rendered hyper-local hubs for all 24 Jharkhand districts with custom `AdministrativeArea` and `FAQPage` rich snippets. |
| **Multilingual Vernacular Triangulation** | `/lib/translation.ts` & DB cache | Clean localized routes (`/hi/article/...`) with bidirectional `<link rel="alternate" hreflang="..." />` tags to capture high-volume vernacular search traffic. |

---

### 3. Programmatic 24 Districts of Jharkhand

The platform automatically maintains dedicated hub pages, datelines, and article feeds for every administrative district in Jharkhand:

```
Ranchi • Dhanbad • East Singhbhum (Jamshedpur) • Bokaro • Deoghar • Hazaribagh
Giridih • Ramgarh • Palamu • Dumka • Godda • Garhwa • Latehar • Chatra
Koderma • Jamtara • Sahibganj • Pakur • Lohardaga • Gumla • Khunti • Simdega
West Singhbhum (Chaibasa) • Saraikela Kharsawan
```

---

### 4. Intelligent Media & Monetization Pipeline

- **Auto-Cascading Ad Architecture**:
  - Six desktop leaderboard banners (`HP-LEAD-01` through `HP-LEAD-06`) and six sidebar medium rectangles (`HP-REC-01` through `HP-REC-06`).
  - Automatic mathematical assignment evenly divides active campaigns across slots with zero layout shift.
  - Interactive auto-play carousel with pause-on-hover and progress micro-indicators.
- **Article In-Text Media Weaving**:
  - The AI engine generates articles formatted into calculated paragraph chunks, interleaving responsive `<figure>` embeds, YouTube player components, and leaderboard banners seamlessly.
- **Hover-to-Play Video Timestamps**:
  - Lightweight preview engine parses `featured_video_timestamp` to jump directly to the exact highlight moment on mouse hover without blocking initial page load.

---

## 🛠️ Tech Stack

- **Runtime & Framework**: [Next.js](https://nextjs.org/) 16.3+ (Turbopack) & [React](https://react.dev/) 19
- **Database**: [Neon Postgres](https://neon.tech/) Serverless SQL driver (`@neondatabase/serverless`)
- **Styling**: Vanilla CSS, Tailwind CSS, Lucide Icons, Framer Motion (`motion/react`), GSAP & ScrollTrigger
- **Cloud Storage**: AWS S3 SDK (`@aws-sdk/client-s3`) configured for [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)
- **AI & Processing**: Google Gen AI SDK (`@google/genai`), Google Gemini Flash
- **Video & APIs**: Google APIs (`googleapis`) YouTube Data API v3
- **Push Notifications**: Web-Push (`web-push`) VAPID protocol
- **Caching**: `@upstash/redis`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm or pnpm
- A Neon PostgreSQL database instance

### 1. Clone & Install
```bash
git clone https://github.com/Hxrshrathore/jharkhandexpress.git
cd jharkhandexpress
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and populate the credentials:

```bash
cp .env.example .env.local
```

Key environment variables:
```env
# Neon Database Pooler Connection URL
DATABASE_URL=postgresql://<user>:<password>@<host>-pooler.neon.tech/<dbname>?sslmode=require

# Cloudflare R2 Storage (Media Uploads)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=https://your-r2-public-domain.r2.dev

# Google AI Studio (Content Generation & Translation)
GEMINI_API_KEY=your_gemini_api_key

# Web Push Notifications (Optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@jharkhandexpress.com

# Upstash Redis (Optional for live feeds)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 3. Initialize Database Schema
Run the automated schema synchronization script to ensure all tables, indexes, and constraints exist in your Neon database:

```bash
node scripts/sync_database.cjs
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📋 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack. |
| `npm run build` | Compiles the production build, runs TypeScript validation, and pre-renders static pages. |
| `npm run start` | Runs the compiled production server. |
| `node scripts/sync_database.cjs` | Synchronizes database tables, columns, indexes, and custom SQL functions with Neon. |
| `node scripts/check_ads_status.cjs` | Inspects active ad campaigns, date validities, and slot allocations. |
| `node scripts/test_queries.cjs` | Runs an end-to-end audit test of all SQL queries used across the codebase. |

---

## 📂 Project Architecture

```
jharkhandexpress/
├── public/                     # Static brand assets, logos, favicons, IndexNow key
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Editorial dashboard (articles, ads, categories, live RSS)
│   │   ├── api/                # API routes (IndexNow, translations, push, media uploads)
│   │   ├── article/[slug]/     # Single article view with full JSON-LD news graph
│   │   ├── category/[slug]/    # Topical category feeds (Politics, Crime, Business, etc.)
│   │   ├── district/[slug]/    # Programmatic 24-district geo-hubs
│   │   ├── feed.xml/           # RSS 2.0 Feed endpoint
│   │   ├── news-sitemap.xml/   # Google News 48-hour XML sitemap
│   │   ├── robots.ts           # Dynamic robots.txt generator
│   │   ├── sitemap.ts          # Master XML sitemap generator
│   │   ├── layout.tsx          # Root layout with sitewide NewsMediaOrganization schema
│   │   └── page.tsx            # Homepage server component
│   ├── components/             # Reusable UI components
│   │   ├── home/               # Homepage sections (Hero, Radar, Categories, Opinion, Sidebar, Ticker)
│   │   ├── Header.tsx          # Masthead with dateline, weather, and edition switcher
│   │   ├── SingleArticleView.tsx # Article layout with GEO Key Takeaways box
│   │   └── AdPlacement.tsx     # Intelligent auto-cascading ad slot renderer
│   └── lib/                    # Shared libraries and utilities
│       ├── brand.ts            # Central branding tokens, URLs, and social metadata
│       ├── db.ts               # Neon PostgreSQL client and query helpers
│       ├── jharkhand-districts.ts # 24 districts registry and geographic metadata
│       └── translation.ts      # Multi-language translation layer and DB cache
└── scripts/                    # Database migrations and diagnostics
```

---

## 🔒 Security & Editorial Best Practices

- **Strict Server Actions**: Database modifications and file deletions are executed via Next.js Server Actions with server-side validation.
- **E-E-A-T Adherence**: Every article attributes real editorial personas, datelines, and clear timestamps for journalistic transparency.
- **Zero Third-Party Ad Script Bloat**: Ad campaigns are served directly from first-party Cloudflare R2 storage without heavy tracking scripts, ensuring 100/100 Core Web Vitals.

---

## 📄 License

Proprietary © 2026 Jharkhand Express. All rights reserved.
