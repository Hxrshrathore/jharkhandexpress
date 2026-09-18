# TRUTH24X7 — COMPLETE TECHNICAL AUDIT REPORT

**Prepared:** 15 September 2026
**Audit Type:** Read-Only Forensic Code & Configuration Review
**Classification:** TECHNICAL RECORD — NOT A LEGAL DOCUMENT

---

> CRITICAL SECURITY NOTICE — FOR IMMEDIATE DEVELOPER ACTION
>
> The file `deployment/server.js` contains live production credentials embedded in plain text.
> This includes DB URL, admin password, R2 keys, all API keys, and OAuth secrets.
> Contents have NOT been reproduced in this report.
> The developer should rotate all credentials as a precaution and investigate whether
> this file has ever been committed to Git. The .gitignore does NOT exclude deployment/.

---

## 1. EXECUTIVE SUMMARY

This report is a read-only forensic technical audit of the Truth24x7 project as it exists
on the developer local workstation (15 September 2026). No project files were modified.

The project is a fully functional Hindi-language news portal deployed at truth24x7.com.
It consists of a Next.js application hosted on AWS EC2 (Mumbai region), using NeonDB
(PostgreSQL), Cloudflare R2 for media, Upstash Redis for caching, and multiple AI/data APIs.

The website has been built and deployed. Evidence of active production use is present
throughout the codebase, database schema calls, the deployed server binary, and 60+ git commits.

Regarding the client Audicity scope document: 14 of 21 items can be assessed as IMPLEMENTED
or PARTIALLY IMPLEMENTED from code evidence. The remaining items are UNCLEAR (require live
verification), NOT IMPLEMENTED in the form described, or outside scope.

Item #20 contains broad language ("any new problem must be addressed and resolved") that
technically encompasses an unlimited range of work categories — documented separately in Section 18.

---

## 2. PROJECT IDENTITY

| Field | Value |
|---|---|
| Project Name | Truth24x7 |
| Website | truth24x7.com |
| Language | Hindi (editorial) / English (admin/UI) |
| Repository | truth24x7media/truth24x7 (GitHub, private) |
| Package | truth24x7 v1.0.0 |
| Admin Dashboard | /admin (password-protected) |
| Contact Email | contact@truth24x7.com |
| Displayed HQ | Truth24x7 Media Tower, New Delhi, India |

---

## 3. VERIFIED TECHNOLOGY STACK

### Frontend
| Technology | Version | Evidence |
|---|---|---|
| Next.js | ^16.3.4 | package.json L37 |
| React | 19.2.8 | package.json L42 |
| TypeScript | ~7.0.2 | package.json L63 |
| Tailwind CSS | ^4.3.3 | package.json L62 |
| shadcn/ui | ^4.19.0 | package.json L48, components.json |
| Radix UI | ^1.6.7 | package.json L41 |
| Motion (Framer) | ^13.1.1 | ClientHome.tsx L4 |
| GSAP | ^3.15.0 | package.json L31, Hero.tsx, SingleArticleView.tsx |
| @gsap/react | ^2.1.2 | package.json L18 |
| Lucide React | ^1.33.0 | Pervasive throughout |
| Recharts | ^3.8.0 | package.json L46 |
| date-fns | ^4.4.0 | package.json L27 |
| Sonner | ^2.0.8 | package.json L50 |

### Backend / Auth
| Technology | Version | Evidence |
|---|---|---|
| Next.js API Routes | — | src/app/api/ |
| Next.js Server Actions | — | admin/articles/new/actions.ts |
| NextAuth.js | ^5.0.0-beta.32 | package.json L38, src/auth.ts |
| Node.js | LTS | deployment/server.js |

### Database
- NeonDB (PostgreSQL serverless): @neondatabase/serverless ^1.1.0
- Tables confirmed from SQL: truth_articles, rss_sources, site_settings, categories,
  site_ads, ad_campaigns, push_subscriptions

### Caching / Rate Limiting
- Upstash Redis: @upstash/redis ^1.38.2
- @upstash/ratelimit ^2.0.8 (fuel/geo endpoints)

### Media Storage
- Cloudflare R2 (via @aws-sdk/client-s3)
- CDN URL: cdn.truth24x7.com

