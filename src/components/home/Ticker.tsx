/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { Flame, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Article } from '@/types';

export default function Ticker({
  articles,
  onArticleClick,
  waybackBase
}: {
  articles: Article[];
  onArticleClick?: (article: Article) => void;
  waybackBase?: string | null;
}) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-[#0B132B] text-white border-b border-slate-800 overflow-hidden py-2 px-4">
      <div className="max-w-[1600px] mx-auto flex items-center relative">
        
        {/* Left Badge */}
        <div className="flex items-center gap-2 bg-[#E63946] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 z-10 shadow-xs">
          <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
          <span>Express Wire</span>
        </div>

        {/* Scrolling Strip */}
        <div className="flex whitespace-nowrap pl-4 overflow-hidden mask-fade">
          <div className="animate-ticker hover:paused flex items-center">
            {[...articles, ...articles].map((article, i) => {
              const articleHref = waybackBase ? `${waybackBase}/article/${article.slug}` : `/article/${article.slug}`;
              return (
                <div key={`${article.id}-${i}`} className="inline-flex items-center mx-3 group">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mr-2 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    {article.category}
                  </span>
                  <Link
                    href={articleHref}
                    onClick={(e) => {
                      if (onArticleClick) {
                        e.preventDefault();
                        onArticleClick(article);
                      }
                    }}
                    className="text-xs font-medium text-slate-200 group-hover:text-white group-hover:underline transition-colors flex items-center gap-1"
                  >
                    <span>{article.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <span className="text-slate-700 mx-3 select-none">/</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
