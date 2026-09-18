/**
 * Brand constants for Jharkhand Express
 * Single source of truth for all brand-related strings.
 * Import this instead of hardcoding brand names anywhere.
 */

export const BRAND = {
  name: 'Jharkhand Express',
  shortName: 'JE',
  tagline: "Jharkhand's Voice First",
  subTagline: 'People | Development | Opportunities',
  domain: 'jharkhandexpress.com',
  url: 'https://jharkhandexpress.com',
  email: 'contact@jharkhandexpress.com',
  defaultAuthor: 'Jharkhand Express Desk',
  systemAuthorId: 'jharkhand-express-system',
  logoPath: '/logo.png',
  logoWebp: '/logo.webp',
  logoSmall: '/logo-small.webp',
  ogImage: '/og-image.png',
  primaryColor: '#D31010',
  description:
    'Jharkhand Express — your trusted source for Jharkhand news, politics, development, business, and opportunities. Real stories from the heart of Jharkhand.',
  keywords: [
    'Jharkhand news',
    'Jharkhand Express',
    'Jharkhand politics',
    'Jharkhand development',
    'Ranchi news',
    'Jamshedpur news',
    'Dhanbad news',
    'Jharkhand local news',
    'Jharkhand English news',
    'Breaking news Jharkhand',
  ],
} as const;

/** Supported UI translation languages (for the language selector) */
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', flag: '🏳️', nativeName: 'বাংলা' },
  { code: 'or', label: 'Odia', flag: '🏳️', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'te', label: 'Telugu', flag: '🏳️', nativeName: 'తెలుగు' },
  { code: 'pa', label: 'Punjabi', flag: '🏳️', nativeName: 'ਪੰਜਾਬੀ' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
