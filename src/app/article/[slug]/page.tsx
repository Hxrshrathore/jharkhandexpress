import type { Metadata } from 'next';
import ClientHome from '../../ClientHome';
import { getMappedArticles, getArticleByIdOrSlug, getSiteSettings } from '@/lib/db';
import { BRAND } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticleByIdOrSlug(slug);

  if (!article) {
    return {
      title: `Article | ${BRAND.name}`,
      description: `Read the latest Jharkhand news on ${BRAND.name}.`,
    };
  }

  const title = article.title;
  const description = article.excerpt?.slice(0, 200) || `Read the full story on ${BRAND.name}.`;
  const imageUrl = article.imageUrl || `${BRAND.url}/og-image.png`;
  const articleUrl = `${BRAND.url}/article/${slug}`;
  const publishedTime = article.publishedAt;
  const authorName = article.author?.name || BRAND.defaultAuthor;
  const section = typeof article.category === 'string' ? article.category : 'News';

  return {
    title: `${title} | ${BRAND.name}`,
    description,
    authors: [{ name: authorName }],
    openGraph: {
      type: 'article',
      url: articleUrl,
      title,
      description,
      siteName: BRAND.name,
      publishedTime,
      authors: [authorName],
      section,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      site: '@jharkhandexpress',
      creator: `@${authorName.replace(/\s+/g, '').toLowerCase()}`,
    },
    alternates: {
      canonical: articleUrl,
      languages: {
        'en': `${BRAND.url}/article/${slug}`,
        'hi': `${BRAND.url}/hi/article/${slug}`,
        'x-default': `${BRAND.url}/article/${slug}`,
      },
    },
  };
}

export default async function ArticlePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const [articles, directArticle, globalSettings] = await Promise.all([
    getMappedArticles(100),
    getArticleByIdOrSlug(params.slug),
    getSiteSettings()
  ]);
  
  // If the article is older than the top 100, it won't be in the articles array.
  // We must inject it so ClientHome can find and render it.
  if (directArticle && !articles.find(a => a.id === directArticle.id)) {
    articles.unshift(directArticle);
  }

  // Generate Deep JSON-LD Machine Graph for Search Engines
  let jsonLdGraph = null;
  if (directArticle) {
    const articleUrl = `${BRAND.url}/article/${params.slug}`;
    const authorName = directArticle.author?.name || BRAND.defaultAuthor;
    const categoryName = typeof directArticle.category === 'string' ? directArticle.category : 'Jharkhand';
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const imageUrl = directArticle.imageUrl || `${BRAND.url}/og-image.png`;
    const publishedIso = directArticle.publishedAt ? new Date(directArticle.publishedAt).toISOString() : new Date().toISOString();

    jsonLdGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NewsArticle',
          '@id': `${articleUrl}#article`,
          isPartOf: {
            '@type': 'WebPage',
            '@id': articleUrl,
          },
          headline: directArticle.title,
          description: directArticle.excerpt || directArticle.title,
          url: articleUrl,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl,
          },
          datePublished: publishedIso,
          dateModified: publishedIso,
          inLanguage: 'en-IN',
          dateline: 'Ranchi, Jharkhand',
          articleSection: categoryName,
          keywords: [
            categoryName,
            'Jharkhand News',
            'Ranchi News',
            'Breaking News Jharkhand',
            ...(Array.isArray(directArticle.tags) ? directArticle.tags : []),
          ].join(', '),
          image: [
            {
              '@type': 'ImageObject',
              url: imageUrl,
              width: 1200,
              height: 630,
              caption: directArticle.title,
            },
          ],
          author: {
            '@type': 'Person',
            name: authorName,
            jobTitle: 'Senior Bureau Correspondent',
            worksFor: {
              '@type': 'NewsMediaOrganization',
              name: BRAND.name,
              url: BRAND.url,
            },
            sameAs: `${BRAND.url}/about`,
          },
          publisher: {
            '@type': 'NewsMediaOrganization',
            '@id': `${BRAND.url}/#organization`,
            name: BRAND.name,
            url: BRAND.url,
            logo: {
              '@type': 'ImageObject',
              url: `${BRAND.url}/logo.png`,
              width: 512,
              height: 512,
            },
          },
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: ['.article-headline', '.article-excerpt', '.key-takeaways'],
          },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${articleUrl}#breadcrumb`,
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
              name: categoryName,
              item: `${BRAND.url}/category/${categorySlug}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: directArticle.title,
              item: articleUrl,
            },
          ],
        },
      ],
    };
  }

  return (
    <>
      {jsonLdGraph && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      )}
      <ClientHome dbArticles={articles} initialArticleSlug={params.slug} globalSettings={globalSettings} />
    </>
  );
}
