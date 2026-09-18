/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useEffect, useRef } from 'react';
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

function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '🌤️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '☀️';
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

  const [isVisible, setIsVisible] = useState(true);
  const [isScrolledPastTop, setIsScrolledPastTop] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [weather, setWeather] = useState<{ temp: number; city: string; code: number } | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchWeather() {
      try {
        let lat = 23.3441;
        let lon = 85.3096;
        let city = 'Ranchi';
        try {
          const geoRes = await fetch('/api/geo');
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.latitude && geoData.longitude) {
              lat = geoData.latitude;
              lon = geoData.longitude;
              city = geoData.city || city;
            }
          }
        } catch (e) {}

        if (!active) return;
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        if (res.ok && active) {
          const data = await res.json();
          if (data.current) {
            setWeather({
              temp: Math.round(data.current.temperature_2m),
              city,
              code: data.current.weather_code,
            });
          }
        }
      } catch (err) {}
    }
    fetchWeather();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. When near the top of the page
      if (currentScrollY <= 70) {
        setIsVisible(true);
        setIsScrolled(false);
        setIsScrolledPastTop(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      setIsScrolled(true);
      setIsScrolledPastTop(true);
      const diff = currentScrollY - lastScrollY.current;

      // 2. Scrolling UP: Reveal header immediately
      if (diff < -5) {
        setIsVisible(true);
      } 
      // 3. Scrolling DOWN: Hide header to maximize content reading
      else if (diff > 8 && currentScrollY > 120) {
        if (!isMobileMenuOpen && !isLangMenuOpen) {
          setIsVisible(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen, isLangMenuOpen]);

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
        const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        setTime(`${dateStr} • ${timeStr}`);
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
    <>
      {/* Spacer to prevent page jump when header becomes fixed */}
      {!readingArticle && isScrolledPastTop && (
        <div style={{ height: headerHeight ? `${headerHeight}px` : '120px' }} aria-hidden="true" />
      )}

      <header
        ref={headerRef}
        className={`w-full z-100 bg-[#FAF9F6] border-b border-slate-200/80 transition-transform duration-300 ease-in-out ${
          !readingArticle && isScrolledPastTop
            ? `fixed top-0 left-0 right-0 shadow-lg ${
                isVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
              }`
            : 'relative'
        }`}
      >
      
      {/* ── TOP UTILITY STRIP ── */}
      <div className="bg-[#0B132B] text-slate-200 text-[11px] font-medium py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Left: Dateline, Live Indicator, Weather */}
          <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-emerald-400 font-semibold uppercase">
                {isSimulated ? 'ARCHIVE' : 'LIVE'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 pl-2 sm:pl-3 border-l border-slate-800 shrink-0">
              <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-mono tracking-tight text-[10px] sm:text-[11px] text-slate-200 whitespace-nowrap">
                {time || 'Live Wire'}
              </span>
            </div>

            {weather ? (
              <div className="flex items-center gap-1 text-slate-300 pl-2 sm:pl-3 border-l border-slate-800 shrink-0">
                <span className="text-amber-400 text-xs">{getWeatherEmoji(weather.code)}</span>
                <span className="font-sans font-semibold text-[10px] sm:text-[11px] text-slate-200 whitespace-nowrap">
                  {weather.city} {weather.temp}°C
                </span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1 text-slate-300 pl-2 sm:pl-3 border-l border-slate-800 shrink-0">
                <span className="text-amber-400 text-xs">☀️</span>
                <span className="font-sans font-semibold text-[10px] sm:text-[11px] text-slate-200 whitespace-nowrap">
                  Ranchi 27°C
                </span>
              </div>
            )}
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

      {/* ── MAIN MASTHEAD BAR (INTEGRATED WITH CATEGORY NAVIGATION) ── */}
      <div className={`transition-all duration-200 ${isScrolled ? 'py-2 bg-white/95 backdrop-blur-md shadow-xs' : 'py-2.5 bg-[#FAF9F6]'}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          
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
          <div className="flex items-center gap-3 shrink-0 pr-2 lg:pr-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onCategoryClick?.(null);
                if (readingArticle) onBack?.();
              }}
              className="group flex items-center gap-2.5 cursor-pointer py-0.5"
            >
              <img
                src={BRAND.logoWebp}
                alt={BRAND.name}
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-102 shrink-0"
              />
              <div className="hidden sm:flex flex-col shrink-0">
                <span className="font-serif font-black text-lg xl:text-xl tracking-tight text-slate-950 leading-tight group-hover:text-[#E63946] transition-colors whitespace-nowrap">
                  JHARKHAND EXPRESS
                </span>
                <span className="text-[9px] font-sans font-bold tracking-widest text-[#0D5C46] uppercase">
                  The Voice of East India
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Integrated Categories Navigation Bar */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0 justify-start 2xl:justify-center px-2">
            {/* Top Stories Pill */}
            <button
              onClick={() => onCategoryClick?.(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all shrink-0 whitespace-nowrap ${
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
                  className={`px-2.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all shrink-0 whitespace-nowrap relative ${
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
          </nav>

          {/* Actions: Search, Saved Bookmarks, Newsletter */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={onSearchClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-all shadow-xs"
              aria-label="Search articles"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden xl:inline text-slate-500 font-sans">Search...</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 hover:bg-[#E63946] text-white text-xs font-bold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Newsletter</span>
            </button>
          </div>

        </div>
      </div>

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
                  <div>
                    <img src={BRAND.logoWebp} alt={BRAND.name} className="h-9 w-auto" />
                    {time && (
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-1">
                        <Clock className="w-3 h-3 text-[#0D5C46]" />
                        <span>{time}</span>
                      </div>
                    )}
                  </div>
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
    </>
  );
}
