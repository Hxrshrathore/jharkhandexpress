"use client";

import { useState, useRef, useEffect } from 'react';
import { Article } from '../types';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowDown, 
  Type, 
  MessageCircle, 
  Link2, 
  Bookmark, 
  Search,
  ExternalLink 
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SingleArticleView from './SingleArticleView';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const GoogleGIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onArticleChange?: (article: Article) => void;
  onProgressChange?: (progress: number) => void;
  headerOffset: number;
  globalSettings?: any;
  onSearchClick?: () => void;
  onTopicClick?: (topic: string) => void;
}

export default function ArticleView({ 
  article: initialArticle, 
  onBack, 
  articles, 
  onArticleClick, 
  onArticleChange, 
  onProgressChange, 
  headerOffset, 
  globalSettings,
  onSearchClick,
  onTopicClick
}: ArticleViewProps) {
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([initialArticle]);
  const [activeArticle, setActiveArticle] = useState<Article>(initialArticle);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const lastArticleIdRef = useRef(initialArticle.id);

  // Sync active article bookmark state
  useEffect(() => {
    const saved = localStorage.getItem('je_saved_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsBookmarked(parsed.includes(activeArticle.id));
      } catch (e) {}
    } else {
      setIsBookmarked(false);
    }
  }, [activeArticle.id]);

  useEffect(() => {
    setLoadedArticles(prev => {
      const isAlreadyLoaded = prev.some(a => a.id === initialArticle.id);
      if (isAlreadyLoaded) {
        lastArticleIdRef.current = initialArticle.id;
        setActiveArticle(initialArticle);
        return prev;
      }
      lastArticleIdRef.current = initialArticle.id;
      setActiveArticle(initialArticle);
      onArticleChange?.(initialArticle);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return [initialArticle];
    });
  }, [initialArticle.id, onArticleChange]);

  // Dynamically update document title and URL path on client
  useEffect(() => {
    if (activeArticle && typeof window !== 'undefined') {
      document.title = `${activeArticle.title} - Jharkhand Express`;
      
      const rawSlug = activeArticle.slug || activeArticle.id;
      const slug = rawSlug ? String(rawSlug).replace(/^["']|["']$/g, '').trim() : '';
      if (!slug || slug === '"') return;

      const rawWaybackBase = globalSettings?.wayback_base || (window.location.pathname.startsWith('/wayback/') ? window.location.pathname.match(/^(\/wayback\/[^/]+)/)?.[1] : null);
      
      if (rawWaybackBase) {
        const cleanBase = decodeURIComponent(rawWaybackBase);
        const search = window.location.search || '';
        const targetPath = `${cleanBase}/article/${slug}`;
        if (decodeURIComponent(window.location.pathname) !== targetPath) {
          window.history.replaceState(null, '', `${targetPath}${search}`);
        }
      } else {
        const targetPath = `/article/${slug}`;
        if (window.location.pathname !== targetPath) {
          window.history.replaceState(null, '', targetPath);
        }
      }
    }
  }, [activeArticle, globalSettings]);

  const isScreenshotMode = typeof window !== 'undefined' && (
    window.location.search.includes('is_screenshot=1') ||
    !!(window as any).__IS_SCREENSHOT_CAPTURE__ ||
    !!globalSettings?.is_screenshot
  );

  useGSAP(() => {
    if (isScreenshotMode) return;

    ScrollTrigger.create({
      trigger: endRef.current,
      start: 'top 95%',
      onEnter: () => {
        setLoadedArticles(prev => {
          const lastArticle = prev[prev.length - 1];
          const nextArticle = articles.find(a => a.id !== lastArticle.id && a.category === lastArticle.category && !prev.find(l => l.id === a.id)) || 
                              articles.find(a => !prev.find(l => l.id === a.id));
          
          if (nextArticle) {
            setTimeout(() => {
              try { ScrollTrigger.refresh(); } catch (e) {}
            }, 200);
            return [...prev, nextArticle];
          }
          return prev;
        });
      }
    });
  }, { scope: containerRef, dependencies: [loadedArticles.length, isScreenshotMode] });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById(`article-container-${activeArticle.id}`);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const hOffset = 50;

      const currentScroll = -(rect.top - hOffset);
      const totalScroll = rect.height - viewportHeight + hOffset;

      if (totalScroll <= 0) {
        setProgress(0);
        return;
      }

      const percentage = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
      setProgress(percentage);
      onProgressChange?.(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeArticle, onProgressChange]);

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const toggleBookmark = () => {
    const saved = localStorage.getItem('je_saved_articles');
    let parsed: string[] = [];
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) {}
    }
    
    if (isBookmarked) {
      parsed = parsed.filter(id => id !== activeArticle.id);
      setIsBookmarked(false);
      toast('Article removed from bookmarks');
    } else {
      if (!parsed.includes(activeArticle.id)) parsed.push(activeArticle.id);
      setIsBookmarked(true);
      toast.success('Article saved to your reading list');
    }
    localStorage.setItem('je_saved_articles', JSON.stringify(parsed));
  };

  const copyArticleLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Article link copied to clipboard');
      }).catch(() => {
        toast('Link copied');
      });
    } else {
      toast.success('Article link ready');
    }
  };

  const googleNewsUrl = globalSettings?.google_news_url || '/api/google-news';

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen pb-24 relative">

      {/* ── STICKY EDITORIAL ARTICLE HEADER BAR: ALWAYS VISIBLE ACROSS INFINITE SCROLL ── */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
        {/* 3px Reading Progress Bar at the absolute top */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-slate-200/50">
          <div 
            className="h-full bg-gradient-to-r from-[#0D5C46] via-[#2A9D8F] to-[#E63946] transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-4">
          
          {/* Breadcrumb / Back */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 font-sans min-w-0">
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] shrink-0">
                {activeArticle.category || 'Jharkhand'}
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="truncate text-slate-600 font-medium max-w-[130px] sm:max-w-xs md:max-w-sm lg:max-w-md hidden sm:inline">
                {activeArticle.title}
              </span>
            </div>
          </div>

          {/* Quick Reading Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font Size Adjuster */}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={cycleFontSize}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1 text-xs font-semibold"
                    aria-label="Adjust font size"
                  >
                    <Type className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-mono font-bold inline-block">
                      {fontSize === 'normal' ? '1x' : fontSize === 'large' ? '1.2x' : '1.4x'}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Toggle text size</p></TooltipContent>
              </Tooltip>

              {/* Google Preferred Source Action */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={googleNewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-blue-300 text-slate-800 text-xs font-semibold shadow-xs hover:shadow-sm transition-all active:scale-95 shrink-0"
                    aria-label="Add Jharkhand Express as preferred source on Google"
                  >
                    <GoogleGIcon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline text-[11px] font-bold text-slate-700">Google Preferred</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Add as preferred source on Google</p></TooltipContent>
              </Tooltip>

              {/* WhatsApp Instant Share */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${activeArticle.title} • Jharkhand Express: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-[#25D366] hover:bg-[#25D366]/10 transition-all active:scale-95"
                    aria-label="Share on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Share on WhatsApp</p></TooltipContent>
              </Tooltip>

              {/* Twitter / X Share */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(activeArticle.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-all hidden sm:flex active:scale-95"
                    aria-label="Share on X"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Share on X</p></TooltipContent>
              </Tooltip>

              {/* Copy Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyArticleLink}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
                    aria-label="Copy article link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>Copy Link</p></TooltipContent>
              </Tooltip>

              {/* Bookmark */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleBookmark}
                    className={`p-2 rounded-xl transition-all active:scale-95 ${
                      isBookmarked 
                        ? 'text-[#E63946] bg-[#E63946]/10 font-bold' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    aria-label="Bookmark article"
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p>{isBookmarked ? 'Bookmarked' : 'Save Story'}</p></TooltipContent>
              </Tooltip>

              {/* Search Modal Trigger */}
              {onSearchClick && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onSearchClick}
                      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-95"
                      aria-label="Search articles"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom"><p>Search</p></TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>

        </div>
      </div>

      {/* Loaded Articles Stream */}
      <div className="flex flex-col">
        {loadedArticles.map((art, index) => (
          <div key={`${art.id}-${index}`}>
            <SingleArticleView 
              article={art}
              articles={articles}
              onArticleClick={onArticleClick}
              onInView={(a) => {
                setActiveArticle(a);
                onArticleChange?.(a);
              }}
              onBack={onBack}
              globalSettings={globalSettings}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              hideDuplicateBar={true}
              onTopicClick={(slug) => {
                onTopicClick?.(slug);
                onBack();
              }}
            />
            {index < loadedArticles.length - 1 && (
              <div className="w-full flex items-center justify-center py-16 opacity-30">
                <div className="w-px h-32 bg-brand-black" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Infinite Scroll Trigger Point - active for all human browsing */}
      {!isScreenshotMode && (
        <div ref={endRef} className="max-w-7xl mx-auto px-6 lg:px-24 pt-16 text-center group">
          <div className="inline-flex flex-col items-center justify-center opacity-50 mb-8">
            <span className="text-xs font-black tracking-widest uppercase mb-4 animate-pulse">Initializing Next Node...</span>
            <ArrowDown className="w-8 h-8 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