### AI / Content Processing
- Google Gemini: @google/genai ^2.18.0 (primary)
- NVIDIA Llama 3.1 70B via OpenAI SDK (fallback)

### Analytics: Google Analytics 4 (consent-gated)
### Push: web-push ^3.6.7

### External Data APIs
| API | Purpose | Quota Risk |
|---|---|---|
| fuel.indianapi.in | State petrol/diesel prices | 60 req/month (critical) |
| ip-api.com | Visitor geolocation | Free tier |
| Yahoo Finance (unofficial) | NIFTY 50, SENSEX, stocks | No SLA — unofficial |
| Open-Meteo | Weather | Free/open |
| thum.io | Screenshot proofs | External paid |
| google-trends-api | Trending topics | Installed, wiring unconfirmed |

### Email: Nodemailer + Google OAuth2 (Gmail)

### Deployment
| Technology | Purpose |
|---|---|
| AWS EC2 (ap-south-1, Mumbai) | Application hosting |
| PM2 | Node.js process manager |
| Nginx | Reverse proxy (inferred, not in repo) |
| Cloudflare | DNS proxy |
| PowerShell deploy.ps1 | CI/CD deployment with rollback |
| amplify.yml | Present but NOT deployed (CloudFront not used) |

### Image Processing
- sharp ^0.35.4 (server-side → WebP quality 70)
- browser-image-compression ^2.0.2 (client-side before upload)

---

## 4. APPLICATION ARCHITECTURE (FILE MAP)

src/app/
  layout.tsx              — Root layout (GA, fonts, cookie consent)
  page.tsx                — Home server entry point
  ClientHome.tsx          — Main SPA client component (848 lines)
  [slug]/page.tsx         — Legacy URL redirector → /article/[slug] (301)
  article/[slug]/page.tsx — Canonical article page
  contact/page.tsx        — Contact/feedback page
  maintenance/page.tsx    — Maintenance mode page
  privacy/                — Privacy policy
  wayback/[timestamp]/    — Time-machine/archive view
  admin/
    layout.tsx            — Auth-gated shell
    page.tsx              — Dashboard
    login/                — Login
    articles/             — List, new, edit articles
    live/                 — RSS aggregator + source settings
    ads/                  — Ad campaigns + screenshot proofs
    categories/           — Category CRUD
    settings/             — Global settings
    tags/                 — Tags
    youtube/              — YouTube management
    wayback/              — Wayback admin
    support/              — Support
    health/               — Health
  api/
    articles/             — GET all articles
    contact/              — POST → Gmail
    fuel/                 — GET petrol/diesel (Indian API + Redis)
    geo/                  — GET geolocation
    market/               — GET stocks (Yahoo Finance)
    media/upload/         — POST → Cloudflare R2
    process-news/         — POST raw text → Gemini/NVIDIA → Hindi JSON
    push/subscribe/       — POST push subscription
    settings/             — GET/POST site settings
    tags/top/             — GET top tags
    youtube/              — YouTube integration
    admin/
      rss-sources/        — CRUD for RSS sources
      rss-sync/           — POST: fetch feeds → Redis
      rss-timeline/       — GET: read cached timeline
      rss-preview/        — GET: preview feed URL
      ads/                — Ad management
      analytics/omni/     — GA data proxy (7396 bytes)
      categories/         — Category CRUD API
      health/             — Health check

src/components/
  Header.tsx              — Site header (nav, clock, mobile menu)
  TrendingBar.tsx         — Archive filter, topics, weather, fuel
  SingleArticleView.tsx   — Full article (GSAP, social share, related)
  ArticleView.tsx         — Article card
  AdPlacement.tsx         — Ad rendering
  AnalyticsWrapper.tsx    — Consent-gated GA4
  CookieConsent.tsx       — Cookie banner
  CustomVideoPlayer.tsx   — Custom HTML5 player
  MobileNav.tsx           — Mobile nav drawer
  NotificationPrompt.tsx  — Push prompt
  admin/                  — Admin components (Sidebar, Header, MobileDock, etc)
  home/                   — Hero, Ticker, CategorySection, OpinionSection, Sidebar

