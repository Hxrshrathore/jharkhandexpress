/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect } from 'react';
import { Search, Menu, Clock, ArrowLeft, X, Globe, Radio, Bookmark, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND, SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/brand';

interface HeaderProps {
  onCategoryClick?: (category: string | null) => void;
  activeCategory?: string | null;
  onSubscribeClick?: () => void;
  onSearchClick?: () => void;
  readingArticle?: { title: string; category?: string } | null;
  onBack?: () => void;
  simulatedDate?: string;
  savedCount?: number;
  onSavedClick?: () => void;
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
  'Entertainment'
];

export default function Header({
  onCategoryClick,
  activeCategory,
  onSubscribeClick,
  onSearchClick,
  readingArticle,
  onBack,
  simulatedDate,
  savedCount = 0,
  onSavedClick,
  whatsappUrl,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState<string>('');
  const [isSimulated, setIsSimulated] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<'jharkhand' | 'national' | 'global'>('jharkhand');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clock management
  useEffect(() => {
    if (simulatedDate) {
      setIsSimulated(true);
      const baseMs = new Date(simulatedDate).getTime();
      const mountMs = Date.now();

      const updateSimulatedClock = () => {
        const elapsed = Date.now() - mountMs;
        const current = new Date(baseMs + elapsed);
        const dateStr = current.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = current.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setTime(`${dateStr} • ${timeStr}`);
      };

      updateSimulatedClock();
      const interval = setInterval(updateSimulatedClock, 1000);
      return () => clearInterval(interval);
    }

    let intervalId: any = null;
    const initTime = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.simulated_date) {
          setIsSimulated(true);
          const baseMs = new Date(data.simulated_date).getTime();
          const mountMs = Date.now();

          const updateSim = () => {
            const elapsed = Date.now() - mountMs;
            const current = new Date(baseMs + elapsed);
            const dateStr = current.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = current.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            setTime(`${dateStr} • ${timeStr}`);
          };

          updateSim();
          intervalId = setInterval(updateSim, 1000);
          return;
        }
      } catch (e) {
        // ignore fallback
      }

      setIsSimulated(false);
      const updateRealTime = () => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
        setTime(`${dateStr}, ${timeStr}`);
      };
      updateRealTime();
      intervalId = setInterval(updateRealTime, 1000);
    };

    initTime();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [simulatedDate]);

  const handleCategoryClick = (cat: string) => {
    if (activeCategory === cat) {
      onCategoryClick?.(null);
    } else {
      onCategoryClick?.(cat);
    }
  };

  const handleEditionChange = (edition: 'jharkhand' | 'national' | 'global') => {
    setSelectedEdition(edition);
    if (edition === 'jharkhand') onCategoryClick?.('Jharkhand');
    else if (edition === 'national') onCategoryClick?.('National');
    else onCategoryClick?.('World');
  };

  return (
    <header className="relative w-full z-100 bg-[#FAF9F6] border-b border-slate-200/80 transition-shadow">
      
      {/* ── TOP UTILITY STRIP ── */}
      <div className="bg-[#0B132B] text-slate-200 text-[11px] font-medium py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Left: Dateline, Live Indicator, Weather */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] tracking-widest text-emerald-400 font-semibold uppercase">
                {isSimulated ? 'ARCHIVE WIRE' : 'EXPRESS LIVE'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400 pl-3 border-l border-slate-800">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="font-mono tracking-tight text-[11px] text-slate-300">{time || 'Live'}</span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-slate-300 pl-3 border-l border-slate-800">
              <span className="text-amber-400 text-xs">☀️</span>
              <span className="font-sans font-semibold text-[11px]">Ranchi 27°C</span>
            </div>
          </div>

          {/* Center: Edition Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-full border border-slate-700/60">
            <button
              onClick={() => handleEditionChange('jharkhand')}
              className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                selectedEdition === 'jharkhand' ? 'bg-[#E63946] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Jharkhand Edition
            </button>
            <button
              onClick={() => handleEditionChange('national')}
              className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                selectedEdition === 'national' ? 'bg-[#0D5C46] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              National
            </button>
            <button
              onClick={() => handleEditionChange('global')}
              className={`px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all ${
                selectedEdition === 'global' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Global
            </button>
          </div>

          {/* Right: Language Dropdown + Fast WhatsApp Channel Action */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label="Select Language"
              >
                <Globe className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.label || 'English'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-1.5 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-110 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800">
                      Select Edition Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang.code as LanguageCode);
                          setIsLangMenuOpen(false);
                          // Translate support trigger
                          if (typeof window !== 'undefined') {
                            const event = new CustomEvent('je_lang_change', { detail: lang.code });
                            window.dispatchEvent(event);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-slate-800 transition-colors ${
                          currentLang === lang.code ? 'text-emerald-400 font-bold bg-slate-800/50' : 'text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </span>
                        {currentLang === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href={whatsappUrl || "https://whatsapp.com/channel/YOUR_CHANNEL_ID"}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-[10px] font-bold hover:bg-[#25D366] hover:text-white transition-all shadow-xs"
            >
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              WhatsApp Alerts
            </a>
          </div>

        </div>
      </div>

      {/* ── MAIN MASTHEAD BAR ── */}
      <div className={`transition-all duration-200 ${isScrolled ? 'py-2 bg-white/95 backdrop-blur-md shadow-xs' : 'py-3 bg-[#FAF9F6]'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          {/* Mobile menu trigger / back button */}
          <div className="flex items-center gap-3 lg:hidden">
            {readingArticle ? (
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
            ) : (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                aria-label="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main Brand Logo */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onCategoryClick?.(null);
                if (readingArticle) onBack?.();
              }}
              className="group flex items-center gap-3 cursor-pointer py-0.5"
            >
              <img
                src={BRAND.logoWebp}
                alt={BRAND.name}
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-serif font-black text-xl tracking-tight text-slate-950 leading-tight group-hover:text-[#E63946] transition-colors">
                  JHARKHAND EXPRESS
                </span>
                <span className="text-[9px] font-sans font-bold tracking-widest text-[#0D5C46] uppercase -mt-0.5">
                  The Voice of East India • Real Journalism
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Reading Mode Breadcrumb */}
          {readingArticle && (
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-slate-100/80 rounded-full border border-slate-200 max-w-md animate-in fade-in duration-200">
              <button onClick={onBack} className="text-[#E63946] hover:underline text-xs font-bold flex items-center gap-1 shrink-0">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-medium text-slate-600 truncate">
                {readingArticle.title}
              </span>
            </div>
          )}

          {/* Actions: Search, Saved Bookmarks, Newsletter */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onSearchClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-all shadow-xs"
              aria-label="Search articles"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline text-slate-500 font-sans">Search stories...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>

            {onSavedClick && (
              <button
                onClick={onSavedClick}
                className="relative p-2 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-xs"
                aria-label="Saved articles"
              >
                <Bookmark className="w-4 h-4" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E63946] text-white text-[9px] font-bold flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onSubscribeClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-950 hover:bg-[#E63946] text-white text-xs font-bold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Newsletter</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── DESKTOP NAVIGATION BAR ── */}
      <nav className="hidden lg:block bg-white border-t border-slate-200/70 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between">
          
          <div className="flex items-center space-x-1 py-1">
            {/* All Stories Pill */}
            <button
              onClick={() => onCategoryClick?.(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all ${
                !activeCategory
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              Top Stories
            </button>

            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all relative ${
                    isSelected
                      ? 'bg-[#E63946] text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                  {isSelected && (
                    <span className="inline-block ml-1 opacity-70 hover:opacity-100">✕</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-[#0D5C46]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D5C46] animate-pulse" />
              JHARKHAND RADAR
            </span>
          </div>

        </div>
      </nav>

      {/* ── MOBILE HORIZONTAL CATEGORY STRIP ── */}
      {!readingArticle && (
        <div className="lg:hidden bg-white border-t border-slate-200 py-2 px-4 overflow-x-auto scrollbar-none flex items-center gap-2">
          <button
            onClick={() => onCategoryClick?.(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${
              !activeCategory
                ? 'bg-slate-950 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#E63946] text-white font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MOBILE SLIDE-OUT DRAWER ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 bg-slate-950/60 backdrop-blur-xs flex"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <img src={BRAND.logoWebp} alt={BRAND.name} className="h-9 w-auto" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-2">
                      Editions
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => { handleEditionChange('jharkhand'); setIsMobileMenuOpen(false); }}
                        className={`py-1.5 text-xs font-bold rounded-md ${selectedEdition === 'jharkhand' ? 'bg-[#E63946] text-white' : 'text-slate-600'}`}
                      >
                        Jharkhand
                      </button>
                      <button
                        onClick={() => { handleEditionChange('national'); setIsMobileMenuOpen(false); }}
                        className={`py-1.5 text-xs font-bold rounded-md ${selectedEdition === 'national' ? 'bg-[#0D5C46] text-white' : 'text-slate-600'}`}
                      >
                        National
                      </button>
                      <button
                        onClick={() => { handleEditionChange('global'); setIsMobileMenuOpen(false); }}
                        className={`py-1.5 text-xs font-bold rounded-md ${selectedEdition === 'global' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                      >
                        Global
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-2">
                      Desks & Categories
                    </span>
                    <div className="space-y-1">
                      <button
                        onClick={() => { onCategoryClick?.(null); setIsMobileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-100"
                      >
                        Top Stories
                      </button>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { handleCategoryClick(cat); setIsMobileMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg ${activeCategory === cat ? 'bg-[#E63946] text-white font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onSubscribeClick?.(); }}
                  className="w-full py-3 bg-[#E63946] text-white font-bold rounded-xl text-sm shadow-md"
                >
                  Join Morning Dispatch
                </button>
                <a
                  href={whatsappUrl || "https://whatsapp.com/channel/YOUR_CHANNEL_ID"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#25D366] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  Follow on WhatsApp
                </a>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
