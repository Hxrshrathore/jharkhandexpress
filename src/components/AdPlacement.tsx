/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AdItem } from '../types';

interface AdPlacementProps {
  type: 'rectangle' | 'leaderboard' | 'square' | 'billboard' | 'halfpage';
  className?: string;
  wrapperClassName?: string;
  slotId?: string;
  label?: string;
  items?: AdItem[];
  carouselEnabled?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  simulatedDate?: string; 
  placementContext?: 'homepage' | 'article';
}

const AD_CONFIGS = {
  rectangle: {
    widthClass: 'w-[300px] max-w-full',
    heightClass: 'h-[250px]',
    label: '300 × 250 (Medium Rectangle)',
    aspectRatio: 'aspect-[300/250]'
  },
  leaderboard: {
    widthClass: 'w-full max-w-[728px]',
    heightClass: 'h-auto aspect-[728/90]',
    label: '728 × 90 (Leaderboard Banner)',
    aspectRatio: 'aspect-[728/90]'
  },
  square: {
    widthClass: 'w-[250px] max-w-full',
    heightClass: 'h-[250px]',
    label: '250 × 250 (Square)',
    aspectRatio: 'aspect-square'
  },
  billboard: {
    widthClass: 'w-full max-w-[970px]',
    heightClass: 'h-auto aspect-[970/250]',
    label: '970 × 250',
    aspectRatio: 'aspect-[970/250]'
  },
  halfpage: {
    widthClass: 'w-[300px] max-w-full',
    heightClass: 'h-[600px]',
    label: '300 × 600',
    aspectRatio: 'aspect-[300/600]'
  }
};

export default function AdPlacement({ 
  type, 
  className = '', 
  wrapperClassName,
  slotId = 'HP-REC-01', 
  label,
  items,
  carouselEnabled: overrideCarouselEnabled,
  autoPlay: overrideAutoPlay,
  autoPlayInterval: overrideAutoPlayInterval,
  simulatedDate,
  placementContext = 'homepage',
  globalSettings
}: AdPlacementProps & { globalSettings?: any }) {
  const config = AD_CONFIGS[type] || AD_CONFIGS.rectangle;
  
  const carouselEnabled = overrideCarouselEnabled ?? true;
  const autoPlay = overrideAutoPlay ?? true;
  const autoPlayInterval = overrideAutoPlayInterval ?? 5000;

  // Use global simulated date if exists, otherwise props, otherwise today
  const currentDateObj = globalSettings?.simulated_date 
    ? new Date(globalSettings.simulated_date) 
    : (simulatedDate ? new Date(simulatedDate) : new Date());

  const allAds = globalSettings?.site_ads || [];

  // 1. Filter to get all ACTIVE ads matching this slot's TYPE
  // 2. Filter by placementContext (homepage vs article)
  const typeAds = allAds.filter((ad: any) => {
    if (!ad.active) return false;
    if (ad.type !== type) return false;
    
    if (placementContext === 'article') {
      if (!ad.show_in_articles) return false;
    } else {
      if (ad.show_on_homepage === false) return false;
    }
    
    // If this campaign is explicitly forced (e.g. for Wayback simulation / Ad proof generation)
    if (globalSettings?.force_ad_campaign_id && ad.campaign_id === globalSettings.force_ad_campaign_id) {
      return true;
    }

    // Check Date Validity (inclusive through end of validTo day)
    const validFrom = new Date(ad.valid_from);
    const validTo = new Date(ad.valid_to);
    validTo.setHours(23, 59, 59, 999);
    return currentDateObj >= validFrom && currentDateObj <= validTo;
  });

  // Auto-Cascading Math Logic
  let activeItems: any[] = items || [];
  
  if (!items) {
    if (placementContext === 'article') {
      // For articles, just show all eligible ads in a carousel
      activeItems = typeAds.map((ad: any) => ({
        id: `dynamic-ad-${ad.id}`,
        imageUrl: ad.image_url,
        title: 'Sponsored Placement',
      }));
    } else {
      // Homepage: Extract slot index (0 to 11), assuming 6 total slots per type
      const slotMatch = slotId?.match(/(\d+)$/);
      const slotIndex = slotMatch ? parseInt(slotMatch[1], 10) - 1 : 0;
      const totalSlots = 6;
      const N = typeAds.length;

      if (N > 0) {
        const base = Math.floor(N / totalSlots);
        const remainder = N % totalSlots;
        const countForThisSlot = slotIndex < remainder ? base + 1 : base;
        const startIndex = slotIndex * base + Math.min(slotIndex, remainder);
        
        const assignedAds = typeAds.slice(startIndex, startIndex + countForThisSlot);
        
        activeItems = assignedAds.map((ad: any) => ({
          id: `dynamic-ad-${ad.id}`,
          imageUrl: ad.image_url,
          title: 'Sponsored Placement',
        }));
      }
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentIndex >= activeItems.length && activeItems.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeItems.length, currentIndex]);

  const hasMultipleActiveItems = activeItems.length > 1;
  const isCarouselRunning = carouselEnabled && hasMultipleActiveItems;

  useEffect(() => {
    if (isCarouselRunning && autoPlay && !isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeItems.length);
      }, autoPlayInterval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCarouselRunning, autoPlay, isPaused, activeItems.length, autoPlayInterval]);

  const activeItem = activeItems[currentIndex];


  // ── No active campaign → render nothing at all ──
  if (activeItems.length === 0) return null;

  const content = (
    <div 
      className={`flex flex-col items-center w-full ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={`relative ${config.widthClass} ${config.heightClass} overflow-hidden border border-brand-black/20 bg-brand-black text-brand-offwhite shadow-sm transition-all duration-300 group`}
      >
        {activeItem && (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-brand-black group">
            {activeItem.imageUrl ? (
              activeItem.imageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                <video 
                  src={activeItem.imageUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <img 
                  src={activeItem.imageUrl} 
                  alt={activeItem.title} 
                  className="w-full h-full object-fill transition-transform duration-500 group-hover:scale-[1.02]"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white text-xs font-mono">
                {activeItem.title}
              </div>
            )}

            {isCarouselRunning && autoPlay && !isPaused && (
              <div 
                className="absolute bottom-0 left-0 h-0.5 bg-brand-tech z-20 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / activeItems.length) * 100}%` }}
              />
            )}
          </div>
        )}
      </div>

      {isCarouselRunning && activeItems.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {activeItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all cursor-pointer ${
                idx === currentIndex 
                  ? 'w-4 bg-brand-tech' 
                  : 'w-1 bg-brand-black/20 hover:bg-brand-black/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (wrapperClassName) {
    return (
      <div className={wrapperClassName}>
        {content}
      </div>
    );
  }

  return content;
}
