/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React from 'react';
import { Article } from '@/types';
import { ChevronRight, Clock, ArrowUpRight } from 'lucide-react';

interface CategorySectionProps {
  title: string;
  articles: Article[];
  onArticleClick: (article: Article) => void;
  columns?: 2 | 3 | 4;
  badgeColor?: string;
}

export default function CategorySection({
  title,
  articles,
  onArticleClick,
  columns = 4,
  badgeColor = '#0D5C46'
}: CategorySectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mb-14">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-6 rounded-xs shrink-0"
            style={{ backgroundColor: badgeColor }}
          />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-950 tracking-tight">
            {title}
          </h2>
        </div>

        <button
          onClick={() => onArticleClick(articles[0])}
          className="group text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#E63946] transition-colors flex items-center gap-1"
        >
          <span>More in {title}</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid Layout */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6`}>
        {articles.map((article, idx) => (
          <article
            key={article.id}
            onClick={() => onArticleClick(article)}
            className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Media Thumbnail */}
              {article.imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className="text-[9px] font-extrabold uppercase tracking-wider text-white px-2 py-0.5 rounded shadow-xs"
                      style={{ backgroundColor: badgeColor }}
                    >
                      {article.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-2 w-full" style={{ backgroundColor: badgeColor }} />
              )}

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-[#E63946] transition-colors line-clamp-3">
                  {article.title}
                </h3>

                {article.excerpt && columns <= 3 && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 pb-3 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-sans">
              <span className="truncate max-w-[120px]">{article.author?.name || 'Bureau'}</span>
              <time dateTime={article.publishedAt} className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(article.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </time>
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}
