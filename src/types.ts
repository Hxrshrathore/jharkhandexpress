/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = string;

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio?: string;
}

export interface Article {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  category: Category;
  categories?: string[];
  tags?: string[];
  author: Author;
  publishedAt: string;
  readingTime: string;
  imageUrl: string;
  imageCaption?: string;
  trending?: boolean;
  aiSummary?: string;
  gallery?: string[];
  videoGallery?: string[];
  featuredVideo?: string;
  factCheck?: {
    status: 'Verified' | 'Unverified' | 'Mixed';
    details: string;
  };
  youtubeVideoId?: string;
  featuredVideoTimestamp?: string | null;
}

export interface LiveUpdate {
  id: string;
  timestamp: string;
  content: string;
  isBreaking?: boolean;
}

export interface AdItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  ctaText?: string;
  sponsorName?: string;
  badgeText?: string;
  bgGradient?: string;
  expiryDate: string; // YYYY-MM-DD ISO date string
}

export interface AdPlacementConfig {
  slotId: string;
  type: 'rectangle' | 'leaderboard' | 'square' | 'billboard' | 'halfpage';
  label?: string;
  carouselEnabled?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  items: AdItem[];
}


