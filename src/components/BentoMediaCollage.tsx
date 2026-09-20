'use client';

import React, { useState, useEffect } from 'react';
import { Play, X, ChevronLeft, ChevronRight, Maximize2, Images, Sparkles } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';

export interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  url: string;
  caption?: string;
}

function isYoutubeUrlOrId(url: string): { isYoutube: boolean; videoId: string | null } {
  if (!url) return { isYoutube: false, videoId: null };
  // Check if it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return { isYoutube: true, videoId: url };
  }
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match) {
    return { isYoutube: true, videoId: match[1] };
  }
  return { isYoutube: false, videoId: null };
}

export default function BentoMediaCollage({ 
  rawItems, 
  items: propItems 
}: { 
  rawItems?: Array<{ type: 'image' | 'video'; url: string }>;
  items?: Array<{ type: 'image' | 'video'; url: string }>;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sourceList = rawItems || propItems || [];

  // Normalize and clean items
  const items: MediaItem[] = sourceList
    .filter(item => item && item.url && item.url.trim() !== '')
    .map(item => {
      const ytCheck = isYoutubeUrlOrId(item.url);
      if (item.type === 'video' || ytCheck.isYoutube) {
        if (ytCheck.isYoutube && ytCheck.videoId) {
          return { type: 'youtube', url: ytCheck.videoId };
        }
        return { type: 'video', url: item.url };
      }
      return { type: 'image', url: item.url };
    });

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev !== null ? (prev + 1) % items.length : null));
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev !== null ? (prev - 1 + items.length) % items.length : null));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, items.length]);

  if (items.length === 0) return null;

  // Render media thumbnail/preview
  const renderItemContent = (item: MediaItem, idx: number, isOverlay = false) => {
    if (item.type === 'youtube') {
      const thumbUrl = `https://img.youtube.com/vi/${item.url}/hqdefault.jpg`;
      return (
        <div className="relative w-full h-full bg-slate-900 group/media cursor-pointer overflow-hidden">
          <img
            src={thumbUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover/media:bg-black/20">
            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform transition-transform group-hover/media:scale-110">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-mono text-white font-bold uppercase tracking-wider flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-current text-red-500" /> Video
          </span>
        </div>
      );
    }

    if (item.type === 'video') {
      return (
        <div className="relative w-full h-full bg-slate-950 group/media cursor-pointer overflow-hidden flex items-center justify-center">
          <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover/media:bg-black/20">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 text-white border border-white/20 flex items-center justify-center shadow-lg transform transition-transform group-hover/media:scale-110">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800 group/media cursor-pointer overflow-hidden">
        <img
          src={item.url}
          alt={`Gallery media ${idx + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors" />
      </div>
    );
  };

  // 1 Item Layout
  if (items.length === 1) {
    const item = items[0];
    return (
      <>
        <div
          onClick={() => setLightboxIndex(0)}
          className="my-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-900 group cursor-pointer max-h-[520px]"
        >
          {item.type === 'youtube' ? (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${item.url}?autoplay=0&controls=1`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : item.type === 'video' ? (
            <div className="aspect-video w-full">
              <CustomVideoPlayer src={item.url} />
            </div>
          ) : (
            <img
              src={item.url}
              alt="Article media"
              className="w-full h-auto object-cover max-h-[520px] transition-transform duration-500 group-hover:scale-101"
            />
          )}
        </div>
        {lightboxIndex !== null && renderLightbox()}
      </>
    );
  }

  // 2 Items Layout (50/50 side by side)
  if (items.length === 2) {
    return (
      <>
        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-sm h-[320px] sm:h-[380px]">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className="h-full w-full rounded-xl overflow-hidden shadow-2xs"
            >
              {renderItemContent(item, idx)}
            </div>
          ))}
        </div>
        {lightboxIndex !== null && renderLightbox()}
      </>
    );
  }

  // 3 Items Layout (Facebook 3-Image Bento: 1 Large Left + 2 Stacked Right)
  if (items.length === 3) {
    return (
      <>
        <div className="my-8 grid grid-cols-1 sm:grid-cols-3 sm:grid-rows-2 gap-2.5 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-sm h-[420px] sm:h-[480px]">
          {/* Main Hero Card (2 cols, 2 rows) */}
          <div
            onClick={() => setLightboxIndex(0)}
            className="sm:col-span-2 sm:row-span-2 h-full w-full rounded-xl overflow-hidden shadow-2xs min-h-[220px]"
          >
            {renderItemContent(items[0], 0)}
          </div>
          {/* Card 2 */}
          <div
            onClick={() => setLightboxIndex(1)}
            className="sm:col-span-1 sm:row-span-1 h-full w-full rounded-xl overflow-hidden shadow-2xs min-h-[140px]"
          >
            {renderItemContent(items[1], 1)}
          </div>
          {/* Card 3 */}
          <div
            onClick={() => setLightboxIndex(2)}
            className="sm:col-span-1 sm:row-span-1 h-full w-full rounded-xl overflow-hidden shadow-2xs min-h-[140px]"
          >
            {renderItemContent(items[2], 2)}
          </div>
        </div>
        {lightboxIndex !== null && renderLightbox()}
      </>
    );
  }

  // 4 Items Layout (Balanced 2x2 Grid)
  if (items.length === 4) {
    return (
      <>
        <div className="my-8 grid grid-cols-2 grid-rows-2 gap-2.5 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-sm h-[440px] sm:h-[500px]">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className="h-full w-full rounded-xl overflow-hidden shadow-2xs"
            >
              {renderItemContent(item, idx)}
            </div>
          ))}
        </div>
        {lightboxIndex !== null && renderLightbox()}
      </>
    );
  }

  // 5+ Items Layout: The Iconic Facebook Bento Grid (Top 2 + Bottom 3 with "+N" Overlay on 5th)
  const visibleItems = items.slice(0, 5);
  const remainingCount = items.length - 5;

  return (
    <>
      <div className="my-8 flex flex-col gap-2.5 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 shadow-sm">
        {/* Top Row: 2 Big Highlight Items */}
        <div className="grid grid-cols-2 gap-2.5 h-[220px] sm:h-[280px]">
          <div
            onClick={() => setLightboxIndex(0)}
            className="h-full w-full rounded-xl overflow-hidden shadow-2xs"
          >
            {renderItemContent(visibleItems[0], 0)}
          </div>
          <div
            onClick={() => setLightboxIndex(1)}
            className="h-full w-full rounded-xl overflow-hidden shadow-2xs"
          >
            {renderItemContent(visibleItems[1], 1)}
          </div>
        </div>

        {/* Bottom Row: 3 Items (with +N on the 5th item if more than 5) */}
        <div className="grid grid-cols-3 gap-2.5 h-[150px] sm:h-[190px]">
          <div
            onClick={() => setLightboxIndex(2)}
            className="h-full w-full rounded-xl overflow-hidden shadow-2xs"
          >
            {renderItemContent(visibleItems[2], 2)}
          </div>

          <div
            onClick={() => setLightboxIndex(3)}
            className="h-full w-full rounded-xl overflow-hidden shadow-2xs"
          >
            {renderItemContent(visibleItems[3], 3)}
          </div>

          {/* 5th slot with optional "+N More" Overlay */}
          <div
            onClick={() => setLightboxIndex(4)}
            className="relative h-full w-full rounded-xl overflow-hidden shadow-2xs cursor-pointer group"
          >
            {renderItemContent(visibleItems[4], 4)}
            {remainingCount > 0 && (
              <div className="absolute inset-0 bg-slate-950/70 hover:bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-all p-2 text-center">
                <span className="font-serif font-black text-2xl sm:text-4xl tracking-tight text-white drop-shadow-md">
                  +{remainingCount}
                </span>
                <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-200 mt-1 flex items-center gap-1">
                  <Images className="w-3.5 h-3.5" /> View All
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && renderLightbox()}
    </>
  );

  // Full-Screen Interactive Lightbox
  function renderLightbox() {
    if (lightboxIndex === null) return null;
    const currentItem = items[lightboxIndex];

    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-200">
        {/* Top Control Bar */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 text-white">
            <span className="font-mono text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {items.length}
            </span>
            <span className="text-xs text-white/60 hidden sm:inline">Use arrow keys to navigate</span>
          </div>

          <button
            onClick={() => setLightboxIndex(null)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">
          {/* Previous Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => (prev !== null ? (prev - 1 + items.length) % items.length : null));
            }}
            className="absolute left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Current Media Rendered */}
          <div className="max-w-5xl max-h-[80vh] w-full flex items-center justify-center">
            {currentItem.type === 'youtube' ? (
              <div className="w-full aspect-video max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <iframe
                  src={`https://www.youtube.com/embed/${currentItem.url}?autoplay=1&controls=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : currentItem.type === 'video' ? (
              <div className="w-full aspect-video max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <CustomVideoPlayer src={currentItem.url} autoplayHero={true} />
              </div>
            ) : (
              <img
                src={currentItem.url}
                alt={`Media asset ${lightboxIndex + 1}`}
                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl"
              />
            )}
          </div>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => (prev !== null ? (prev + 1) % items.length : null));
            }}
            className="absolute right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all hover:scale-110 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Thumbnail Strip at Bottom */}
        <div className="h-20 border-t border-white/10 px-4 flex items-center justify-center gap-2 overflow-x-auto py-2 shrink-0">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                lightboxIndex === idx ? 'border-red-500 scale-105 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              {item.type === 'youtube' ? (
                <img
                  src={`https://img.youtube.com/vi/${item.url}/hqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }
}