src/lib/
  db.ts                   — NeonDB client + article queries + reading time
  redis.ts                — Upstash Redis client
  screenshotHelper.ts     — thum.io screenshots + R2 upload
  wayback.ts              — Time-machine logic
  utils.ts                — clsx/cn

src/auth.ts               — NextAuth (single password)
src/types.ts              — TypeScript type definitions

---

## 5. PRODUCTION DEPLOYMENT ARCHITECTURE

Traffic path (VERIFIED):
  Browser
    ↓
  Cloudflare (DNS proxy, DDoS, CDN edge)
    ↓
  AWS EC2 — i-06657c38d0b658da9
    Region: ap-south-1 (Mumbai)
    IP: 13.200.167.8
    User: ubuntu
    App: /var/www/truth-media/current/
    ↓
  Nginx (reverse proxy 80/443 → 3000) [NOT in repo]
    ↓
  PM2 (process manager)
    ↓
  Next.js standalone Node.js (port 3000)
    deployment/server.js

Deployment steps (scripts/deploy.ps1):
  1. npm ci + npm run build → Next.js standalone
  2. Copy to deployment/ folder
  3. ZIP with Python
  4. SCP to EC2 /tmp/
  5. Extract to /var/www/truth-media/releases/<timestamp>/
  6. Switch /var/www/truth-media/current symlink
  7. PM2 restart
  8. HTTP health check
  9. Auto-rollback on failure

Media CDN:
  Bucket: truth-media-nextjs (Cloudflare R2)
  Public URL: cdn.truth24x7.com
  Cache: 1-year TTL, WebP format

NOTE: CloudFront is NOT used. amplify.yml exists but Amplify is not deployed.
NOTE: NeonDB is in ap-southeast-1 (Singapore — Neon infrastructure, not EC2).

---

## 6. DATABASE / STORAGE

