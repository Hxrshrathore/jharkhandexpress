"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sendGAEvent } from '@next/third-parties/google';
import Header from '../components/Header';
import Hero from '../components/home/Hero';
import Ticker from '../components/home/Ticker';
import CategorySection from '../components/home/CategorySection';
import OpinionSection from '../components/home/OpinionSection';
import Sidebar from '../components/home/Sidebar';
import ArticleView from '../components/ArticleView';
import AdPlacement from '../components/AdPlacement';
import JharkhandRegionalRadar from '../components/home/JharkhandRegionalRadar';
import NotificationPrompt from '../components/NotificationPrompt';
import MobileNav from '../components/MobileNav';
import { Article } from '../types';
import { Search, MapPin, ExternalLink, RefreshCw, AlertCircle, Clock, Volume2, Maximize2, Shield, Share2, Link2, X, ArrowRight, Camera, MessageCircle, Briefcase, Code, Server, ShieldCheck, Activity, Globe2, Layers, Bookmark } from 'lucide-react';
import TrendingBar, { DateFilter } from '../components/TrendingBar';

function parseTimestampToSeconds(ts: string | null | undefined): number {
  if (!ts) return 0;
  let total = 0;
  const m = ts.match(/(\d+)m/);
  const s = ts.match(/(\d+)s/);
  if (m) total += parseInt(m[1]) * 60;
  if (s) total += parseInt(s[1]);
  return total;
}

