import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JHARKHAND_DISTRICTS, getDistrictBySlug } from '@/lib/jharkhand-districts';
import { getMappedArticles, getSiteSettings, sql } from '@/lib/db';
import { BRAND } from '@/lib/brand';
import Header from '@/components/Header';
import { Clock, MapPin, ChevronRight, TrendingUp, Users, Compass } from 'lucide-react';

export const revalidate = 300; // 5 min cache

export async function generateStaticParams() {
  return JHARKHAND_DISTRICTS.map((d) => ({
    slug: d.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    return {
      title: `District News | ${BRAND.name}`,
    };
  }

  const title = `${district.name} News Today: Breaking Headlines & Local Updates`;
  const description = `Live ${district.name} (${district.hindiName}) news, administrative orders, police dispatches, civic updates, and investigative stories from ${district.name}, Jharkhand.`;
  const canonicalUrl = `${BRAND.url}/district/${district.slug}`;

  return {
    title: `${title} | ${BRAND.name}`,
    description,
    keywords: [...district.keywords, `${district.name} news`, `${district.name} samachar`, 'Jharkhand local news'],
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `${title} | ${BRAND.name}`,
      description,
      siteName: BRAND.name,
      images: [
        {
          url: `${BRAND.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${district.name} News — ${BRAND.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${BRAND.name}`,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function DistrictPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const district = getDistrictBySlug(slug);

  if (!district) {
    notFound();
  }

  const [articles, globalSettings] = await Promise.all([
    getMappedArticles(100),
    getSiteSettings(),
  ]);

  // Filter articles relevant to this district (by title, excerpt, content, tags, or category)
  const dName = district.name.toLowerCase();
  const dSlug = district.slug.toLowerCase();
  const filteredArticles = articles.filter((art) => {
    const text = `${art.title} ${art.excerpt || ''} ${art.category || ''} ${(art.tags || []).join(' ')}`.toLowerCase();
    return text.includes(dName) || text.includes(dSlug) || (district.headquarters && text.includes(district.headquarters.toLowerCase()));
  });

  // If fewer than 4 matched, pad with latest Jharkhand articles to avoid sparse pages
  const displayArticles = filteredArticles.length >= 4 
    ? filteredArticles 
    : [...filteredArticles, ...articles.filter(a => !filteredArticles.some(fa => fa.id === a.id))].slice(0, 16);

  const districtUrl = `${BRAND.url}/district/${district.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': districtUrl,
        url: districtUrl,
        name: `${district.name} News Today — ${BRAND.name}`,
        description: `Comprehensive news coverage and live updates from ${district.name} district, Jharkhand.`,
        inLanguage: 'en-IN',
        about: {
          '@type': 'AdministrativeArea',
          name: district.name,
          containedInPlace: {
            '@type': 'AdministrativeArea',
            name: 'Jharkhand',
            sameAs: 'https://www.wikidata.org/wiki/Q1199',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: district.lat,
            longitude: district.lng,
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BRAND.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Districts of Jharkhand',
            item: `${BRAND.url}/#districts`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: district.name,
            item: districtUrl,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Where can I read breaking ${district.name} news?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Jharkhand Express provides real-time, verified ground reporting from ${district.name}, covering administrative notices, civic matters, crime updates, and development projects.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the administrative headquarters of ${district.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `The administrative headquarters of ${district.name} district is located in ${district.headquarters}, under the ${district.division} division.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header 
        simulatedDate={globalSettings?.simulated_date} 
        onSearchClick={() => {}} 
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400">Districts</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-bold text-[#0D5C46]">{district.name}</span>
        </nav>

        {/* District Hero Banner */}
        <div className="relative rounded-2xl bg-[#0B132B] text-white p-6 sm:p-10 mb-10 overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -right-12 -top-12 w-96 h-96 bg-[#0D5C46]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-[#0D5C46] text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-md">
                District Geo-Hub
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-slate-300 text-[10px] font-mono uppercase tracking-wider rounded-md">
                {district.division} Division
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
              <div>
                <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white mb-1">
                  {district.name} <span className="font-sans font-normal text-2xl text-emerald-400">({district.hindiName})</span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mt-2 font-sans">
                  {district.knownFor}. Comprehensive news, political developments, and local reports directly from the district desk.
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Pop: {district.populationEstimate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>HQ: {district.headquarters}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 24-District Quick Navigator Scrollbar */}
        <div className="mb-10 pb-2 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">
              All 24 Districts of Jharkhand
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Select to explore</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {JHARKHAND_DISTRICTS.map((d) => (
              <Link
                key={d.slug}
                href={`/district/${d.slug}`}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 ${
                  d.slug === district.slug
                    ? 'bg-[#0D5C46] text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-[#0D5C46] hover:text-[#0D5C46]'
                }`}
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Articles Feed */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0D5C46]" />
              Latest Dispatches for {district.name}
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {displayArticles.length} Stories Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((art) => (
              <article
                key={art.id}
                className="group bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {art.imageUrl && (
                  <div className="relative aspect-16/9 overflow-hidden bg-slate-100">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[#0B132B]/90 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-md backdrop-blur-xs">
                        {art.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(art.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span>{art.readingTime}</span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-[#0D5C46] transition-colors leading-snug line-clamp-2">
                      <Link href={`/article/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>

                    {art.excerpt && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 font-sans leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      {art.author?.name || BRAND.defaultAuthor}
                    </span>
                    <Link
                      href={`/article/${art.slug}`}
                      className="text-xs font-mono font-bold text-[#0D5C46] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
                    >
                      Read Story <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Local Geo FAQ for Information Gain & Search Answer Snippets */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 mb-12 shadow-xs">
          <h2 className="text-lg font-serif font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0D5C46]" />
            About {district.name} News Desk & Local Coverage
          </h2>
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed font-sans">
            <div>
              <h3 className="font-bold text-slate-900">How does Jharkhand Express verify news from {district.name}?</h3>
              <p className="mt-1 text-slate-600">
                Our correspondents monitor the {district.name} Collectorate, district police control room, local hospitals, and regional community developments to provide 100% verified ground reporting.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Which regions are covered under the {district.name} desk?</h3>
              <p className="mt-1 text-slate-600">
                We report across {district.name}&apos;s municipal areas, blocks, tehsils, and surrounding rural belts, with focus on development, infrastructure, mining, civic affairs, and public grievances.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B132B] text-slate-400 py-8 border-t border-slate-800 text-center text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {BRAND.name}. The premier digital news wire of Jharkhand.</p>
        </div>
      </footer>
    </div>
  );
}
