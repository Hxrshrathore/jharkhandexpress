"use client";

import React, { useState } from 'react';
import { Home, Radio, Search, Bookmark, Compass, X, Sparkles, Send, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MobileNavProps {
  currentView: 'home' | 'article' | 'saved';
  onHomeClick: () => void;
  onLiveClick?: () => void;
  onSavedClick?: () => void;
  onSearchClick: () => void;
  onMenuClick?: () => void;
  savedCount?: number;
  activeCategory?: string | null;
  onCategorySelect?: (category: string | null) => void;
  onSubscribeClick?: () => void;
  whatsappUrl?: string;
}

const CATEGORIES = [
  'Jharkhand',
  'National',
  'Politics',
  'Business',
  'Technology',
  'World',
  'Opinion',
  'Sports',
  'Entertainment',
];

export default function MobileNav({
  currentView,
  onHomeClick,
  onLiveClick,
  onSavedClick,
  onSearchClick,
  onMenuClick,
  savedCount = 0,
  activeCategory = null,
  onCategorySelect,
  onSubscribeClick,
  whatsappUrl,
}: MobileNavProps) {
  const [isExploreOpen, setIsExploreOpen] = useState(false);

  const handleExploreToggle = () => {
    setIsExploreOpen(prev => !prev);
  };

  const handleCategoryPick = (cat: string | null) => {
    if (onCategorySelect) {
      onCategorySelect(cat);
    }
    setIsExploreOpen(false);
  };

  const isHomeActive = currentView === 'home' && !activeCategory;
  const isSavedActive = currentView === 'saved';

  return (
    <>
      {/* ── Slide-up Explore / Desks Drawer ── */}
      <AnimatePresence>
        {isExploreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExploreOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            />

            {/* Quick Sheet Panel */}
            <motion.div
              initial={{ y: '100%', opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl p-5 overflow-hidden lg:hidden"
            >
              {/* Top Accent Gradient */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0D5C46] via-[#2A9D8F] to-[#E63946]" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0D5C46]/10 flex items-center justify-center text-[#0D5C46]">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">
                      Explore Desks & Topics
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Tap a section to filter the news wire
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExploreOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-[42vh] overflow-y-auto pr-1">
                <button
                  onClick={() => handleCategoryPick(null)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === null
                      ? 'bg-[#0D5C46] text-white shadow-xs'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>All Top Stories</span>
                  {activeCategory === null && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
                </button>

                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory?.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryPick(cat)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#E63946] text-white shadow-xs'
                          : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                {onSubscribeClick && (
                  <button
                    onClick={() => {
                      setIsExploreOpen(false);
                      onSubscribeClick();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:opacity-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Morning Dispatch</span>
                  </button>
                )}

                <a
                  href={whatsappUrl || "https://whatsapp.com/channel/YOUR_CHANNEL_ID"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-xs hover:bg-[#20bd5a] transition-all"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>WhatsApp Wire</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Floating Mobile / Tablet Bottom Dock ── */}
      <div 
        className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-40 lg:hidden pointer-events-auto"
        style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
      >
        <nav
          className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-[0_12px_36px_-6px_rgba(15,23,42,0.16)] overflow-hidden"
          aria-label="Mobile Navigation Dock"
        >
          {/* Signature 1.5px brand top accent line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#0D5C46] via-[#2A9D8F] to-[#E63946]" />

          <div className="flex items-center justify-around px-2 py-1.5">
            {/* 1. Home */}
            <button
              onClick={onHomeClick}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isHomeActive
                  ? 'text-[#0D5C46] dark:text-emerald-400 font-bold bg-[#0D5C46]/10 dark:bg-emerald-500/15'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center w-6 h-6 mb-0.5">
                <Home className="w-5 h-5" strokeWidth={isHomeActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] tracking-tight font-sans">Home</span>
              {isHomeActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#0D5C46] dark:bg-emerald-400" />
              )}
            </button>

            {/* 2. Live Wire */}
            <button
              onClick={onLiveClick}
              className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 text-slate-500 dark:text-slate-400 hover:text-[#0D5C46] font-medium"
            >
              <div className="relative flex items-center justify-center w-6 h-6 mb-0.5">
                <Radio className="w-5 h-5 text-[#0D5C46] dark:text-emerald-400" strokeWidth={2.2} />
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex h-2 w-2 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </span>
              </div>
              <span className="text-[10px] tracking-tight font-sans text-[#0D5C46] dark:text-emerald-400 font-bold">
                Live Wire
              </span>
            </button>

            {/* 3. Search */}
            <button
              onClick={onSearchClick}
              className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            >
              <div className="relative flex items-center justify-center w-6 h-6 mb-0.5">
                <Search className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="text-[10px] tracking-tight font-sans">Search</span>
            </button>

            {/* 4. Saved Articles */}
            <button
              onClick={onSavedClick}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isSavedActive
                  ? 'text-[#E63946] font-bold bg-[#E63946]/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center w-6 h-6 mb-0.5">
                <Bookmark className="w-5 h-5" strokeWidth={isSavedActive ? 2.5 : 2} />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-3.5 h-3.5 rounded-full bg-[#E63946] text-white text-[8px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight font-sans">Saved</span>
              {isSavedActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#E63946]" />
              )}
            </button>

            {/* 5. Explore Desks */}
            <button
              onClick={handleExploreToggle}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isExploreOpen || activeCategory !== null
                  ? 'text-[#0D5C46] dark:text-emerald-400 font-bold bg-[#0D5C46]/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center w-6 h-6 mb-0.5">
                <Compass className={`w-5 h-5 transition-transform duration-200 ${isExploreOpen ? 'rotate-45 text-[#0D5C46]' : ''}`} strokeWidth={2} />
                {activeCategory && !isExploreOpen && (
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#E63946] ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>
              <span className="text-[10px] tracking-tight font-sans truncate max-w-[48px]">
                {activeCategory ? activeCategory : 'Explore'}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
