import { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = BRAND.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/maintenance/',
          '/*?*preview=*',
        ],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'Googlebot-News', 'Google-InspectionTool'],
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Applebot', 'CCBot'],
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`,
    ],
    host: baseUrl,
  };
}
