/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState } from 'react';
import { Article } from '@/types';
import { MapPin, ArrowRight, Clock, Sparkles } from 'lucide-react';

interface RegionalProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

const DISTRICTS = [
  { id: 'all', label: 'All Districts' },
  { id: 'ranchi', label: 'Ranchi' },
  { id: 'jamshedpur', label: 'Jamshedpur' },
  { id: 'dhanbad', label: 'Dhanbad' },
  { id: 'bokaro', label: 'Bokaro' },
  { id: 'deoghar', label: 'Deoghar' },
  { id: 'hazaribagh', label: 'Hazaribagh' },
];

export default function JharkhandRegionalRadar({ articles, onArticleClick }: RegionalProps) {
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  // Filter regional articles matching Jharkhand or specific districts
  const jharkhandPool = articles.filter(a => {
    const text = `${a.title} ${a.excerpt || ''} ${a.category} ${(a.tags || []).join(' ')}`.toLowerCase();
    if (selectedDistrict === 'all') {
      return text.includes('jharkhand') || text.includes('ranchi') || text.includes('jamshedpur') || text.includes('dhanbad') || text.includes('bokaro') || text.includes('tata');
    }
    return text.includes(selectedDistrict);
  });

  const displayList = jharkhandPool.length > 0 ? jharkhandPool.slice(0, 5) : articles.slice(0, 5);
  const primaryArticle = displayList[0];
  const restArticles = displayList.slice(1, 5);

  if (!primaryArticle) return null;

  return (
    <section className="mb-14 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
      
      {/* Header & District Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-[#0D5C46]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-950 tracking-tight">
              Heart of Jharkhand
            </h2>
            <span className="text-[10px] font-mono font-bold text-[#0D5C46] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              STATE RADAR
            </span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Hyperlocal dispatches, industrial growth, civic updates, and district reports
          </p>
        </div>

        {/* District Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {DISTRICTS.map((d) => {
            const active = selectedDistrict === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 ${
                  active
                    ? 'bg-[#0D5C46] text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Layout: 1 Big Left Card + 4 Right Side Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Feature Card */}
        <div
          onClick={() => onArticleClick(primaryArticle)}
          className="lg:col-span-6 group cursor-pointer space-y-3"
        >
          {primaryArticle.imageUrl && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 shadow-2xs">
              <img
                src={primaryArticle.imageUrl}
                alt={primaryArticle.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#0D5C46] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm">
                Jharkhand Spotlight
              </div>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-[#0D5C46] uppercase tracking-wide">
                {primaryArticle.category}
              </span>
              <span>•</span>
              <time className="font-mono">
                {new Date(primaryArticle.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </time>
            </div>

            <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 group-hover:text-[#0D5C46] transition-colors leading-snug">
              {primaryArticle.title}
            </h3>

            {primaryArticle.excerpt && (
              <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {primaryArticle.excerpt}
              </p>
            )}

            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0D5C46] group-hover:underline">
                Read District Coverage <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Stack of 4 Briefing Cards */}
        <div className="lg:col-span-6 divide-y divide-slate-100 space-y-4">
          {restArticles.map((article, idx) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="pt-4 first:pt-0 group cursor-pointer flex gap-4 items-start"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-bold text-[#E63946] uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 font-mono">
                    {new Date(article.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h4 className="font-sans font-bold text-sm text-slate-900 leading-snug group-hover:text-[#0D5C46] transition-colors line-clamp-2">
                  {article.title}
                </h4>

                {article.excerpt && (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {article.imageUrl && (
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}