NeonDB (PostgreSQL Serverless):
  Provider: Neon (neon.tech)
  Region: ap-southeast-1 (Singapore — Neon's choice)
  Tables: truth_articles, rss_sources, site_settings, categories,
          site_ads, ad_campaigns, push_subscriptions

Cloudflare R2:
  Bucket: truth-media-nextjs
  SDK: @aws-sdk/client-s3 (S3-compatible)
  Compression: WebP quality 70 via sharp
  CDN: cdn.truth24x7.com

Upstash Redis:
  Keys: rss_timeline, rss_sync_report, fuel_prices_all_states, rss_sync_lock
  Purpose: RSS cache (max 300 articles), fuel cache (daily), rate limiting

---

## 7. THIRD-PARTY SERVICES

| Service | Control | Failure Scenario |
|---|---|---|
| AWS EC2 Mumbai | Developer | Site offline |
| NeonDB | Developer (Neon operates) | No articles served |
| Cloudflare R2 | Developer | Images broken |
| Upstash Redis | Developer | RSS/fuel fallback |
| Cloudflare DNS | Shared | Site unreachable |
| Google Analytics 4 | Client owns property | Analytics stop |
| Google Gemini API | Developer API key | AI fails |
| NVIDIA NIM API | Developer API key | AI error |
| fuel.indianapi.in | Developer key (60/mo) | Static fallback |
| ip-api.com | None (free) | Delhi fallback |
| Yahoo Finance | None (unofficial) | Market widget fails |
| Open-Meteo | None (free) | No weather |
| thum.io | Developer key | Screenshot proofs fail |
| Gmail OAuth2 | Developer OAuth app | Contact form silent fail |
| Web Push VAPID | Developer keys | Subscriptions invalid |

---

## 8. ADMIN DASHBOARD

Auth: Single password (ADMIN_PASSWORD env), NextAuth v5 beta, no RBAC

| Route | Function |
|---|---|
| /admin | DB latency, R2 storage, Redis, push subscribers, recent articles |
| /admin/articles | Article list, search, delete |
| /admin/articles/new | AI article creator (raw text → Hindi JSON) |
| /admin/articles/edit/[id] | Edit article |
| /admin/live | RSS timeline + Sync Now |
| /admin/live/settings | RSS source CRUD |
| /admin/ads | Ad campaigns + screenshot proofs (PDF) |
| /admin/categories | Category CRUD |
| /admin/settings | WhatsApp URL, breaking news expiry, maintenance mode |
| /admin/tags | Tags management |
| /admin/youtube | YouTube management |
| /admin/wayback | Wayback tools |
| /admin/health | System health |

---

## 9. NEWS / CONTENT SYSTEM

Article fields (truth_articles): id, guid (unique), title, slug, excerpt,
content_html, featured_image, featured_video, featured_video_timestamp,
gallery[], video_gallery[], categories[], tags[], published_at, author (JSONB),
youtube_video_id, expires_at

Workflow A — AI-Assisted:
  Admin pastes raw text → /api/process-news → Gemini (primary) / NVIDIA (fallback)
  → structured Hindi JSON → admin reviews/edits → upload media → publish

Workflow B — RSS Aggregation:
  Admin clicks Sync Now → /api/admin/rss-sync → fetches active rss_sources
  (max 10/source, max 300 total) → cached in Redis → admin reviews → creates article

Workflow C — Manual:
  Admin writes article manually without AI

Breaking News Expiry:
  Configurable (breaking_news_expiry_hours, default 36h)
  getMappedArticles() in db.ts strips Breaking News category from old articles
  AI requires 2+ categories when assigning Breaking News (preserves other categories post-expiry)

Reading Time: ceil(wordCount / 200) minutes — server-side in db.ts L129-135

Visibility Controls:
  visibility_cutoff_date — show articles only up to this date
  simulated_date — site pretends it is this date (wayback)
  expires_at (per-article) — article disappears after timestamp

---

## 10. CLIENT SCOPE — 21-ITEM COMPARISON

Note: The physical Audicity scope document was not in the repository.
Items are reconstructed from audit prompt description and matched to code evidence.

| # | Requirement | Status | Key Evidence |
|---|---|---|---|
| 1 | News expiry/rotation | IMPLEMENTED | db.ts L140-153; expires_at column; breaking_news_expiry_hours setting |
| 2 | Sync Diagnostics / Failed Sources | IMPLEMENTED | rss-sync/route.ts L89-96: failedSources[], failedCount, successfulCount |
| 3 | Breaking News typography | PARTIALLY IMPLEMENTED | Badge present; flame icon (commit b18b1f5); visual state requires live verification |
| 4 | Article typography | PARTIALLY IMPLEMENTED | Inter + General Sans fonts; cannot confirm exact client spec match |
| 5 | Blank / No Article states | IMPLEMENTED | admin/page.tsx L142-149 empty state with Live Feed redirect |
| 6 | Excessive blank space | PARTIALLY IMPLEMENTED | 5+ spacing fix commits visible; current visual state requires live check |
| 7 | Duplicate news | PARTIALLY IMPLEMENTED | guid field exists; RSS uses guid; DB insert dedup needs addFeedItem review |
| 8 | Reader-controlled news selection | IMPLEMENTED | Category filter, date filter, topic filter, saved articles (localStorage) |
| 9 | Category sections | IMPLEMENTED | CategorySection.tsx; admin CRUD; AI classification uses DB categories |
| 10 | Breaking Update workflow | IMPLEMENTED | AI assigns Breaking News with 2-tag rule; admin can manually set |
| 11 | News Update workflow | IMPLEMENTED | RSS sync → Live Feed review → article create/edit → publish |
| 12 | Feedback | IMPLEMENTED | contact/page.tsx + api/contact/route.ts; Gmail OAuth2 (see note below) |
| 13 | Social media integration | IMPLEMENTED | Share buttons (Twitter/X, FB, WhatsApp); social counter; WhatsApp URL configurable |
| 14 | Dashboard vs Google Analytics | IMPLEMENTED | Custom admin metrics + GA4 + admin/analytics/omni route (GA data proxy) |
| 15 | Hamburger menu | IMPLEMENTED | Header.tsx isMobileMenuOpen; MobileNav.tsx; admin MobileDock |
| 16 | Trending Topics | PARTIALLY IMPLEMENTED | UI exists; 9 Hindi topics HARDCODED (dev comment: will be CMS-driven later) |
| 17 | Mobile/tablet optimization | IMPLEMENTED | 5+ commits: aff2320, 25474fe, d3376d5, 1c2ba15, f84fb1a |
| 18 | Article reading time | IMPLEMENTED | db.ts L129-135: ceil(wordCount/200) min |
| 19 | Category pages | PARTIALLY IMPLEMENTED | Admin CRUD done; public = SPA filter only; no /category/[slug] URL routes |
| 20 | "Any new problem arising..." | N/A — SCOPE RISK | See Section 18. Broad language, unlimited scope as written. |
| 21 | Dashboard date display/interface | IMPLEMENTED | DateTimePicker in admin/settings; simulated/real clock in Header |

Note on #12 (Contact Form): Falls back to mock mode if GOOGLE_REFRESH_TOKEN is
missing/expired. Returns success to user but does NOT send email. Production
state requires live verification.

Note on #16 (Trending Topics): TrendingBar.tsx L53 comment reads:
"Static trending topics — will be CMS-driven later"
google-trends-api is installed in package.json but not wired to the display.

Note on #19 (Category pages): No /category/[slug] route found in src/app/.
Category browsing is SPA-style client filter within homepage.

---

## 11. CURRENT SHIPPED IMPLEMENTATION BASELINE

PUBLIC FEATURES (verified from code):
- Homepage: auto-rotating hero (8s), breaking news ticker, category sections,
  opinion section, sidebar (NIFTY/SENSEX, social counter, ads)
- Articles: reading time, bento gallery, YouTube embed, social sharing, related articles
- Navigation: category nav, mobile hamburger, search modal
- Trending Bar: date archive filter, trending hashtags, weather, fuel prices
- Breaking News: auto-expiry, ticker
- Saved Articles: localStorage bookmarking
- Contact: form at /contact with Gmail delivery
- Cookie Consent: banner; GA4 activates only after consent
- Push Notifications: prompt after 2+ article views or 30s
- Maintenance Mode: admin-toggleable, dedicated page with return time
- Wayback/Archive: /wayback/[timestamp]
- Privacy Policy: /privacy
- Legacy URL Redirect: [slug] → 301 → /article/[slug]

ADMIN FEATURES (verified from code):
- Password-protected CMS dashboard
- AI-assisted article creation (Gemini → structured Hindi JSON)
- Article editing and deletion (with R2 media + YouTube cleanup)
- RSS source management (add/edit/delete/enable/disable)
- RSS feed aggregation (manual trigger) + sync diagnostics
- Category management
- Ad campaign management + screenshot proofs (batch/single, PDF)
- Global settings (maintenance mode, WhatsApp URL, breaking news expiry,
  simulated date, visibility cutoff)
- Push subscriber count, R2 storage usage, DB latency displays
- YouTube video management

---

## 12. GIT / DEVELOPMENT EVIDENCE

Repository: truth24x7media/truth24x7 (GitHub, private)
Branching: feature branches → PRs → "recommit" merge pattern
60+ commits inspected

Earliest commits: fa63eee (Initial commit) → 3ac7ff3 (feat: initialize Truth24x7 platform)

Notable recent commits:
  d704b19 — fix: remove subtitle from article view UI (typography #4)
  9890df7 — fix: ensure invalid_grant errors rethrown from OAuth (contact form #12)
  614891d — fix: prevent hero stretching in fullpage screenshots (ad proofs)
  f84fb1a — fix: mobile horizontal scroll overflow in admin layout (mobile #17)
  879fb47 — refactor: use shadcn/ui in admin settings (settings #21)
  d9a31c3 — fix: format share payload, handle navigator.share (social #13)
  1dab4d7 — fix: navigator.clipboard undefined in webviews (social #13)
  2a67ba3 — feat: show all trending topics + weather widget (trending #16)
  78dd455 — feat: replace geolocation with ticking clock (header #21)
  07cf33c — feat: social media family counter (social #13)
  aff2320 — perf: optimize homepage for mobile (mobile #17)
  25474fe — perf: optimize main content grid for mobile (mobile #17)
  b18b1f5 — fix: show only flame icon on mobile ticker (breaking news #3)

---

## 13. MAINTENANCE VS NEW DEVELOPMENT — CLASSIFICATION

MAINTENANCE / BUG FIX (technical definition):
- Existing feature stops working without requirement change
- Existing API route returns errors
- Existing component crashes or renders incorrectly
- Third-party API changes behavior (RSS feed URL changes, Yahoo Finance blocks)
- SSL certificate renewal
- PM2/Nginx corrections for existing deployment
- DB connection issues on existing NeonDB subscription
- Breaking news expiry behaving unexpectedly (existing feature)
- Contact form email failing due to OAuth token expiry (existing feature)
- Mobile layout regression on already-shipped design
- Reading time calculation errors
- Duplicate articles appearing in existing system

POTENTIAL NEW DEVELOPMENT (technical definition):
- Adding new page/route not in codebase
- CMS-driven trending topics (dev comment: "will be CMS-driven later")
- Dedicated /category/[slug] URL pages (currently SPA filter only)
- New social media platform integrations
- New authentication system or RBAC
- New analytics dashboards beyond current
- Admin-side push notification broadcasting (subscription only is wired)
- New content workflow types (live blogs, polls)
- New language support
- New SEO features (structured data, sitemaps)
- Significant homepage redesign
- Infrastructure migration

UNCLEAR (requires field verification):
- Trending topics: "broken" (maintenance) vs "not yet built" (new dev)?
- Typography visual state vs client specification

---

## 14. CLIENT RESPONSIBILITIES

| Item | Notes |
|---|---|
| Domain registration (truth24x7.com) | Client must renew domain |
| Cloudflare account | If client holds account, DNS is client-controlled |
| Google Analytics property | Client should own GA property |
| Admin panel access | Client has admin credentials |
| Content (articles, images) | Client-controlled via admin |
| WhatsApp group URL | Client controls WhatsApp account |
| RSS source curation | Client may add/remove sources via admin |
| Hosting billing Sep 2026–Sep 2027 | Developer paying (stated, not in code) |

---

## 15. DEVELOPER RESPONSIBILITIES

| Item | Evidence |
|---|---|
| AWS EC2 instance management | SSH key .key/pemkey.pem |
| Application deployment | scripts/deploy.ps1 |
| NeonDB account/subscription | Developer env vars |
| Cloudflare R2 bucket | Developer env vars |
| Upstash Redis account | Developer env vars |
| API keys (Gemini, NVIDIA, Indian API, thum.io) | Developer env vars |
| Google OAuth app (contact + YouTube) | Developer OAuth app |
| VAPID keys for push | scripts/generate_vapid.cjs |
| PM2 process management | Via deploy script |
| SSL certificate | Nginx/Cloudflare level |
| Codebase and version control | Developer holds repo |

---

## 16. HOSTING RESPONSIBILITY

Stated arrangement (from audit prompt, not verifiable from code):
  Developer paying hosting costs
  Period: 1 September 2026 → 1 September 2027

Technical evidence consistent with this:
  EC2 SSH key on developer machine
  All service credentials in developer-controlled accounts
  No client billing references in codebase

Infrastructure costs likely include:
  AWS EC2 (ap-south-1) monthly compute
  NeonDB serverless (usage-based)
  Cloudflare R2 storage + egress
  Upstash Redis (usage-based)
  API subscriptions (Indian API, thum.io, etc.)

Cannot verify: what "hosting" definition includes (API costs, bandwidth, post-2027).

---

## 17. SCOPE AMBIGUITIES REQUIRING WRITTEN CLARIFICATION

A. Trending Topics — Static vs Dynamic
   TrendingBar.tsx L53 comment: "Static trending topics — will be CMS-driven later."
   google-trends-api installed in package.json but not wired to the display.
   Question: Was client shown/promised dynamic Google Trends data?

B. Category Pages — SPA Filter vs Dedicated URLs
   No /category/[slug] routes exist. Filter is SPA client-side only.
   Question: Did client require SEO-indexable category URLs?

C. Dashboard vs Analytics — Exact Scope
   Admin shows infrastructure metrics. analytics/omni/route.ts (7396 bytes) may proxy GA data.
   Question: To what extent was "Dashboard vs Google Analytics" satisfied?

D. RSS Sync — Manual vs Automated
   No automated scheduler in this repository. No cron visible.
   Question: Was automated periodic RSS sync a requirement?

E. Social Media Integration — Scope
   Share buttons + static counter. No API-connected live integrations.
   Question: Did client require API-connected integrations (live counts, cross-posting)?

F. Contact Form — Operational State
   Falls back to mock mode if GOOGLE_REFRESH_TOKEN missing/expired.
   Question: Has contact form been confirmed working in production?

G. Google Analytics — Consent-Gating
   GA4 activates only after cookie consent accepted. Declining = no tracking.
   Question: Is client aware? Do analytics expectations account for consent-rejection gap?

---

## 18. ITEM #20 — SCOPE RISK ANALYSIS

Exact text (from audit prompt):
"Any new problem arising in any website segment, or any issue related to required
changes, must be addressed and resolved by the developer as part of ongoing
website maintenance/support."

Technical analysis — this statement does NOT distinguish between:

Category 1 — Standard Bug Fixes (typically maintenance):
  Existing feature breaks, API errors, component crashes, DB failures

Category 2 — Third-Party Service Changes (potentially maintenance):
  RSS source URL changes, Yahoo Finance blocks scraping, Gemini API changes,
  Indian Fuel API quota exhausted, ip-api.com rate limits, thum.io API changes,
  Google Analytics tracking code changes, Gmail OAuth refresh token expires

Category 3 — Infrastructure Events (ambiguous):
  AWS EC2 OS security patches, SSL renewal, Node.js version unsupported,
  NeonDB pricing model changes, R2 pricing changes, new browser security policies

Category 4 — Scope Creep Risk (potentially new development):
  Client requests new features framed as "fixing a problem"
  UI redesigns framed as "fixing appearance issues"
  New business requirements framed as "required changes"
  New integrations framed as "addressing problems"
  New SEO requirements after algorithm updates
  New browser/OS compatibility requirements
  New Indian data privacy regulatory requirements
  New accessibility requirements

Category 5 — Client-Side Events (outside developer control):
  Client domain lapses, Cloudflare account changes, GA property misconfigured by client,
  WhatsApp group URL changes

Key technical observation:
The phrase "any new problem" does not define:
  1. What is a "problem" vs "missing feature" vs "new requirement"
  2. Expected response time
  3. Number of changes per month included
  4. Whether third-party failures outside developer control are included
  5. Whether client-caused issues are included
  6. Whether post-delivery security vulnerabilities are included
  7. Whether obligation applies equally within and after Sep 2026–Sep 2027 period

This is technically a statement with UNLIMITED SCOPE. It does not impose numerical,
time, category, or cost limits.

---

## 19. MISSING INFORMATION / UNVERIFIABLE

1. Physical Audicity scope document — not in repository
2. Nginx configuration — not in repository
3. PM2 ecosystem file / cron jobs on EC2 — not in repository
4. Production env variable values (.env.production on EC2, not overwritten by deploy)
5. Gmail refresh token active state in production
6. Yahoo Finance API currently returning data (unofficial, no SLA)
7. google-trends-api wired to trending topics in production
8. Original client visual mockups or signed-off design specs
9. Original project contract or agreement
10. Initial project timeline and milestones
11. Whether client has received admin credentials
12. Actual visitor traffic / GA data
13. NeonDB plan type (free vs paid)
14. Domain registrar
15. Whether RSS sync runs automatically on EC2

---

## 20. RECOMMENDED FACTUAL WORDING FOR CLIENT EMAIL

[Note: Not legal advice. Developer or legal advisor should review before sending.]

The Truth24x7 website has been built and deployed as a production Next.js application
at truth24x7.com on an AWS EC2 server in Mumbai, India (as requested). The system includes:

- A public news portal with homepage, article views, breaking news ticker, category sections,
  trending bar, weather widget, fuel price widget, market data widget, social sharing, saved
  articles, archive/date filter, contact form, cookie consent, and web push notifications.

- An admin dashboard with AI-assisted article creation (Google Gemini, NVIDIA fallback),
  RSS feed aggregation with sync diagnostics, article management (create/edit/delete with
  media cleanup), category management, ad campaign management with screenshot proofs, site
  settings (maintenance mode, breaking news expiry, WhatsApp URL), and system health monitoring.

- Media files are stored on Cloudflare R2 and served from cdn.truth24x7.com with 1-year caching.

- Items implemented from the audit document include: news expiry/rotation, sync diagnostics,
  article reading time, category management, breaking news workflow, news update workflow,
  contact/feedback form, social media sharing, analytics integration (GA4), hamburger menu,
  mobile optimization, and admin date/settings controls.

- Trending topics are currently displayed as a static curated list. Dynamic trending topics
  via live Google Trends data are a planned future feature, as noted in the codebase.

- Category browsing operates as a client-side filter. Dedicated category URLs
  (e.g., /category/politics) are not currently implemented.

- The developer is currently responsible for server hosting costs for the period
  1 September 2026 to 1 September 2027.

- Item #20 of the audit document contains language that does not technically distinguish
  between bug fixes in existing features and new development, new integrations, third-party
  service changes, or other categories of work. Written clarification of what categories of
  work are included within this obligation is recommended before this agreement is finalized.

---

## 21. FINAL EVIDENCE SUMMARY

| Finding | Evidence Path | Confidence |
|---|---|---|
| Next.js standalone deployment | next.config.ts L4; deployment/server.js | HIGH |
| AWS EC2 Mumbai (ap-south-1) | scripts/deploy.ps1 L52-53 | HIGH |
| EC2 IP 13.200.167.8 | scripts/deploy.ps1 L53 | HIGH |
| NeonDB PostgreSQL | src/lib/db.ts L1 | HIGH |
| Cloudflare R2 media storage | api/media/upload/route.ts | HIGH |
| Upstash Redis caching | src/lib/redis.ts; api/admin/rss-sync/route.ts | HIGH |
| Gemini AI primary + NVIDIA fallback | api/process-news/route.ts L63, L83 | HIGH |
| Breaking news expiry implemented | src/lib/db.ts L140-153 | HIGH |
| Sync diagnostics (failed sources) | api/admin/rss-sync/route.ts L89-96 | HIGH |
| Reading time calculation | src/lib/db.ts L129-135 | HIGH |
| Contact form with Gmail OAuth2 | app/contact/page.tsx; api/contact/route.ts | HIGH |
| GA4 (consent-gated) | components/AnalyticsWrapper.tsx | HIGH |
| Social sharing (Twitter, Facebook, WhatsApp) | components/SingleArticleView.tsx | HIGH |
| Mobile hamburger menu | components/Header.tsx L24; MobileNav.tsx | HIGH |
| Single-password admin auth | src/auth.ts | HIGH |
| Category management | app/admin/categories/; api/admin/categories/ | HIGH |
| Web push notifications | api/push/subscribe/route.ts; NotificationPrompt.tsx | HIGH |
| Maintenance mode | app/maintenance/page.tsx; api/settings/route.ts | HIGH |
| Wayback/archive feature | app/wayback/[timestamp]/; src/lib/wayback.ts | HIGH |
| Ad campaign management | app/admin/ads/page.tsx | HIGH |
| Screenshot proof generation | lib/screenshotHelper.ts | HIGH |
| Trending topics STATIC (developer noted future task) | TrendingBar.tsx L53 comment | HIGH |
| No dedicated /category/[slug] routes | src/app/ directory listing | HIGH |
| CloudFront NOT used | next.config.ts; deploy.ps1 (no CloudFront refs) | HIGH |
| amplify.yml present but not deployed | amplify.yml exists; deploy.ps1 uses EC2 only | MEDIUM |
| CREDENTIALS IN deployment/server.js | deployment/server.js L18 embedded nextConfig | HIGH — CRITICAL |
| deployment/ NOT gitignored | .gitignore reviewed — deployment/ not excluded | HIGH — CRITICAL |

---

Report compiled from static analysis of D:\KIIT-MUN\truth24x7 on 15 September 2026.
No production environment was accessed. No files were modified.
All findings are based solely on code inspection.