/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React from 'react';
import { Article } from '@/types';
import { Quote, Feather, ArrowUpRight } from 'lucide-react';

interface OpinionSectionProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

export default function OpinionSection({ articles, onArticleClick }: OpinionSectionProps) {
  const opinionArticles = articles.filter(a =>
    ['opinion', 'editorial', 'perspectives', 'column', 'analysis'].some(keyword => a.category.toLowerCase().includes(keyword))
  );

  const displayArticles = opinionArticles.length > 0 ? opinionArticles.slice(0, 4) : articles.slice(0, 4);

  if (!displayArticles || displayArticles.length === 0) return null;

  return (
    <section className="mb-14 bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      
      {/* Decorative subtle background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-6 mb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Voices & Analysis
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Expert commentary, state policy critiques, and national perspectives
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/40">
          Editorial Board
        </span>
      </div>

      {/* Columnist Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayArticles.map((article, idx) => (
          <article
            key={article.id}
            onClick={() => onArticleClick(article)}
            className="group cursor-pointer bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-xs p-5 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Quote className="w-6 h-6 text-amber-400/60 group-hover:text-amber-400 transition-colors" />
                <span className="text-[9px] font-mono uppercase text-slate-400">Column</span>
              </div>

              <h3 className="font-serif font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors leading-snug line-clamp-3">
                "{article.title}"
              </h3>

              {article.excerpt && (
                <p className="text-xs text-slate-400 font-sans line-clamp-3 leading-relaxed italic">
                  {article.excerpt}
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  {article.author?.name || 'Guest Columnist'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Jharkhand Express Contributor
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </article>
        ))}
      </div>

    </section>
  );
}
