'use client';

import React from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  Bookmark, 
  MessageCircle, 
  Type, 
  Sparkles, 
  Flame, 
  Radio, 
  CheckCircle2, 
  Play,
  Images
} from 'lucide-react';

interface ArticleSkeletonProps {
  contentOnly?: boolean;
}

export default function ArticleSkeleton({ contentOnly = false }: ArticleSkeletonProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-emerald-100 overflow-x-hidden">
      
      {/* ── Fixed Reading Progress Bar Shimmer ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-200/50 overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-[#0D5C46] via-[#2A9D8F] to-[#E63946] animate-[shimmer_1.8s_infinite]" />
      </div>

      {/* ── 1. Optional Full Page Top Header Skeleton ── */}
      {!contentOnly && (
        <>
          {/* Dark Navy Top Utility Strip */}
          <div className="bg-[#0B132B] text-slate-300 border-b border-slate-800/80 py-1.5 px-4 sm:px-8">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="w-20 h-2.5 bg-emerald-700/50 rounded skeleton-shimmer-dark" />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-28 h-2.5 bg-slate-700/50 rounded skeleton-shimmer-dark" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-5 rounded-full bg-slate-800/80 border border-slate-700/60 skeleton-shimmer-dark" />
              </div>
            </div>
          </div>

          {/* Main Masthead Bar */}
          <div className="bg-[#FAF9F6] border-b border-slate-200/80 py-2.5">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 skeleton-shimmer shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <div className="w-44 h-5 bg-slate-300 rounded skeleton-shimmer" />
                  <div className="w-24 h-2 bg-slate-200 rounded skeleton-shimmer" />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-20 h-7 rounded-full bg-slate-200 skeleton-shimmer" />
                <div className="w-20 h-7 rounded-full bg-slate-200 skeleton-shimmer" />
                <div className="w-20 h-7 rounded-full bg-slate-200 skeleton-shimmer" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28 h-8 rounded-full bg-white border border-slate-200 skeleton-shimmer" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 2. Editorial Utility Sticky Bar Skeleton ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
          {/* Breadcrumb / Back */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 w-20 h-7 skeleton-shimmer" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-300">/</span>
              <div className="w-20 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
              <span className="text-slate-300">/</span>
              <div className="w-48 lg:w-72 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 skeleton-shimmer" />
            <div className="hidden md:block w-28 h-8 rounded-full bg-slate-100 border border-slate-200/60 skeleton-shimmer" />
            <div className="w-8 h-8 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 skeleton-shimmer" />
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 skeleton-shimmer" />
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* ── 3. Main Editorial Content Grid ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* ── Left Column: 8 Cols Main Article ── */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Category Pill & Verified Dispatch Meta */}
            <div className="flex items-center gap-3">
              <div className="w-24 h-6 rounded-full bg-[#0D5C46]/20 border border-[#0D5C46]/30 skeleton-shimmer" />
              <span className="text-slate-300">•</span>
              <div className="w-20 h-4 bg-slate-200 rounded skeleton-shimmer" />
              <span className="text-slate-300">•</span>
              <div className="w-28 h-5 rounded-md bg-emerald-50 border border-emerald-200/80 skeleton-shimmer" />
            </div>

            {/* High-Impact Headline Skeleton (3 Lines) */}
            <div className="space-y-3.5 pt-1">
              <div className="w-[96%] h-8 sm:h-11 md:h-12 bg-slate-300/80 rounded-xl skeleton-shimmer" />
              <div className="w-[88%] h-8 sm:h-11 md:h-12 bg-slate-300/80 rounded-xl skeleton-shimmer" />
              <div className="w-[62%] h-8 sm:h-11 md:h-12 bg-slate-300/80 rounded-xl skeleton-shimmer" />
            </div>

            {/* Italic Lead Excerpt Callout */}
            <div className="border-l-3 border-[#0D5C46] pl-4 py-1 space-y-2">
              <div className="w-[92%] h-4.5 bg-slate-200 rounded skeleton-shimmer" />
              <div className="w-[74%] h-4.5 bg-slate-200 rounded skeleton-shimmer" />
            </div>

            {/* Bureau Byline Card Skeleton */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-slate-200/90">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-slate-200 skeleton-shimmer ring-2 ring-emerald-100 shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-36 h-4 bg-slate-300 rounded skeleton-shimmer" />
                  <div className="w-48 h-3 bg-slate-200 rounded skeleton-shimmer" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="w-28 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                <div className="w-20 h-3 bg-emerald-100 rounded skeleton-shimmer" />
              </div>
            </div>

            {/* Google Preferred Callout Banner Skeleton */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/50 border border-blue-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 shadow-2xs skeleton-shimmer shrink-0" />
                <div className="space-y-1.5">
                  <div className="w-40 h-3.5 bg-slate-300 rounded skeleton-shimmer" />
                  <div className="w-56 h-2.5 bg-slate-200 rounded skeleton-shimmer" />
                </div>
              </div>
              <div className="hidden sm:block w-44 h-8 rounded-xl bg-white border border-blue-200 skeleton-shimmer shrink-0" />
            </div>

            {/* ── Cinematic Hero Media Placeholder ── */}
            <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-200/80 shadow-md relative group skeleton-shimmer">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-white/70 backdrop-blur-xs border border-white/50 flex items-center justify-center shadow-lg animate-pulse">
                  <Play className="w-7 h-7 text-slate-400 ml-1" />
                </div>
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                  Loading Wire Media
                </span>
              </div>
            </div>

            {/* Article Content Paragraphs Skeleton */}
            <div className="space-y-4 pt-2">
              <div className="w-full h-4 bg-slate-200/90 rounded skeleton-shimmer" />
              <div className="w-[98%] h-4 bg-slate-200/90 rounded skeleton-shimmer" />
              <div className="w-[95%] h-4 bg-slate-200/90 rounded skeleton-shimmer" />
              <div className="w-[84%] h-4 bg-slate-200/90 rounded skeleton-shimmer" />
            </div>

            <div className="space-y-4">
              <div className="w-full h-4 bg-slate-200/90 rounded skeleton-shimmer" />
              <div className="w-[96%] h-4 bg-slate-200/90 rounded skeleton-shimmer" />
              <div className="w-[92%] h-4 bg-slate-200/90 rounded skeleton-shimmer" />
              <div className="w-[78%] h-4 bg-slate-200/90 rounded skeleton-shimmer" />
            </div>

            {/* ── Unique Signature: Facebook-Style Bento Collage Skeleton ── */}
            <div className="my-8 rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-100 p-2.5 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                  <Images className="w-3.5 h-3.5" /> Wire Media Archive
                </div>
                <div className="w-16 h-3 bg-slate-200 rounded skeleton-shimmer" />
              </div>
              
              {/* Row 1: 2 Hero Tiles */}
              <div className="grid grid-cols-2 gap-2.5 h-44 sm:h-52">
                <div className="h-full w-full rounded-xl bg-slate-200 skeleton-shimmer" />
                <div className="h-full w-full rounded-xl bg-slate-200 skeleton-shimmer" />
              </div>

              {/* Row 2: 3 Sub-Tiles */}
              <div className="grid grid-cols-3 gap-2.5 h-28 sm:h-36">
                <div className="h-full w-full rounded-xl bg-slate-200 skeleton-shimmer" />
                <div className="h-full w-full rounded-xl bg-slate-200 skeleton-shimmer" />
                <div className="h-full w-full rounded-xl bg-slate-300 skeleton-shimmer relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center shadow-xs">
                    <span className="text-xs font-black text-slate-500">+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Takeaways Callout Card Skeleton */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <div className="w-32 h-4 bg-emerald-200 rounded skeleton-shimmer" />
              </div>
              <div className="space-y-2.5 pl-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div className="w-[88%] h-3.5 bg-emerald-100 rounded skeleton-shimmer" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div className="w-[76%] h-3.5 bg-emerald-100 rounded skeleton-shimmer" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div className="w-[82%] h-3.5 bg-emerald-100 rounded skeleton-shimmer" />
                </div>
              </div>
            </div>

            {/* Tags Strip Skeleton */}
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-200">
              <div className="w-16 h-6 rounded-lg bg-slate-200 skeleton-shimmer" />
              <div className="w-24 h-6 rounded-lg bg-slate-200 skeleton-shimmer" />
              <div className="w-20 h-6 rounded-lg bg-slate-200 skeleton-shimmer" />
              <div className="w-28 h-6 rounded-lg bg-slate-200 skeleton-shimmer" />
            </div>

          </main>

          {/* ── Right Column: 4 Cols Sticky Editorial Sidebar Rail ── */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8 sticky top-20">
            
            {/* Trending in Jharkhand Widget */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600" />
                  <div className="w-32 h-4 bg-slate-300 rounded skeleton-shimmer" />
                </div>
                <div className="w-12 h-3 bg-slate-200 rounded skeleton-shimmer" />
              </div>

              {/* 4 Trending Items */}
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="flex gap-3 items-start pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="font-serif font-black text-slate-300 text-lg w-5 shrink-0">
                    {num}
                  </span>
                  <div className="flex-1 space-y-1.5">
                    <div className="w-14 h-2 bg-red-100 rounded skeleton-shimmer" />
                    <div className="w-full h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                    <div className="w-[70%] h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                  </div>
                  <div className="w-16 h-14 rounded-xl bg-slate-200 skeleton-shimmer shrink-0" />
                </div>
              ))}
            </div>

            {/* Live Wire Box Widget */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-28 h-4 bg-slate-300 rounded skeleton-shimmer" />
              </div>

              <div className="space-y-3.5">
                {[1, 2, 3].map(item => (
                  <div key={item} className="space-y-1.5 border-l-2 border-slate-200 pl-3">
                    <div className="w-16 h-2.5 bg-slate-200 rounded skeleton-shimmer" />
                    <div className="w-full h-3 bg-slate-200 rounded skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sponsored Placement Box Placeholder */}
            <div className="h-60 rounded-2xl border border-slate-200 bg-slate-100/70 p-4 flex flex-col items-center justify-center text-center space-y-2 skeleton-shimmer">
              <div className="w-20 h-2 bg-slate-300 rounded" />
              <div className="w-32 h-4 bg-slate-300 rounded" />
            </div>

          </aside>

        </div>
      </div>

    </div>
  );
}
