import type { Metadata } from "next";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { BRAND } from "@/lib/brand";

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${BRAND.name} | ${BRAND.tagline}`,
  description: BRAND.description,
  keywords: [...BRAND.keywords],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.webp", type: "image/webp" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/logo.png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
    url: BRAND.url,
    siteName: BRAND.name,
    locale: "en_IN",
    images: [
      {
        url: `${BRAND.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — ${BRAND.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.description,
    images: [`${BRAND.url}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-C4J0DN6STL';
  
  const sitewideSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsMediaOrganization',
        '@id': `${BRAND.url}/#organization`,
        name: BRAND.name,
        url: BRAND.url,
        logo: {
          '@type': 'ImageObject',
          '@id': `${BRAND.url}/#logo`,
          url: `${BRAND.url}/logo.png`,
          caption: BRAND.name,
          inLanguage: 'en-IN',
          width: '512',
          height: '512',
        },
        image: {
          '@id': `${BRAND.url}/#logo`,
        },
        description: BRAND.description,
        foundingDate: '2024',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ranchi',
          addressRegion: 'Jharkhand',
          addressCountry: 'IN',
        },
        areaServed: [
          {
            '@type': 'AdministrativeArea',
            name: 'Jharkhand',
            sameAs: 'https://www.wikidata.org/wiki/Q1199',
          },
        ],
        knowsAbout: [
          'Jharkhand Politics',
          'Ranchi News',
          'Jharkhand Governance and JSSC Recruitment',
          'Tribal Heritage and Culture',
          'Mining and Industries of Jharkhand',
        ],
        sameAs: [
          'https://twitter.com/jharkhandexpress',
          'https://youtube.com/@jharkhandexpress',
          'https://facebook.com/jharkhandexpress',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${BRAND.url}/#website`,
        url: BRAND.url,
        name: BRAND.name,
        description: BRAND.description,
        publisher: {
          '@id': `${BRAND.url}/#organization`,
        },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BRAND.url}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className={cn("h-full antialiased font-sans", sans.variable, serif.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sitewideSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-slate-900" suppressHydrationWarning>
        {children}
        <CookieConsent />
        <AnalyticsWrapper gaId={gaId} />
        <Toaster />
      </body>
    </html>
  );
}
