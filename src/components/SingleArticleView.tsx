import { useState, useRef, useEffect } from 'react';
import { Article } from '../types';
import { Clock, Share2, Bookmark, CheckCircle2, Bot, MessageSquare, ArrowLeft, Home, Link2, MessageCircle } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CustomVideoPlayer from './CustomVideoPlayer';
import AdPlacement from './AdPlacement';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

interface SingleArticleViewProps {
  article: Article;
  articles: Article[];
  onArticleClick: (article: Article) => void;
  onInView: (article: Article) => void;
  onBack?: () => void;
  globalSettings?: any;
}

// Bento grid layout for multiple images/videos
function BentoMediaCollage({ items }: { items: Array<{ type: 'image' | 'video', url: string }> }) {
  if (items.length === 0) return null;
  if (items.length === 1) {
    const item = items[0];
    return (
      <div className="my-8 overflow-hidden border border-brand-black/10 dark:border-white/10 bg-brand-black/5 dark:bg-white/5 rounded-xl">
        {item.type === 'image' ? (
          <img src={item.url} alt="Article media" className="w-full h-auto object-cover max-h-125" />
        ) : (
          <div className="aspect-video w-full">
            <CustomVideoPlayer src={item.url} />
          </div>
        )}
      </div>
    );
  }

  let gridClass = "grid gap-3 my-8";
  if (items.length === 2) {
    gridClass += " grid-cols-1 md:grid-cols-2";
  } else if (items.length === 3) {
    gridClass += " grid-cols-1 md:grid-cols-3 md:grid-rows-2 h-[450px]";
  } else {
    gridClass += " grid-cols-1 md:grid-cols-4 md:grid-rows-2 h-[550px]";
  }

  return (
    <div className={gridClass}>
      {items.map((item, idx) => {
        let itemClass = "relative overflow-hidden bg-brand-black/5 dark:bg-white/5 border border-brand-black/10 dark:border-white/10 group rounded-xl";
        
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
                alt={`Collage media ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <CustomVideoPlayer src={item.url} />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
}

export default function SingleArticleView({ article, articles, onArticleClick, onInView, onBack, globalSettings }: SingleArticleViewProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if article is bookmarked
    const saved = localStorage.getItem('je_saved_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.includes(article.id)) {
          setIsBookmarked(true);
        }
      } catch (e) {}
    }

    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mediaQuery.matches);

    const handleMQChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    mediaQuery.addEventListener('change', handleMQChange);
    return () => mediaQuery.removeEventListener('change', handleMQChange);
  }, [article.id]);

  const toggleBookmark = () => {
    const saved = localStorage.getItem('je_saved_articles');
    let parsed: string[] = [];
    if (saved) {
      try { parsed = JSON.parse(saved); } catch (e) {}
    }
    
    if (isBookmarked) {
      parsed = parsed.filter(id => id !== article.id);
      setIsBookmarked(false);
      toast('Article removed from saved.');
    } else {
      if (!parsed.includes(article.id)) parsed.push(article.id);
      setIsBookmarked(true);
      toast.success('Article saved!');
    }
    localStorage.setItem('je_saved_articles', JSON.stringify(parsed));
  };

  const heroVideoSrc = article.featuredVideo || (article.videoGallery && article.videoGallery.length > 0 ? article.videoGallery[0] : undefined);
  
  const mediaItems = [
    ...(article.gallery || []).map(url => ({ type: 'image' as const, url })),
    ...(article.videoGallery || []).map(url => ({ type: 'video' as const, url }))
  ];

  const renderContentWithMedia = () => {
    // Check if the article was built using the new Intelligent Layout Engine
    const hasExplicitAds = article.content.includes('<!-- wp:truth/ad-slot');
    
    if (hasExplicitAds) {
      // NEW ARTICLE LOGIC: Respect explicit layout
      const parts = article.content.split(/(<!-- wp:truth\/ad-slot type=".*?" \/-->)/g);
      return (
        <>
          {parts.map((part, index) => {
            const adMatch = part.match(/<!-- wp:truth\/ad-slot type="(.*?)" \/-->/);
            if (adMatch) {
               const type = adMatch[1] as 'leaderboard' | 'rectangle';
               return (
                 <AdPlacement key={index} type={type} slotId={`ARTICLE-${article.id}-${type}-${index}`} wrapperClassName="my-12 flex justify-center w-full" globalSettings={globalSettings} placementContext="article" />
               );
            }
            if (part.trim() === '') return null;
            return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
          })}
        </>
      );
    }

    // OLD ARTICLE LOGIC: Intelligent Auto-Placer Fallback
    // 1. Strip out old auto-appended wp:gallery/video blocks so they don't double-render
    let cleanContent = article.content.replace(/<!-- wp:gallery[\s\S]*?<!-- \/wp:gallery -->/g, '');
    cleanContent = cleanContent.replace(/<!-- wp:video[\s\S]*?<!-- \/wp:video -->/g, '');
    
    // 2. Parse into clean paragraphs
    const paragraphs = cleanContent.split('</p>').filter(p => p.trim() !== '');
    const formattedParagraphs = paragraphs.map(p => p.endsWith('</p>') ? p : p + '</p>');
    
    // Pre-calculate Dynamic Ad Distribution
    const allAds = globalSettings?.site_ads || [];
    const currentDateObj = globalSettings?.simulated_date ? new Date(globalSettings.simulated_date) : new Date();
    
    // Filter active article rectangle ads
    const activeRectangleAds = allAds.filter((ad: any) => {
      if (!ad.active) return false;
      if (ad.type !== 'rectangle') return false;
      if (!ad.show_in_articles) return false;
      const validFrom = new Date(ad.valid_from);
      const validTo = new Date(ad.valid_to);
      return currentDateObj >= validFrom && currentDateObj <= validTo;
    }).map((ad: any) => ({
      id: `dynamic-ad-${ad.id}`,
      imageUrl: ad.image_url,
      title: 'Sponsored Placement',
    }));

    // Prevent video carousels - if there's a video, only show the first video. Otherwise, show all as carousel.
    let rectangleAdItems: any[] = [];
    const videoRectangleAd = activeRectangleAds.find((ad: any) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(ad.imageUrl));
    if (videoRectangleAd) {
      rectangleAdItems = [videoRectangleAd];
    } else {
      rectangleAdItems = activeRectangleAds;
    }

    // Filter active article leaderboard ads
    const activeArticleAds = allAds.filter((ad: any) => {
      if (!ad.active) return false;
      if (ad.type !== 'leaderboard') return false;
      if (!ad.show_in_articles) return false;
      const validFrom = new Date(ad.valid_from);
      const validTo = new Date(ad.valid_to);
      return currentDateObj >= validFrom && currentDateObj <= validTo;
    }).map((ad: any) => ({
      id: `dynamic-ad-${ad.id}`,
      imageUrl: ad.image_url,
      title: 'Sponsored Placement',
    }));

    // Calculate maximum available ad containers (slots)
    // Guarantee a paragraph above and below: maxContainers = paragraphs.length - 1
    // If only 1 paragraph exists, we allow 1 slot at the bottom.
    const maxContainers = Math.max(1, formattedParagraphs.length - 1); 
    
    // Divide active ads into chunks based on available containers
    const chunkArray = (arr: any[], numChunks: number) => {
      const chunks: any[][] = Array.from({ length: numChunks }, () => []);
      arr.forEach((item, index) => {
        chunks[index % numChunks].push(item);
      });
      // Filter out empty chunks if we had more slots than ads
      return chunks.filter(c => c.length > 0);
    };
    
    const adChunks = chunkArray(activeArticleAds, maxContainers);
    
    // 3. Weave Ads and Media intelligently
    const elements: React.ReactNode[] = [];
    
    if (formattedParagraphs.length === 0) {
      if (mediaItems.length > 0) elements.push(<BentoMediaCollage key="media-only" items={mediaItems} />);
      elements.push(<div key="content" dangerouslySetInnerHTML={{ __html: cleanContent }} />);
      return <>{elements}</>;
    }

    formattedParagraphs.forEach((para, idx) => {
       elements.push(<div key={`p-${idx}`} dangerouslySetInnerHTML={{ __html: para }} />);
       
       // Inject Dynamic Ad Block for this slot if a chunk exists
       if (idx < adChunks.length) {
          elements.push(
             <AdPlacement 
               key={`dynamic-ad-slot-${idx}`} 
               type="leaderboard" 
               slotId={`AUTO-DYN-${article.id}-${idx}`} 
               wrapperClassName="my-12 flex justify-center w-full" 
               items={adChunks[idx]}
             />
          );
       }
       
       // After Paragraph 2: Inject Media Collage
       if (idx === 1 && mediaItems.length > 0) {
          elements.push(<BentoMediaCollage key={`media-${idx}`} items={mediaItems} />);
       }
       // Inject Rectangle Ad block at a single optimal position
       // Ideal position: after paragraph 4 (idx === 3). If article is shorter, we'll catch it at the bottom.
       if (idx === 3 && rectangleAdItems.length > 0) {
          elements.push(
             <AdPlacement 
               key={`dynamic-rect-slot-${idx}`} 
               type="rectangle" 
               slotId={`AUTO-DYN-REC-${article.id}`} 
               wrapperClassName="my-12 flex justify-center w-full" 
               items={rectangleAdItems}
             />
          );
       }
    });
    
    // Catch-all if article was too short to trigger the media or rectangle injection
    if (formattedParagraphs.length <= 1 && mediaItems.length > 0) {
       elements.push(<BentoMediaCollage key="media-fallback" items={mediaItems} />);
    }
    if (formattedParagraphs.length <= 3 && rectangleAdItems.length > 0) {
       elements.push(
          <AdPlacement 
            key="dynamic-rect-slot-fallback" 
            type="rectangle" 
            slotId={`AUTO-DYN-REC-${article.id}-fallback`} 
            wrapperClassName="my-12 flex justify-center w-full" 
            items={rectangleAdItems}
          />
       );
    }
    
    return <>{elements}</>;
  };


  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Parallax hero image and hero video
    gsap.to(`.hero-image-${article.id}, .hero-video-${article.id}`, {
      y: '20%',
      ease: 'none',
      scrollTrigger: {
        trigger: `.hero-container-${article.id}`,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });

    // Content reveals
    gsap.utils.toArray(`.reveal-text-${article.id}`).forEach((el: any) => {
      gsap.from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        }
      });
    });

    // Detect when article is main focus for SEO/URL updates
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => onInView(article),
      onEnterBack: () => onInView(article),
    });

  }, { scope: containerRef, dependencies: [article.id] });

  return (
    <article ref={containerRef} id={`article-container-${article.id}`} className="w-full max-w-[1600px] mx-auto border-b-4 border-brand-black/20 lg:border-none pb-20 lg:pb-32 mb-20 lg:mb-32 relative overflow-hidden">
      
      {/* Ambient Desktop Glows */}
      <div className="hidden lg:block fixed top-0 left-1/4 w-150 h-100 bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="hidden lg:block fixed bottom-0 right-1/4 w-125 h-75 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Desktop Fixed Left Toolbar — pinned to viewport, not in grid */}
      <div className="hidden lg:flex fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-40">
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-col items-center gap-4">
            {/* Back to Home Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 bg-card/80 backdrop-blur-xl border border-border shadow-lg rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all px-3 py-3 group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden 2xl:block">Home</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Back to Home</p></TooltipContent>
            </Tooltip>

            {/* Tools Pill */}
            <div className="flex flex-col items-center gap-5 bg-card/80 backdrop-blur-xl border border-border shadow-lg rounded-full py-6 px-3">


              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      const summaryWidget = document.getElementById(`summary-${article.id}`);
                      if (summaryWidget) {
                        summaryWidget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        summaryWidget.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
                        setTimeout(() => summaryWidget.classList.remove('ring-2', 'ring-primary', 'ring-offset-2'), 2000);
                      }
                    }}
                    className="text-muted-foreground hover:text-primary transition-all hover:scale-110"
                  >
                    <Bot className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>AI Summary</p></TooltipContent>
              </Tooltip>

              <div className="w-5 h-px bg-border" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${article.title} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#25D366] transition-all hover:scale-110"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Share on WhatsApp</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1DA1F2] transition-all hover:scale-110"
                  >
                    <TwitterIcon className="w-5 h-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Share on Twitter</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1877F2] transition-all hover:scale-110"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Share on Facebook</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      const textToCopy = window.location.href;
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(textToCopy).catch(() => {});
                      } else {
                        const textArea = document.createElement("textarea");
                        textArea.value = textToCopy;
                        document.body.appendChild(textArea);
                        textArea.select();
                        try { document.execCommand('copy'); } catch (err) {}
                        document.body.removeChild(textArea);
                      }
                      toast("Link copied to clipboard!");
                    }}
                    className="text-muted-foreground hover:text-foreground transition-all hover:scale-110"
                  >
                    <Link2 className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Copy Link</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleBookmark}
                    className={`transition-all hover:scale-110 ${isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>{isBookmarked ? "Bookmarked" : "Bookmark"}</p></TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Main grid — no longer includes the left toolbar col */}
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12 lg:px-16 xl:px-20 pt-0 lg:pt-16">
        <div className="hidden lg:block lg:col-span-1" /> {/* Spacer for fixed sidebar */}

        {/* MAIN COLUMN */}
        <div className="lg:col-span-8">
           <div className="flex flex-col lg:bg-card/90 lg:backdrop-blur-xl lg:border lg:border-border lg:shadow-2xl lg:rounded-2xl lg:overflow-hidden lg:pb-24 relative transition-colors duration-500">
              
              {/* Header (Order 1 on mobile, Order 2 on desktop) */}
              <header className="order-1 lg:order-2 px-4 sm:px-6 lg:px-20 pt-8 lg:pt-16 pb-8 lg:pb-12 text-center max-w-5xl mx-auto w-full">
                <div className={`reveal-text-${article.id}`}>
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <span className={`px-3 py-1 text-white text-[10px] font-extrabold tracking-[0.2em] uppercase rounded-full shadow-xs ${
                      (article.category === 'Breaking' || article.category === 'Breaking News') ? 'bg-[#E63946]' : 'bg-[#0D5C46]'
                    }`}>
                      {article.category}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-50 text-foreground">
                      <Clock className="w-3 h-3" />
                      {article.readingTime} read
                    </div>
                  </div>

                  <h1 className="article-headline text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-5 lg:mb-8 leading-[1.2] text-slate-900 text-center lg:text-left">
                    {article.title}
                  </h1>

                  <div className="text-center lg:text-left">
                    <span className="block text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                      Published on {new Date(article.publishedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })} • Ranchi Bureau
                    </span>
                  </div>

                  {/* Generative Engine Optimization (GEO) / Key Takeaways Box */}
                  {article.excerpt && (
                    <div className="key-takeaways mt-6 text-left p-5 sm:p-6 bg-emerald-50/50 border border-emerald-900/10 rounded-xl shadow-xs">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-2 h-2 rounded-full bg-[#0D5C46] animate-pulse" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-[#0D5C46]">
                          Core Developments • Verified Dateline
                        </span>
                        <span className="ml-auto text-[10px] font-mono text-slate-400 uppercase">Ranchi, JH</span>
                      </div>
                      <p className="article-excerpt text-sm sm:text-[15px] text-slate-800 leading-relaxed font-sans font-medium">
                        {article.excerpt}
                      </p>
                    </div>
                  )}
                </div>
              </header>

              {/* Featured Image (Order 2 on mobile, Order 1 on desktop) */}
              <div className="order-2 lg:order-1 mb-16 lg:mb-0">
                <div className={`hero-container-${article.id} px-6 lg:px-0 relative`}>
                   {/* Premium Ambient Blur Container for Mixed Aspect Ratios */}
                   <div className="w-full relative lg:rounded-none rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 flex justify-center items-center min-h-50 sm:min-h-65 max-h-[50vh] lg:max-h-[70vh]">
                    
                    {/* Ambient Background Blur */}
                    {!article.youtubeVideoId && (!isDesktop || !heroVideoSrc) && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 dark:opacity-20 scale-110"
                        style={{ backgroundImage: `url(${article.imageUrl})` }}
                      />
                    )}

                    {article.youtubeVideoId ? (
                      <div className="aspect-21/9 w-full relative z-10">
                        <iframe
                          src={`https://www.youtube.com/embed/${article.youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${article.youtubeVideoId}&controls=1`}
                          className={`w-full h-full hero-video-${article.id} border-0`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : isDesktop && heroVideoSrc ? (
                      <div className="w-full h-full relative z-10 max-h-[70vh] flex justify-center items-center">
                        <CustomVideoPlayer
                          src={heroVideoSrc}
                          autoplayHero={true}
                          videoClassName={`hero-video-${article.id} object-contain max-h-[70vh] w-auto`}
                        />
                      </div>
                    ) : (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className={`hero-image-${article.id} w-auto h-auto max-w-full max-h-[50vh] lg:max-h-[70vh] object-contain relative z-10 drop-shadow-2xl`}
                      />
                    )}
                   </div>
                </div>
                {article.imageCaption && (
                  <div className="max-w-4xl mx-auto mt-4 text-center hidden lg:block">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      — {article.imageCaption}
                    </p>
                  </div>
                )}
              </div>

              {/* Content (Order 3 on both) */}
              <main className="order-3 px-4 sm:px-6 lg:px-20 pt-6 lg:pt-0 prose prose-base lg:prose-xl dark:prose-invert prose-brand-black dark:prose-p:text-zinc-300 dark:prose-headings:text-zinc-100 max-w-none overflow-hidden">
                
                {/* AI Summary Widget */}
                {article.aiSummary && (
                  <div id={`summary-${article.id}`} className={`mt-6 bg-primary/5 border border-primary/20 rounded-xl p-8 mb-16 relative group transition-all duration-300 reveal-text-${article.id}`}>
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 shadow-md">
                      <Bot className="w-3 h-3" /> AI Insight
                    </div>
                    <p className="text-primary text-lg lg:text-xl font-medium leading-relaxed italic m-0">
                      "{article.aiSummary}"
                    </p>
                  </div>
                )}

                <div className={`leading-[1.7] font-medium space-y-8 reveal-text-${article.id}`}>
                  {renderContentWithMedia()}
                </div>


                {/* Similar Articles / More Articles */}
                <section className="mt-16 lg:mt-24 border-t border-border pt-10 lg:pt-16 not-prose">
                  <div className="flex items-center gap-3 mb-8 text-foreground">
                    <h3 className="text-2xl font-serif italic m-0">Similar Articles</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {articles
                      .filter((a) => a.category === article.category && a.id !== article.id)
                      .slice(0, 6)
                      .map((related) => (
                        <div 
                          key={related.id} 
                          className="group cursor-pointer space-y-4"
                          onClick={() => onArticleClick(related)}
                        >
                          <div className="aspect-video overflow-hidden bg-muted rounded-xl relative shadow-md">
                            <img 
                              src={related.imageUrl} 
                              alt={related.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-primary tracking-widest uppercase block mb-2">
                              {related.category}
                            </span>
                            <h5 className="text-sm md:text-base font-serif font-medium leading-snug group-hover:text-primary transition-colors text-foreground">
                              {related.title}
                            </h5>
                          </div>
                        </div>
                      ))}
                    {articles.filter((a) => a.category === article.category && a.id !== article.id).length === 0 && (
                      <p className="text-xs text-muted-foreground font-mono">No similar articles found.</p>
                    )}
                  </div>
                </section>
              </main>
           </div>
        </div>
        
        {/* RIGHT SIDEBAR — desktop only */}
        <aside className="hidden lg:block lg:col-span-3 space-y-12 px-4 mt-0 sticky top-24 self-start">
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-6 lg:p-8 shadow-xl">
            <h4 className="text-[10px] tracking-widest uppercase text-muted-foreground mb-8 flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Related Coverage
            </h4>
            <div className="space-y-8">
              {articles
                .filter((a) => a.category === article.category && a.id !== article.id)
                .slice(0, 3)
                .map((related) => (
                  <div 
                    key={related.id} 
                    className="group cursor-pointer space-y-4"
                    onClick={() => onArticleClick(related)}
                  >
                    <div className="aspect-video overflow-hidden bg-muted rounded-xl relative shadow-md">
                      <img 
                        src={related.imageUrl} 
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-primary tracking-widest uppercase block mb-2">
                        {related.category}
                      </span>
                      <h5 className="text-sm md:text-base font-serif font-medium leading-snug group-hover:text-primary transition-colors text-foreground">
                        {related.title}
                      </h5>
                    </div>
                  </div>
                ))}
              {articles.filter((a) => a.category === article.category && a.id !== article.id).length === 0 && (
                <p className="text-xs text-muted-foreground font-mono">No related coverage found.</p>
              )}
            </div>
          </div>
        </aside>

      </div>

      {/* Mobile Bottom Action Bar — native app feel */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-pb">
        <div className="flex items-center justify-around px-4 py-3">
          <button onClick={onBack || (() => window.location.href = '/')} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
          </button>

          <button
            onClick={() => {
              const shareData = {
                title: 'Jharkhand Express',
                text: `Read this article on Jharkhand Express: ${article.title}`,
                url: window.location.href,
              };
              
              const fallbackCopy = () => {
                const textToCopy = `${shareData.text}\n${shareData.url}`;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(textToCopy).catch(() => {});
                } else {
                  const textArea = document.createElement("textarea");
                  textArea.value = textToCopy;
                  document.body.appendChild(textArea);
                  textArea.select();
                  try { document.execCommand('copy'); } catch (err) {}
                  document.body.removeChild(textArea);
                }
                toast('Link copied to clipboard');
              };

              if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                navigator.share(shareData).catch((err) => {
                  if (err.name !== 'AbortError') fallbackCopy();
                });
              } else if (navigator.share) {
                navigator.share(shareData).catch((err) => {
                  if (err.name !== 'AbortError') fallbackCopy();
                });
              } else {
                fallbackCopy();
              }
            }}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Share</span>
          </button>
          <button
            onClick={toggleBookmark}
            className={`flex flex-col items-center gap-1 transition-colors ${isBookmarked ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-wider">Save</span>
          </button>
        </div>
      </div>
    </article>
  );
}
