import { useState, useRef, useEffect } from 'react';
import { Article } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SingleArticleView from './SingleArticleView';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onArticleChange?: (article: Article) => void;
  onProgressChange?: (progress: number) => void;
  headerOffset: number;
  globalSettings?: any;
}

export default function ArticleView({ article: initialArticle, onBack, articles, onArticleClick, onArticleChange, onProgressChange, headerOffset, globalSettings }: ArticleViewProps) {
  const [loadedArticles, setLoadedArticles] = useState<Article[]>([initialArticle]);
  const [activeArticle, setActiveArticle] = useState<Article>(initialArticle);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const lastArticleIdRef = useRef(initialArticle.id);

  useEffect(() => {
    // If initialArticle is already among the loaded articles, this update was caused
    // by scrolling into a loaded article. DO NOT reset loadedArticles and DO NOT scroll to top!
    setLoadedArticles(prev => {
      const isAlreadyLoaded = prev.some(a => a.id === initialArticle.id);
      if (isAlreadyLoaded) {
        lastArticleIdRef.current = initialArticle.id;
        setActiveArticle(initialArticle);
        return prev;
      }
      // External navigation to a different article (clicked an article link or back to home)
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

  // Check if page is currently running inside headless screenshot capture
  const isScreenshotMode = typeof window !== 'undefined' && (
    window.location.search.includes('is_screenshot=1') ||
    !!(window as any).__IS_SCREENSHOT_CAPTURE__ ||
    !!globalSettings?.is_screenshot
  );

  useGSAP(() => {
    // In headless screenshot capture mode, disable infinite scroll so only the exact target article is captured full-length
    if (isScreenshotMode) {
      return;
    }

    // Infinite scroll trigger for interactive users (both live and wayback mode)
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
      const hOffset = headerOffset || 65;

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
  }, [activeArticle, headerOffset]);

  return (
    <div ref={containerRef} className="bg-brand-offwhite min-h-screen pb-24 relative">

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
