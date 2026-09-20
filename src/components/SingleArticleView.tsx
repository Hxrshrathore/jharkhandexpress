"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Article } from '../types';
import { 
  Clock, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  Bot, 
  ArrowLeft, 
  Link2, 
  MessageCircle, 
  Sparkles, 
  Send, 
  Type, 
  Flame, 
  Calendar, 
  TrendingUp, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CustomVideoPlayer from './CustomVideoPlayer';
import AdPlacement from './AdPlacement';
import { toast } from 'sonner';

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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

interface SingleArticleViewProps {
  article: Article;
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onInView: (article: Article) => void;
  onBack?: () => void;
  globalSettings?: any;
  fontSize?: 'normal' | 'large' | 'xlarge';
  onFontSizeChange?: (size: 'normal' | 'large' | 'xlarge') => void;
  hideDuplicateBar?: boolean;
  onTopicClick?: (topic: string) => void;
}

// Media Collage Bento Grid
function BentoMediaCollage({ items }: { items: Array<{ type: 'image' | 'video', url: string }> }) {
  if (items.length === 0) return null;
  if (items.length === 1) {
    const item = items[0];
    return (
      <div className="my-10 overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-md">
        {item.type === 'image' ? (
          <img src={item.url} alt="Article media" className="w-full h-auto object-cover max-h-[550px]" />
        ) : (
          <div className="aspect-video w-full">
            <CustomVideoPlayer src={item.url} />
          </div>
        )}
      </div>
    );
  }

  let gridClass = "grid gap-3.5 my-10";
  if (items.length === 2) {
    gridClass += " grid-cols-1 md:grid-cols-2";
  } else if (items.length === 3) {
    gridClass += " grid-cols-1 md:grid-cols-3 md:grid-rows-2 h-[460px]";
  } else {
    gridClass += " grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-[560px]";
  }

  return (
    <div className={gridClass}>
      {items.map((item, idx) => {
        let itemClass = "relative overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 group rounded-2xl shadow-xs";
        
        if (items.length === 3) {
          if (idx === 0) {
            itemClass += " md:col-span-2 md:row-span-2 h-full min-h-[300px]";
          } else {
            itemClass += " md:col-span-1 md:row-span-1 h-full min-h-[150px]";
          }
        } else if (items.length >= 4) {
          if (idx === 0) {
            itemClass += " md:col-span-2 md:row-span-2 h-full min-h-[300px]";
          } else if (idx === 1) {
            itemClass += " md:col-span-2 md:row-span-1 h-full min-h-[150px]";
          } else {
            itemClass += " md:col-span-1 md:row-span-1 h-full min-h-[150px]";
          }
        }

        return (
          <div key={idx} className={itemClass}>
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={`Media asset ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
            ) : (
              <CustomVideoPlayer src={item.url} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SingleArticleView({ 
  article, 
  articles, 
  onArticleClick, 
  onInView, 
  onBack, 
  globalSettings,
  fontSize: propFontSize,
  onFontSizeChange,
  hideDuplicateBar = false,
  onTopicClick
}: SingleArticleViewProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [internalFontSize, setInternalFontSize] = useState<'normal' | 'large' | 'xlarge'>(propFontSize || 'normal');

  useEffect(() => {
    if (propFontSize) {
      setInternalFontSize(propFontSize);
    }
  }, [propFontSize]);

  const currentFontSize = propFontSize || internalFontSize;
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const containerRef = useRef<HTMLElement>(null);

  // Bookmark check
  useEffect(() => {
    const saved = localStorage.getItem('je_saved_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.includes(article.id)) {
          setIsBookmarked(true);
        }
      } catch (e) {}
    }
  }, [article.id]);

  // Scroll reading progress listener
  useEffect(() => {
    const handleScroll = () => {
      const element = containerRef.current;
      if (!element) return;
      const totalHeight = element.clientHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const top = window.scrollY - element.offsetTop;
      const progress = Math.min(100, Math.max(0, (top / totalHeight) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger onInView for tracking
  useEffect(() => {
    onInView(article);
  }, [article, onInView]);

  const toggleBookmark = () => {
    const saved = localStorage.getItem('je_saved_articles');
    let parsed: string[] = [];
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) {}
    }
    
    if (isBookmarked) {
      parsed = parsed.filter(id => id !== article.id);
      setIsBookmarked(false);
      toast('Article removed from bookmarks');
    } else {
      if (!parsed.includes(article.id)) parsed.push(article.id);
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

  const cycleFontSize = () => {
    const nextSize: 'normal' | 'large' | 'xlarge' = 
      currentFontSize === 'normal' ? 'large' : currentFontSize === 'large' ? 'xlarge' : 'normal';
    setInternalFontSize(nextSize);
    onFontSizeChange?.(nextSize);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsNewsletterSubscribed(true);
    toast.success('Subscribed to Jharkhand Express Morning Dispatch!');
  };

  const heroVideoSrc = article.featuredVideo || (article.videoGallery && article.videoGallery.length > 0 ? article.videoGallery[0] : undefined);
  
  const mediaItems = [
    ...(article.gallery || []).map(url => ({ type: 'image' as const, url })),
    ...(article.videoGallery || []).map(url => ({ type: 'video' as const, url }))
  ];

  // Intelligent Ad & Media Content Renderer
  const renderContentWithMedia = () => {
    const hasExplicitAds = article.content.includes('<!-- wp:truth/ad-slot');
    
    if (hasExplicitAds) {
      const parts = article.content.split(/(<!-- wp:truth\/ad-slot type=".*?" \/-->)/g);
      return (
        <>
          {parts.map((part, index) => {
            const adMatch = part.match(/<!-- wp:truth\/ad-slot type="(.*?)" \/-->/);
            if (adMatch) {
               const type = adMatch[1] as 'leaderboard' | 'rectangle';
               return (
                 <AdPlacement 
                   key={index} 
                   type={type} 
                   slotId={`ARTICLE-${article.id}-${type}-${index}`} 
                   wrapperClassName="my-10 flex justify-center w-full" 
                   globalSettings={globalSettings} 
                   placementContext="article" 
                 />
               );
            }
            if (part.trim() === '') return null;
            return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
          })}
        </>
      );
    }

    // Standard Intelligent Auto-Placer
    let cleanContent = article.content.replace(/<!-- wp:gallery[\s\S]*?<!-- \/wp:gallery -->/g, '');
    cleanContent = cleanContent.replace(/<!-- wp:video[\s\S]*?<!-- \/wp:video -->/g, '');
    
    const paragraphs = cleanContent.split('</p>').filter(p => p.trim() !== '');
    const formattedParagraphs = paragraphs.map(p => p.endsWith('</p>') ? p : p + '</p>');
    
    const allAds = globalSettings?.site_ads || [];
    const currentDateObj = globalSettings?.simulated_date ? new Date(globalSettings.simulated_date) : new Date();
    
    const activeRectangleAds = allAds.filter((ad: any) => {
      if (!ad.active || ad.type !== 'rectangle' || !ad.show_in_articles) return false;
      const validFrom = new Date(ad.valid_from);
      const validTo = new Date(ad.valid_to);
      return currentDateObj >= validFrom && currentDateObj <= validTo;
    }).map((ad: any) => ({
      id: `dynamic-ad-${ad.id}`,
      imageUrl: ad.image_url,
      title: 'Sponsored Placement',
    }));

    let rectangleAdItems: any[] = [];
    const videoRectangleAd = activeRectangleAds.find((ad: any) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(ad.imageUrl));
    rectangleAdItems = videoRectangleAd ? [videoRectangleAd] : activeRectangleAds;

    const activeArticleAds = allAds.filter((ad: any) => {
      if (!ad.active || ad.type !== 'leaderboard' || !ad.show_in_articles) return false;
      const validFrom = new Date(ad.valid_from);
      const validTo = new Date(ad.valid_to);
      return currentDateObj >= validFrom && currentDateObj <= validTo;
    }).map((ad: any) => ({
      id: `dynamic-ad-${ad.id}`,
      imageUrl: ad.image_url,
      title: 'Sponsored Placement',
    }));

    const maxContainers = Math.max(1, formattedParagraphs.length - 1); 
    const chunkArray = (arr: any[], numChunks: number) => {
      const chunks: any[][] = Array.from({ length: numChunks }, () => []);
      arr.forEach((item, index) => {
        chunks[index % numChunks].push(item);
      });
      return chunks.filter(c => c.length > 0);
    };
    
    const adChunks = chunkArray(activeArticleAds, maxContainers);
    const elements: React.ReactNode[] = [];
    
    if (formattedParagraphs.length === 0) {
      if (mediaItems.length > 0) elements.push(<BentoMediaCollage key="media-only" items={mediaItems} />);
      elements.push(<div key="content" dangerouslySetInnerHTML={{ __html: cleanContent }} />);
      return <>{elements}</>;
    }

    formattedParagraphs.forEach((para, idx) => {
       elements.push(<div key={`p-${idx}`} dangerouslySetInnerHTML={{ __html: para }} />);
       
       if (idx < adChunks.length) {
          elements.push(
             <AdPlacement 
               key={`dynamic-ad-slot-${idx}`} 
               type="leaderboard" 
               slotId={`AUTO-DYN-${article.id}-${idx}`} 
               wrapperClassName="my-10 flex justify-center w-full" 
               items={adChunks[idx]}
             />
          );
       }
       
       if (idx === 1 && mediaItems.length > 0) {
          elements.push(<BentoMediaCollage key={`media-${idx}`} items={mediaItems} />);
       }

       if (idx === 3 && rectangleAdItems.length > 0) {
          elements.push(
             <AdPlacement 
               key={`dynamic-rect-slot-${idx}`} 
               type="rectangle" 
               slotId={`AUTO-DYN-REC-${article.id}`} 
               wrapperClassName="my-10 flex justify-center w-full" 
               items={rectangleAdItems}
             />
          );
       }
    });
    
    if (formattedParagraphs.length <= 1 && mediaItems.length > 0) {
       elements.push(<BentoMediaCollage key="media-fallback" items={mediaItems} />);
    }
    if (formattedParagraphs.length <= 3 && rectangleAdItems.length > 0) {
       elements.push(
          <AdPlacement 
            key="dynamic-rect-slot-fallback" 
            type="rectangle" 
            slotId={`AUTO-DYN-REC-${article.id}-fallback`} 
            wrapperClassName="my-10 flex justify-center w-full" 
            items={rectangleAdItems}
          />
       );
    }
    
    return <>{elements}</>;
  };

  // Trending & Related Articles
  const relatedArticles = articles
    .filter(a => a.id !== article.id && (a.category === article.category || !article.category))
    .slice(0, 6);

  const trendingStories = articles
    .filter(a => a.id !== article.id)
    .slice(0, 5);

  const categoryName = typeof article.category === 'string' ? article.category : 'Jharkhand';
  const authorName = article.author?.name || 'Bureau Special Correspondent';
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(article.publishedAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const googleNewsUrl = globalSettings?.google_news_url || '/api/google-news';

  const fontSizeStyle: React.CSSProperties = {
    ['--article-font-size' as any]: currentFontSize === 'xlarge' ? '1.38rem' : currentFontSize === 'large' ? '1.2rem' : '1.05rem',
    ['--article-line-height' as any]: currentFontSize === 'xlarge' ? '2.1' : currentFontSize === 'large' ? '1.95' : '1.8',
  };

  return (
    <article 
      ref={containerRef} 
      id={`article-container-${article.id}`} 
      className="w-full bg-[#FAF9F6] text-slate-900 pb-24 relative selection:bg-emerald-100 selection:text-emerald-900"
    >
      {/* ── Fixed Reading Progress Bar (only if not hosted in sticky ArticleView) ── */}
      {!hideDuplicateBar && (
        <>
          <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-200/50">
            <div 
              className="h-full bg-gradient-to-r from-[#0D5C46] via-[#2A9D8F] to-[#E63946] transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* ── Editorial Utility Bar ── */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4">
          
          {/* Breadcrumb / Back */}
          <div className="flex items-center gap-3 min-w-0">
            {onBack ? (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </a>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-sans truncate">
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px] shrink-0">
                {categoryName}
              </span>
              <span className="text-slate-300">/</span>
              <span className="truncate text-slate-600 font-medium max-w-sm lg:max-w-md">
                {article.title}
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
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1 text-xs font-semibold"
                    aria-label="Adjust font size"
                  >
                    <Type className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-mono font-bold hidden md:inline">
                      {currentFontSize === 'normal' ? '1x' : currentFontSize === 'large' ? '1.2x' : '1.4x'}
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
                    href={`https://wa.me/?text=${encodeURIComponent(`${article.title} • Jharkhand Express: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
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
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
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
            </TooltipProvider>
          </div>

        </div>
      </div>
    </>
  )}

      {/* ── Main Container: Editorial Layout ── */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* ── Left / Center Main Article Column (8 cols) ── */}
          <main className="lg:col-span-8 space-y-8">
            
            {/* Section Tag & Dateline */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-[#0D5C46] text-white shadow-xs">
                {categoryName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.readingTime || '4 min'} read</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Verified Dispatch
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif font-black text-2xl sm:text-4xl md:text-5xl lg:text-[46px] leading-[1.18] tracking-tight text-slate-950">
              {article.title}
            </h1>

            {/* Subtitle / Lead Paragraph if excerpt exists */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl text-slate-600 font-serif italic leading-relaxed border-l-2 border-[#0D5C46] pl-4 py-0.5">
                {article.excerpt}
              </p>
            )}

            {/* ── Rich Bureau Byline Card ── */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-slate-200/90 text-sm">
              <div className="flex items-center gap-3.5">
                {/* Author Avatar Badge */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0D5C46] to-[#2A9D8F] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs ring-2 ring-emerald-100">
                  {authorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 font-sans tracking-tight text-[15px]">
                      {authorName}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Ranchi Special Bureau</span>
                    <span>•</span>
                    <span>{formattedTime} IST</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 font-mono text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Updated Wire</span>
              </div>
            </div>

            {/* ── Highlighted Google Preferred Source Callout ── */}
            <div className="flex items-center justify-between flex-wrap gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/50 border border-blue-100/90 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-blue-100 flex items-center justify-center shrink-0">
                  <GoogleGIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 font-sans tracking-tight">
                      Follow Jharkhand Express
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-md bg-blue-100 text-blue-700 font-mono">
                      Preferred Source
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Prioritize verified Jharkhand journalism in your Google Search, Top Stories & News
                  </p>
                </div>
              </div>

              <a
                href={googleNewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50/70 border border-blue-200 hover:border-blue-400 text-slate-900 hover:text-blue-600 text-xs font-bold shadow-xs hover:shadow-sm transition-all active:scale-95"
              >
                <GoogleGIcon className="w-4 h-4" />
                <span>Add as preferred source on Google</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            {/* ── Hero Media (Image or Video) ── */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-lg relative group">
              {article.youtubeVideoId ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${article.youtubeVideoId}?autoplay=0&controls=1`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : heroVideoSrc ? (
                <div className="w-full aspect-video">
                  <CustomVideoPlayer src={heroVideoSrc} autoplayHero={false} />
                </div>
              ) : (
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full h-auto max-h-[580px] object-cover"
                />
              )}

              {/* Photo Caption & Source Credit */}
              {article.imageCaption ? (
                <div className="p-3 bg-white/95 border-t border-slate-200/80 text-xs text-slate-600 font-sans flex items-center justify-between">
                  <span>{article.imageCaption}</span>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider shrink-0 ml-4">
                    Photo: Bureau Desk
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-white/95 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Jharkhand Express News Service</span>
                  <span className="uppercase text-[10px] tracking-wider text-slate-400">Archive Photo</span>
                </div>
              )}
            </div>

            {/* ── Executive Brief / AI Takeaway Box ── */}
            {(article.aiSummary || article.excerpt) && (
              <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border border-emerald-200/80 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0D5C46] via-[#2A9D8F] to-[#E63946]" />
                
                <div className="flex items-center gap-2 mb-3 text-[#0D5C46]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
                    Executive Brief • 60-Second Dispatch
                  </span>
                </div>

                <p 
                  className="text-slate-800 font-sans leading-relaxed font-medium transition-[font-size] duration-150"
                  style={{
                    fontSize: currentFontSize === 'xlarge' ? '1.18rem' : currentFontSize === 'large' ? '1.08rem' : '0.98rem'
                  }}
                >
                  {article.aiSummary || article.excerpt}
                </p>
              </div>
            )}

            {/* ── Article Content Body ── */}
            <div 
              className="article-body-content prose max-w-none font-serif text-slate-800 space-y-6 transition-[font-size,line-height] duration-150"
              style={fontSizeStyle}
            >
              {renderContentWithMedia()}
            </div>

            {/* ── Tags & Attribution ── */}
            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mr-2">
                    Filed Under:
                  </span>
                  {article.tags.map((tag, idx) => {
                    const cleanTag = tag.trim().replace(/^#/, '');
                    const slug = cleanTag.toLowerCase().replace(/[\s\-_]+/g, '-').replace(/[^\w\u0900-\u097F-]/g, '').replace(/^-+|-+$/g, '') || encodeURIComponent(cleanTag) || cleanTag;
                    return (
                      <a 
                        key={`tag-${idx}-${slug}`} 
                        href={`/?tag=${encodeURIComponent(slug)}`}
                        onClick={(e) => {
                          if (onTopicClick) {
                            e.preventDefault();
                            onTopicClick(slug);
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#E63946] hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                      >
                        #{cleanTag}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Story Action Footer ── */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-base text-slate-900 mb-0.5">
                  Did this report inform you?
                </h4>
                <p className="text-xs text-slate-500 font-sans">
                  Share this verified dispatch with your network across Jharkhand and Eastern India.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={googleNewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/60 text-slate-800 text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  <GoogleGIcon className="w-4 h-4" />
                  <span>Google Preferred</span>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${article.title} • Read more on Jharkhand Express: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-xs hover:bg-[#20bd5a] transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>WhatsApp Share</span>
                </a>

                <button
                  onClick={toggleBookmark}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isBookmarked 
                      ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946]' 
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* ── Related Coverage Grid ── */}
            {relatedArticles.length > 0 && (
              <section className="pt-10 border-t border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C46]" />
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                      Related Coverage in {categoryName}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    More Dispatches
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedArticles.slice(0, 3).map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onArticleClick(rel)}
                      className="group cursor-pointer bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-16/10 overflow-hidden bg-slate-100 relative">
                        <img 
                          src={rel.imageUrl} 
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-[#0D5C46] text-white">
                          {rel.category}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <h4 className="font-serif font-bold text-sm sm:text-[15px] leading-snug text-slate-900 group-hover:text-[#0D5C46] transition-colors line-clamp-3">
                          {rel.title}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                          <span>{new Date(rel.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                          <span className="flex items-center gap-1 font-sans font-bold text-[#0D5C46] group-hover:translate-x-0.5 transition-transform">
                            Read <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </main>

          {/* ── Right Column: Sticky Editorial Sidebar (4 cols) ── */}
          <aside className="hidden lg:block lg:col-span-4 space-y-8 sticky top-20 self-start">
            
            {/* 1. Trending in Jharkhand */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#E63946]" />
                  <h3 className="font-serif font-bold text-base text-slate-900 tracking-tight">
                    Trending in Jharkhand
                  </h3>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Live Wire
                </span>
              </div>

              <div className="space-y-4">
                {trendingStories.map((trend, idx) => (
                  <div
                    key={trend.id}
                    onClick={() => onArticleClick(trend)}
                    className="group cursor-pointer flex items-start gap-3 pb-3.5 border-b border-slate-100 last:border-0 last:pb-0"
                  >
                    <span className="font-serif font-black text-2xl text-slate-300 group-hover:text-[#E63946] transition-colors shrink-0 w-7">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        {trend.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm leading-snug text-slate-800 group-hover:text-[#0D5C46] transition-colors line-clamp-2">
                        {trend.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sidebar Sponsored Placement */}
            <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex justify-center overflow-hidden">
              <AdPlacement 
                type="rectangle" 
                slotId="HP-REC-01" 
                globalSettings={globalSettings} 
                placementContext="article" 
              />
            </div>

            {/* 3. Morning Dispatch Newsletter Card */}
            <div className="bg-gradient-to-br from-[#0B132B] to-[#1C2541] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Send className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                  Morning Dispatch
                </span>
              </div>

              <h4 className="font-serif font-bold text-lg text-white mb-2 leading-snug">
                Jharkhand's Key Headlines, Delivered at 7:00 AM
              </h4>
              <p className="text-xs text-slate-300 mb-4 font-sans leading-relaxed">
                Get an uncompromised briefing on state politics, mining, governance, and business corridors every weekday.
              </p>

              {isNewsletterSubscribed ? (
                <div className="p-3 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-semibold">
                  ✓ You are subscribed to Morning Dispatch!
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                  <input 
                    type="email" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-hidden focus:border-emerald-400 transition-colors"
                  />
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    Join Morning Briefing
                  </button>
                </form>
              )}
            </div>

          </aside>

        </div>
      </div>
    </article>
  );
}
