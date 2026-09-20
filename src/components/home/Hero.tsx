/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { Article } from '@/types';
import { Clock, ChevronRight, ChevronLeft, Volume2, Bookmark, Sparkles, TrendingUp } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import WhatsAppIcon from '../WhatsAppIcon';

interface HeroProps {
  article: Article;
  secondaryArticles?: Article[];
  onClick: (article: Article) => void;
  onPrev?: (e: React.MouseEvent) => void;
  onNext?: (e: React.MouseEvent) => void;
  currentIndex?: number;
  totalArticles?: number;
}

function parseTimestampToSeconds(ts: string | null | undefined): number {
  if (!ts) return 0;
  let total = 0;
  const m = ts.match(/(\d+)m/);
  const s = ts.match(/(\d+)s/);
  if (m) total += parseInt(m[1]) * 60;
  if (s) total += parseInt(s[1]);
  return total;
}

export default function Hero({
  article,
  secondaryArticles = [],
  onClick,
  onPrev,
  onNext,
  currentIndex = 0,
  totalArticles = 0
}: HeroProps) {
  if (!article) return null;

  const sideArticles = secondaryArticles.slice(0, 4);

  return (
    <section className="py-6 px-4 sm:px-8 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── LEFT: FLAGSHIP FEATURED STORY (8 COLS) ── */}
        <div
          onClick={() => onClick(article)}
          className="lg:col-span-8 group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-900 shadow-lg min-h-[460px] md:min-h-[540px] flex flex-col justify-end transition-all duration-300 hover:shadow-2xl"
        >
          {/* Background Image / Video with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            {article.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${article.youtubeVideoId}?autoplay=1&mute=1&controls=0&start=${parseTimestampToSeconds(article.featuredVideoTimestamp)}`}
                className="w-full h-full object-cover scale-[1.2] pointer-events-none"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out brightness-95"
                loading="eager"
              />
            )}
            {/* Cinematic Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent" />
          </div>

          {/* Top Floating Badges */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#E63946] text-white shadow-md">
              {article.category || 'Featured'}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/70 text-emerald-400 backdrop-blur-md border border-slate-700/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Lead Dispatch
            </span>
          </div>

          {/* Carousel Navigation Buttons */}
          {onPrev && onNext && totalArticles > 1 && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2">
              <div className="bg-slate-950/70 backdrop-blur-md border border-slate-700/50 rounded-full px-3 py-1 text-[11px] font-mono text-slate-300">
                {currentIndex + 1} / {totalArticles}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(e); }}
                className="p-2 rounded-full bg-slate-950/70 text-white hover:bg-[#E63946] backdrop-blur-md border border-slate-700/50 transition-colors"
                aria-label="Previous story"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onNext(e); }}
                className="p-2 rounded-full bg-slate-950/70 text-white hover:bg-[#E63946] backdrop-blur-md border border-slate-700/50 transition-colors"
                aria-label="Next story"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hero Content Overlay */}
          <div className="relative z-10 p-6 sm:p-8 md:p-10 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300 font-sans">
              <span className="font-semibold text-white">{article.author?.name || 'Jharkhand Express Bureau'}</span>
              <span>•</span>
              <time dateTime={article.publishedAt} className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(article.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </time>
              <span>•</span>
              <span>{article.readingTime || '4 min'} read</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight group-hover:text-amber-200 transition-colors">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-sm md:text-base text-slate-200/90 line-clamp-2 max-w-3xl font-sans leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E63946] hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md">
                <span>Read Full Story</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: THE FAST WIRE DISPATCHES (4 COLS) ── */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#E63946]" />
              <h2 className="font-sans font-bold text-sm text-slate-900 tracking-tight uppercase">
                The Fast Wire
              </h2>
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              LIVE RADAR
            </span>
          </div>

          <div className="space-y-4 divide-y divide-slate-100 flex-1">
            {sideArticles.length > 0 ? (
              sideArticles.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onClick(item)}
                  className={`pt-3 first:pt-0 group/item cursor-pointer flex gap-3 items-start transition-all`}
                >
                  <span className="font-serif font-black text-2xl text-slate-300 group-hover/item:text-[#E63946] transition-colors leading-none pt-1 shrink-0 w-6">
                    0{idx + 1}
                  </span>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-[#0D5C46]">
                        {item.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 font-mono">
                        {new Date(item.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-sans font-semibold text-xs sm:text-sm text-slate-900 leading-snug group-hover/item:text-[#E63946] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  {item.imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-xs py-8 text-center">
                Updating dispatches from Jharkhand and beyond...
              </div>
            )}
          </div>

          {/* Quick Newsletter / VIP Alert Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-[11px] font-sans">
                <span className="font-bold text-slate-900 block">Express Direct</span>
                <span className="text-slate-500">Unfiltered news straight to your inbox</span>
              </div>
            </div>
            <a
              href="https://whatsapp.com/channel/YOUR_CHANNEL_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366] text-white text-[10px] font-bold tracking-wide hover:bg-[#128C7E] transition-colors shrink-0"
            >
              <WhatsAppIcon className="w-3 h-3" />
              <span>Join</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