function SavedArticleCard({ article, onClick }: { article: any, onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="cursor-pointer group" onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="aspect-video bg-zinc-100 mb-4 overflow-hidden rounded-lg relative">
        {article.youtubeVideoId && isHovered ? (
          <iframe
            src={`https://www.youtube.com/embed/${article.youtubeVideoId}?autoplay=1&mute=1&controls=0&start=${parseTimestampToSeconds(article.featuredVideoTimestamp)}`}
            className="w-full h-full object-cover scale-[1.3] pointer-events-none absolute inset-0"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : article.featuredVideo ? (
          <video 
            src={`${article.featuredVideo}#t=1.0`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            preload="metadata"
            muted
            playsInline
          />
        ) : (
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
      </div>
      <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase block mb-2">{article.category}</span>
      <h3 className="font-serif font-medium leading-snug group-hover:text-red-600 transition-colors">{article.title}</h3>
    </div>
  );
}

export default function ClientHome({ initialArticleSlug, initialCategory, dbArticles, globalSettings }: { initialArticleSlug?: string, initialCategory?: string, dbArticles: Article[], globalSettings?: any }) {
  const [currentView, setCurrentView] = useState<'home' | 'article' | 'saved'>(initialArticleSlug ? 'article' : 'home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Hero rotation state
  const [heroIndex, setHeroIndex] = useState(0);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [articlesViewed, setArticlesViewed] = useState(0);
  const [simulatedDate, setSimulatedDate] = useState<string>(globalSettings?.simulated_date || new Date().toISOString().split('T')[0]);
  const [allArticles, setAllArticles] = useState<Article[]>(() => {
    if (globalSettings?.simulated_date) {
      let endTime = new Date(globalSettings.simulated_date).getTime();
      if (!globalSettings.simulated_date.includes('T')) {
        endTime += 86400000 - 1; 
      }
      return dbArticles.filter(a => new Date(a.publishedAt).getTime() <= endTime);
    }
    return dbArticles;
  });

  useEffect(() => {
    if (simulatedDate && simulatedDate !== '') {
      let endTime = new Date(simulatedDate).getTime();
      // If simulatedDate doesn't include time (e.g. 'YYYY-MM-DD'), extend to end of day
      if (!simulatedDate.includes('T')) {
        endTime += 86400000 - 1; 
      }
      setAllArticles(dbArticles.filter(a => new Date(a.publishedAt).getTime() <= endTime));
    } else {
      setAllArticles(dbArticles);
    }
  }, [simulatedDate, dbArticles]);

  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [customArchiveDate, setCustomArchiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Modals
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Technology']);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; text: string } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const handleDateFilterChange = (filter: DateFilter, date?: string) => {
    setDateFilter(filter);
    if (filter === 'today') {
      setSimulatedDate(todayStr);
    } else if (filter === 'yesterday') {
      setSimulatedDate(yesterdayStr);
    } else if (filter === 'custom' && date) {
      setCustomArchiveDate(date);
      setSimulatedDate(date);
    } else if (filter === 'older') {
      setSimulatedDate(''); // Empty string implies no date filter/all time
    }
  };

  useEffect(() => {
    if (initialArticleSlug && dbArticles.length > 0) {
      const matched = dbArticles.find(a => a.slug === initialArticleSlug || a.id === initialArticleSlug);
      if (matched) {
        setSelectedArticle(matched);
        setReadingArticle(matched);
        setCurrentView('article');
      }
    }
  }, [initialArticleSlug, dbArticles]);

  // Global ⌘K / Ctrl+K search shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getCleanWaybackBase = () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/wayback/')) {
      const match = window.location.pathname.match(/^(\/wayback\/[^/]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    if (globalSettings?.wayback_base) {
      return decodeURIComponent(globalSettings.wayback_base);
    }
    return null;
  };

  const cleanWaybackBase = getCleanWaybackBase();

  useEffect(() => {
    const handlePopState = () => {
      const path = typeof window !== 'undefined' ? decodeURIComponent(window.location.pathname) : '';
      const waybackPrefix = getCleanWaybackBase();

      // Check if popped back or forward to an article
      if (path.includes('/article/')) {
        const slug = path.split('/article/')[1]?.replace(/\/$/, '');
        if (slug) {
          const matched = allArticles.find(a => a.slug === slug || a.id === slug) || dbArticles.find(a => a.slug === slug || a.id === slug);
          if (matched) {
            setSelectedArticle(matched);
            setReadingArticle(matched);
            setCurrentView('article');
            window.scrollTo({ top: 0, behavior: 'instant' });
            return;
          }
        }
      }

      // Check if popped back to home (standard root or wayback home)
      if (path === '/' || path === '' || (waybackPrefix && (path === waybackPrefix || path === `${waybackPrefix}/`))) {
        setCurrentView('home');
        setSelectedArticle(null);
        setReadingArticle(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      // Fallback: If not on an article route, return to home
      if (!path.includes('/article/')) {
        setCurrentView('home');
        setSelectedArticle(null);
        setReadingArticle(null);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allArticles, dbArticles, globalSettings]);

  useEffect(() => {
    if (currentView === 'home') {
      document.title = 'Jharkhand Express | News';
    } else if (currentView === 'article' && selectedArticle) {
      document.title = `${selectedArticle.title} | Jharkhand Express`;
    }
  }, [currentView, selectedArticle]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!localStorage.getItem('je_notifs_dismissed')) {
        setIsNotificationVisible(true);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadSaved = () => {
        const saved = localStorage.getItem('je_saved_articles');
        if (saved) {
          try { setSavedArticleIds(JSON.parse(saved)); } catch(e){}
        }
      };
      loadSaved();
      
      // Update when returning to home from article view
      const handleFocus = () => loadSaved();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [currentView]);

  // Hero auto-rotation (every 8 seconds)
  useEffect(() => {
    if (currentView !== 'home') return;
    const interval = setInterval(() => {
      setHeroIndex(prev => prev + 1); 
    }, 8000);
    return () => clearInterval(interval);
  }, [currentView]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setReadingArticle(article);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const slug = article.slug || article.id;
    const waybackPrefix = getCleanWaybackBase();
    if (waybackPrefix) {
      const search = window.location.search || '';
      const targetUrl = `${waybackPrefix}/article/${slug}${search}`;
      if (typeof window !== 'undefined' && decodeURIComponent(window.location.pathname + window.location.search) !== targetUrl) {
        window.history.pushState({ slug, view: 'article' }, '', targetUrl);
      }
    } else {
      window.history.pushState({ slug, view: 'article' }, '', `/article/${slug}`);
    }
    
    sendGAEvent('event', 'article_click', {
      article_slug: slug,
      article_title: article.title,
      article_category: article.category
    });
    
    setArticlesViewed(prev => {
      const next = prev + 1;
      if (next >= 2 && !localStorage.getItem('je_notifs_dismissed')) {
        setIsNotificationVisible(true);
      }
      return next;
    });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedArticle(null);
    setReadingArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const waybackPrefix = getCleanWaybackBase();
    if (waybackPrefix) {
      const search = window.location.search || '';
      const homeUrl = `${waybackPrefix}${search}`;
      if (typeof window !== 'undefined' && decodeURIComponent(window.location.pathname + window.location.search) !== homeUrl) {
        window.history.pushState({ view: 'home' }, '', homeUrl);
      }
    } else if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({ view: 'home' }, '', '/');
    }
  };

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentView('home');
    setSelectedArticle(null);
    setReadingArticle(null);
    if (category) {
      sendGAEvent('event', 'category_click', {
        category_name: category
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const waybackPrefix = getCleanWaybackBase();
    if (waybackPrefix) {
      const search = window.location.search || '';
      const homeUrl = `${waybackPrefix}${search}`;
      if (typeof window !== 'undefined' && decodeURIComponent(window.location.pathname + window.location.search) !== homeUrl) {
        window.history.pushState({ view: 'home' }, '', homeUrl);
      }
    } else if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({ view: 'home' }, '', '/');
    }
  };

  const handleTopicClick = (slug: string | null) => {
    setSelectedTopic(slug);
    setCurrentView('home');
    if (slug) {
      sendGAEvent('event', 'topic_click', { topic_slug: slug });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Derive display articles based on selectedTopic and selectedCategory
  const displayArticles = allArticles.filter(a => {
    let match = true;
    if (selectedTopic) {
      const tags = a.tags || [];
      const topicMatch = tags.some(t => t.toLowerCase().replace(/\s+/g, '-') === selectedTopic) || 
                         a.title.toLowerCase().includes(selectedTopic.replace(/-/g, ' '));
      if (!topicMatch) match = false;
    }
    if (match && selectedCategory) {
      const allCats = [a.category, ...(a.categories || [])].join(' ').toLowerCase();
      
      if (selectedCategory === 'World Affairs' || selectedCategory === 'World') {
        if (!['world', 'international', 'global', 'foreign', 'affairs'].some(k => allCats.includes(k))) match = false;
      } else if (selectedCategory === 'States' || selectedCategory === 'States & Regional') {
        if (!['state', 'jharkhand', 'odisha', 'regional', 'local', 'bihar', 'up', 'maharashtra', 'uttar pradesh', 'delhi', 'rajsthan', 'west bengal', 'madhya pradesh', 'karnatka', 'manipur', 'telangana', 'haryana', 'tamil nadu'].some(k => allCats.includes(k))) match = false;
      } else if (selectedCategory === 'Nation' || selectedCategory === 'National Desk') {
        if (!['nation', 'india', 'national', 'politics', 'government', 'news'].some(k => allCats.includes(k))) match = false;
      } else {
        if (!allCats.includes(selectedCategory.toLowerCase())) match = false;
      }
    }
    return match;
  });

  // Organize articles into sections
  const usedIds = new Set<string>();
  const getArticlesByCategory = (keywords: string[], count: number) => {
    const matched = displayArticles.filter(a => {
      if (usedIds.has(a.id)) return false;
      const allCategories = [
        a.category,
        ...(a.categories || [])
      ].join(' ').toLowerCase();
      
      return keywords.some(k => allCategories.includes(k.toLowerCase()));
    }).slice(0, count);

    matched.forEach(a => usedIds.add(a.id));
    return matched;
  };

  const nationArticles = getArticlesByCategory(['nation', 'india', 'national', 'government', 'news'], 12);
  const politicsArticles = getArticlesByCategory(['politics'], 12);
  
  const jharkhandArticles = getArticlesByCategory(['jharkhand'], 8);
  const biharArticles = getArticlesByCategory(['bihar'], 8);
  const delhiArticles = getArticlesByCategory(['delhi'], 8);
  const maharashtraArticles = getArticlesByCategory(['maharashtra', 'mumbai'], 8);
  const stateArticles = getArticlesByCategory(['state', 'odisha', 'regional', 'local', 'up', 'uttar pradesh', 'rajsthan', 'west bengal', 'madhya pradesh', 'karnatka', 'manipur', 'telangana', 'haryana', 'tamil nadu'], 12);
  
  const worldArticles = getArticlesByCategory(['world', 'international', 'global', 'foreign', 'affairs'], 8);
  const crimeArticles = getArticlesByCategory(['crime', 'murder', 'police', 'law', 'justice'], 8);
  const businessArticles = getArticlesByCategory(['business', 'economy', 'finance', 'market', 'startup'], 8);
  const techArticles = getArticlesByCategory(['tech', 'technology', 'science'], 8);
  const sportsArticles = getArticlesByCategory(['sports', 'cricket', 'football', 'tennis', 'athletics'], 12);
  const entertainmentArticles = getArticlesByCategory(['entertainment', 'movies', 'culture', 'bollywood', 'hollywood', 'art'], 8);
  const lifestyleArticles = getArticlesByCategory(['lifestyle', 'travel', 'education', 'health'], 8);

  const availableTrending = displayArticles.filter(a => a.trending);
  const heroArticles = availableTrending.length > 0 ? availableTrending.slice(0, 5) : displayArticles.slice(0, 5);
  const safeHeroIndex = heroArticles.length > 0 ? (heroIndex % heroArticles.length) : 0;

  const savedArticlesList = allArticles.filter(a => savedArticleIds.includes(a.id));

  return (
    <div className="min-h-screen font-sans selection:bg-red-600/20 selection:text-black overflow-x-clip">
      <div className="relative z-100">
        <NotificationPrompt 
          visible={isNotificationVisible} 
          onClose={() => {
            setIsNotificationVisible(false);
            localStorage.setItem('je_notifs_dismissed', 'true');
          }} 
        />
        <Header 
          onCategoryClick={handleCategoryClick} 
          activeCategory={selectedCategory}
          onSubscribeClick={() => {
            sendGAEvent('event', 'subscribe_click', { source: 'header' });
            setIsSubscribeOpen(true);
          }}
          onSearchClick={() => {
            sendGAEvent('event', 'search_click', { source: 'header' });
            setIsSearchOpen(true);
          }}
          readingArticle={currentView === 'article' ? (readingArticle || selectedArticle) : null}
          onBack={handleBackToHome}
          simulatedDate={globalSettings?.has_explicit_time ? (globalSettings?.simulated_date || simulatedDate) : undefined}
          savedCount={savedArticleIds.length}
          onSavedClick={() => setCurrentView('saved')}
          whatsappUrl={globalSettings?.whatsapp_url}
        />
      </div>

      {currentView !== 'article' && (
        <TrendingBar
          selectedFilter={dateFilter}
          customDate={customArchiveDate}
          onFilterChange={handleDateFilterChange}
          onTopicClick={handleTopicClick}
          selectedTopic={selectedTopic}
          articles={allArticles}
        />
      )}
      
      <main className="relative bg-white text-black pb-20 lg:pb-0" role="main">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              
              <Ticker articles={allArticles.slice(0, 10)} onArticleClick={handleArticleClick} waybackBase={getCleanWaybackBase()} />

              <div className="max-w-[1600px] mx-auto px-4 sm:px-8 mt-6">
                <AdPlacement type="leaderboard" slotId="HP-LEAD-01" simulatedDate={simulatedDate} globalSettings={globalSettings} wrapperClassName="bg-slate-100/70 border border-slate-200/80 rounded-2xl py-3 px-4 flex justify-center mb-6 overflow-hidden" />
              </div>
              
              <div className="max-w-[1600px] mx-auto">
                {heroArticles.length > 0 ? (
                  <Hero 
                    article={heroArticles[safeHeroIndex]} 
                    secondaryArticles={heroArticles.slice(1, 4)}
                    onClick={handleArticleClick}
                    onPrev={(e) => {
                      e.stopPropagation();
                      setHeroIndex(prev => prev === 0 ? heroArticles.length - 1 : prev - 1);
                    }}
                    onNext={(e) => {
                      e.stopPropagation();
                      setHeroIndex(prev => prev + 1);
                    }}
                    currentIndex={safeHeroIndex}
                    totalArticles={heroArticles.length}
                  />
                ) : (
                  <div className="w-full h-64 flex flex-col items-center justify-center text-slate-500 font-sans text-sm border border-slate-200 rounded-2xl mx-4 my-8 p-6 text-center space-y-2">
                    <p className="font-semibold text-slate-700">
                      {cleanWaybackBase ? 'No archived articles found on or before this timestamp.' : 'No articles available right now.'}
                    </p>
                    {cleanWaybackBase && (
                      <p className="text-xs text-slate-400 max-w-md">
                        The earliest recorded article in the database was published in June 2026. Try selecting a date between June 2026 and today.
                      </p>
                    )}
                  </div>
                )}

                {/* Regional Focus: Heart of Jharkhand */}
                <div className="px-4 sm:px-8 pt-6">
                  <JharkhandRegionalRadar articles={allArticles} onArticleClick={handleArticleClick} />
                </div>
                
                <div className="px-4 sm:px-8 pt-4">
                  {/* Main Magazine Layout: Left Hard News & Features (8 cols), Right Sidebar (4 cols) */}
                  <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
                    
                    {/* Left Column: Hard News & Features */}
                    <div className="w-full lg:w-8/12 xl:w-3/4 flex flex-col">
                      
                      {selectedCategory && (
                        <div className="mb-8 p-5 rounded-2xl bg-slate-100/90 border border-slate-200/90 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-[#E63946] animate-pulse" />
                            <div>
                              <h2 className="text-xl font-serif font-bold text-slate-950">
                                Desk: {selectedCategory}
                              </h2>
                              <p className="text-xs font-mono text-slate-500 mt-0.5">
                                Showing {displayArticles.length} stories
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleCategoryClick(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-[#E63946] hover:bg-[#E63946]/10 transition-colors cursor-pointer"
                          >
                            Clear Filter ✕
                          </button>
                        </div>
                      )}

                      {selectedCategory && (
                        <CategorySection title={`${selectedCategory} Dispatches`} articles={displayArticles} onArticleClick={handleArticleClick} columns={4} badgeColor="#E63946" />
                      )}

                      <AdPlacement type="leaderboard" slotId="HP-LEAD-02" simulatedDate={simulatedDate} globalSettings={globalSettings} wrapperClassName="bg-slate-100/70 border border-slate-200/80 rounded-2xl py-3 px-4 flex justify-center mb-8 overflow-hidden" />

                      {!selectedCategory && (
                        <>
                          <CategorySection title="National Desk" articles={nationArticles} onArticleClick={handleArticleClick} columns={4} badgeColor="#1D4ED8" />
                          <CategorySection title="State Politics & Governance" articles={politicsArticles} onArticleClick={handleArticleClick} columns={4} badgeColor="#E63946" />
                          
                          <OpinionSection articles={displayArticles} onArticleClick={handleArticleClick} />

                          <AdPlacement type="leaderboard" slotId="HP-LEAD-03" simulatedDate={simulatedDate} globalSettings={globalSettings} wrapperClassName="bg-slate-100/70 border border-slate-200/80 rounded-2xl py-3 px-4 flex justify-center my-8 overflow-hidden" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <CategorySection title="Jharkhand Pulse" articles={jharkhandArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#0D5C46" />
                            <CategorySection title="Bihar & Eastern Corridors" articles={biharArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#028090" />
                          </div>

                          <AdPlacement type="leaderboard" slotId="HP-LEAD-04" simulatedDate={simulatedDate} globalSettings={globalSettings} wrapperClassName="bg-slate-100/70 border border-slate-200/80 rounded-2xl py-3 px-4 flex justify-center my-8 overflow-hidden" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <CategorySection title="Business & Markets" articles={businessArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#0D5C46" />
                            <CategorySection title="Crime, Law & Justice" articles={crimeArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#B91C1C" />
                          </div>

                          <AdPlacement type="leaderboard" slotId="HP-LEAD-05" simulatedDate={simulatedDate} globalSettings={globalSettings} wrapperClassName="bg-slate-100/70 border border-slate-200/80 rounded-2xl py-3 px-4 flex justify-center my-8 overflow-hidden" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <CategorySection title="Science & Future Tech" articles={techArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#028090" />
                            <CategorySection title="Delhi & Metros" articles={[...delhiArticles, ...maharashtraArticles].slice(0, 8)} onArticleClick={handleArticleClick} columns={2} badgeColor="#6366F1" />
                          </div>

                          <AdPlacement type="leaderboard" slotId="HP-LEAD-06" simulatedDate={simulatedDate} globalSettings={globalSettings} wrapperClassName="bg-slate-100/70 border border-slate-200/80 rounded-2xl py-3 px-4 flex justify-center my-8 overflow-hidden" />

                          <CategorySection title="World Affairs & Global Order" articles={worldArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#3B82F6" />
                            
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 mt-8">
                            <CategorySection title="Sports Arena" articles={sportsArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#EA580C" />
                            <CategorySection title="Culture & Cinema" articles={entertainmentArticles} onArticleClick={handleArticleClick} columns={2} badgeColor="#EC4899" />
                          </div>
                        </>
                      )}

                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="w-full lg:w-4/12 xl:w-1/4">
                      <div className="sticky top-28 space-y-8">
                        <Sidebar 
                          trending={heroArticles} 
                          live={displayArticles.slice(0, 6).map(a => ({
                            id: a.id,
                            timestamp: new Date(a.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            content: a.title,
                            isBreaking: a.category === 'Breaking News' || a.category === 'Breaking'
                          }))} 
                          onArticleClick={handleArticleClick}
                          simulatedDate={simulatedDate}
                          allArticles={displayArticles}
                          globalSettings={globalSettings}
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          ) : currentView === 'article' ? (
            <motion.div
              key="article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {readingArticle && (
                <ArticleView 
                  article={readingArticle} 
                  articles={allArticles}
                  onArticleClick={handleArticleClick}
                  onBack={handleBackToHome}
                  onArticleChange={setReadingArticle}
                  headerOffset={isNotificationVisible ? 85 : 46}
                  globalSettings={globalSettings}
                  onSearchClick={() => {
                    sendGAEvent('event', 'search_click', { source: 'article_header' });
                    setIsSearchOpen(true);
                  }}
                />
              )}
            </motion.div>
          ) : currentView === 'saved' ? (
            <motion.div
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-12 px-4 md:px-6 max-w-[1600px] mx-auto min-h-[60vh]"
            >
              <h2 className="text-3xl font-serif font-medium mb-8 pb-4 border-b border-zinc-200">Saved Articles</h2>
              {savedArticlesList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {savedArticlesList.map(article => (
                    <SavedArticleCard key={article.id} article={article} onClick={() => handleArticleClick(article)} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500 py-20">
                  <Bookmark className="w-12 h-12 mb-4 opacity-20" />
                  <p>You haven't saved any articles yet.</p>
                  <button onClick={handleBackToHome} className="mt-4 px-4 py-2 border border-zinc-300 rounded-full text-sm hover:bg-zinc-100 transition-colors">Return Home</button>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <MobileNav 
        currentView={currentView}
        onHomeClick={() => {
          handleCategoryClick(null);
          handleBackToHome();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSavedClick={() => {
          setCurrentView('saved');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onLiveClick={() => {
          if (currentView !== 'home') {
            setCurrentView('home');
            setTimeout(() => {
              document.getElementById('live-center')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            document.getElementById('live-center')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onSearchClick={() => setIsSearchOpen(true)}
        onMenuClick={() => setIsSubscribeOpen(true)}
        savedCount={savedArticleIds.length}
        activeCategory={selectedCategory}
        onCategorySelect={(cat) => {
          handleCategoryClick(cat);
          if (currentView !== 'home') {
            setCurrentView('home');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSubscribeClick={() => setIsSubscribeOpen(true)}
        whatsappUrl={globalSettings?.whatsapp_url}
      />
      
      {/* ── FOOTER: PREMIER MEDIA HOUSE ── */}
      <footer className="bg-[#0B132B] text-slate-300 border-t border-slate-800 py-16 md:py-20 mt-16">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            
            {/* Brand & Bureaus Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.webp" 
                  alt="Jharkhand Express News" 
                  className="h-12 w-auto object-contain brightness-110" 
                />
                <div>
                  <span className="font-serif font-black text-xl text-white tracking-tight block">
                    JHARKHAND EXPRESS
                  </span>
                  <span className="text-[10px] font-sans font-bold text-emerald-400 tracking-wider uppercase">
                    Independent Digital Media
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-sans">
                Dedicated to fearless journalism, deep investigative reporting, regional development, and people-first narratives across Jharkhand and Eastern India.
              </p>

              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <p><span className="font-bold text-slate-200">Head Bureau:</span> Main Road, Ranchi, Jharkhand</p>
                <p><span className="font-bold text-slate-200">National Bureau:</span> Press Enclave, New Delhi</p>
              </div>

              <div className="pt-2">
                <a 
                  href="https://hxrshrathore.vercel.app" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Engineered by Harsh Rathore
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Editorial Desks */}
            <div className="md:col-span-3 md:col-start-7 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4" /> Desks & Corridors
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-300 font-sans font-medium">
                {['Jharkhand', 'National', 'Politics', 'Business', 'Technology', 'Sports', 'Opinion'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => handleCategoryClick(item)}
                      className="hover:text-white hover:translate-x-1 transition-all cursor-pointer text-left block"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Governance & Ethics */}
            <div className="md:col-span-4 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Standards & Bureau
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-300 font-sans font-medium">
                {[
                  { label: 'About Jharkhand Express', icon: Globe2 },
                  { label: 'Editorial Policy & Fact-Checking', icon: Activity },
                  { label: 'Privacy Policy', icon: ShieldCheck, href: '/privacy' },
                  { label: 'Contact Bureau Desk', icon: Server, href: '/contact' }
                ].map((item, i) => (
                  <li key={i}>
                    {item.href ? (
                      <a href={item.href} className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5 text-slate-500" />
                        {item.label}
                      </a>
                    ) : (
                      <button className="hover:text-white hover:translate-x-1 transition-all text-left flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5 text-slate-500" />
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800/80 gap-4">
            <p className="text-xs text-slate-500 font-sans">
              © {new Date().getFullYear()} Jharkhand Express Media Group. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://whatsapp.com/channel/YOUR_CHANNEL_ID"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] text-xs font-bold hover:bg-[#25D366] hover:text-white transition-all"
              >
                WhatsApp Channel
              </a>
              <a
                href="https://twitter.com/jharkhandexpress"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              </a>
              <a
                href="https://www.youtube.com/@JharkhandExpress"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Camera className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-black/40 backdrop-blur-sm z-200 flex items-start justify-center pt-[10vh] p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.98, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-zinc-200/50 relative"
            >
              <div className="relative flex items-center px-6 py-4 border-b border-zinc-100">
                <Search className="w-6 h-6 text-zinc-400 absolute left-6" />
                <input 
                  type="text"
                  autoFocus
                  placeholder="Search articles, topics, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-12 py-3 text-lg font-helvetica font-medium text-brand-black focus:outline-none placeholder:text-zinc-400"
                />
                <button 
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="absolute right-6 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-4 bg-zinc-50/50">
                {searchQuery ? (
                  <div className="space-y-2">
                    {allArticles
                        .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((a, i) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            key={a.id} 
                            onClick={() => {
                              sendGAEvent('event', 'search_result_click', {
                                search_query: searchQuery,
                                article_slug: a.slug || a.id
                              });
                              handleArticleClick(a);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="group p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-zinc-200/60 cursor-pointer transition-all flex gap-4 items-center"
                          >
                            <div className="w-20 h-20 shrink-0 overflow-hidden rounded-lg bg-zinc-200 relative">
                              <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              {a.featuredVideo && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-brand-red ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">{a.category}</span>
                                <span className="text-[10px] text-zinc-400">•</span>
                                <time className="text-[10px] text-zinc-400 font-medium">
                                  {new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </time>
                              </div>
                              <h4 className="font-helvetica text-base font-semibold leading-snug group-hover:text-brand-tech transition-colors line-clamp-2">{a.title}</h4>
                            </div>
                            <div className="pr-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:block">
                              <ArrowRight className="w-5 h-5 text-brand-tech" />
                            </div>
                          </motion.div>
                        ))}
                    </div>
                ) : (
                  <div className="py-16 flex flex-col items-center justify-center text-center opacity-60">
                    <Search className="w-12 h-12 text-zinc-300 mb-4" />
                    <p className="text-sm font-helvetica text-zinc-500 font-medium">Discover breaking news, deep dives, and expert opinions.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscribe Modal */}
      <AnimatePresence>
        {isSubscribeOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-200 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-black text-white border border-white/20 w-full max-w-md p-8 shadow-2xl relative text-center"
            >
              <button 
                onClick={() => setIsSubscribeOpen(false)}
                className="absolute top-6 right-6 text-xs font-mono opacity-50 hover:opacity-100 uppercase text-white cursor-pointer"
              >
                [ Close ]
              </button>
              
              <img 
                src="/logo.webp" 
                alt="Jharkhand Express News Logo" 
                className="w-16 h-16 object-contain mx-auto mb-6 drop-shadow-md filter brightness-0 invert" 
              />
              
              <h3 className="text-3xl font-helvetica mb-4 italic">Live Updates</h3>
              <p className="text-xs font-mono opacity-60 mb-6 uppercase tracking-wider">
                Join our WhatsApp channel for breaking news alerts.
              </p>
              
              <div className="space-y-4">
                <a 
                  href={globalSettings?.whatsapp_url || process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || "https://whatsapp.com/channel/YOUR_CHANNEL_ID"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    sendGAEvent('event', 'whatsapp_join_click', { method: 'button_click' });
                    setIsSubscribeOpen(false);
                  }}
                  className="w-full bg-[#25D366] text-white p-4 text-[10px] tracking-widest uppercase hover:bg-[#128C7E] transition-all cursor-pointer font-bold block"
                >
                  Join WhatsApp Channel
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
