import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react';

// CRT TV-style mute icon — chunky 80s television silhouette with scan lines and muted speaker
function CrtMuteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* TV body */}
      <rect x="2" y="6" width="36" height="24" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2"/>
      {/* Screen bezel */}
      <rect x="6" y="9" width="24" height="16" rx="1" fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="1.5"/>
      {/* Scan lines on screen */}
      <line x1="6" y1="12" x2="30" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="6" y1="15" x2="30" y2="15" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="6" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="6" y1="21" x2="30" y2="21" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      {/* TV legs / stand */}
      <rect x="13" y="30" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.7"/>
      <rect x="23" y="30" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.7"/>
      <line x1="11" y1="34" x2="29" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
      {/* Control knobs */}
      <circle cx="34" cy="13" r="1.5" fill="currentColor" opacity="0.8"/>
      <circle cx="34" cy="19" r="1.5" fill="currentColor" opacity="0.8"/>
      {/* Mute slash — diagonal across screen */}
      <line x1="8" y1="11" x2="28" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      <line x1="8" y1="23" x2="28" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
    </svg>
  );
}

interface CustomVideoPlayerProps {
  src: string;
  autoplayHero?: boolean;
  videoClassName?: string;
}

export default function CustomVideoPlayer({ src, autoplayHero = false, videoClassName = '' }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(autoplayHero);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto-play for hero mode and intersection observer to pause when scrolled out of view
  useEffect(() => {
    if (!videoRef.current || !autoplayHero) return;
    
    videoRef.current.muted = true;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (videoRef.current?.paused) {
            videoRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(err => console.log('Autoplay blocked:', err));
          }
        } else {
          if (!videoRef.current?.paused) {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(videoRef.current);
    
    return () => observer.disconnect();
  }, [autoplayHero]);

  // Controls auto-hide trigger
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Format time (e.g. 01:23)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Play blocked:', err));
    }
  };

  const handleMuteToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    videoRef.current.currentTime = newTime;
    setProgress((newTime / duration) * 100);
    setCurrentTime(newTime);
  };

  const handleFullscreenToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.log('Fullscreen failed:', err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !duration) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    setProgress((current / duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full group overflow-hidden bg-black flex items-center justify-center cursor-pointer select-none"
      onClick={() => handlePlayPause()}
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        className={`w-full object-cover ${videoClassName ? `h-[120%] mt-[-10%] ${videoClassName}` : 'h-full'}`}
        loop={autoplayHero}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm pointer-events-none">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        </div>
      )}

      {/* Hero Unmute Overlay (Muted State in Autoplay Hero Mode) */}
      {autoplayHero && isMuted && (
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMuteToggle(e);
              if (videoRef.current && videoRef.current.paused) {
                videoRef.current.play().then(() => setIsPlaying(true));
              }
            }}
            className="group relative flex items-center justify-center w-11 h-11 bg-black/70 backdrop-blur-sm text-white border border-white/20 hover:bg-red-600 hover:border-red-600 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer rounded-sm shadow-[2px_2px_0px_rgba(255,255,255,0.15)]"
            aria-label="Unmute Video"
            title="Unmute"
            style={{ imageRendering: 'pixelated' }}
          >
            <CrtMuteIcon className="w-7 h-7 animate-pulse" />
            {/* Scanline texture overlay on the button itself */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)',
                borderRadius: 'inherit'
              }}
            />
          </button>
        </div>
      )}

      {/* Normal Central Play Overlay (Non-Hero or Unmuted State) */}
      {(!autoplayHero || !isMuted) && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border border-white/20 transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Controls Overlay bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 via-black/50 to-transparent flex flex-col gap-3 transition-opacity duration-300 z-10 ${
          showControls && (!autoplayHero || !isMuted) ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Timeline Slider */}
        <div 
          className="relative h-1.5 w-full bg-white/20 cursor-pointer rounded-full group/timeline"
          onClick={handleSeek}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-red-600 rounded-full flex items-center justify-end"
            style={{ width: `${progress}%` }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white border border-red-600 opacity-0 group-hover/timeline:opacity-100 transition-opacity absolute right-0 translate-x-1/2 scale-0 group-hover/timeline:scale-100" />
          </div>
        </div>

        {/* Buttons Controls */}
        <div className="flex items-center justify-between font-mono text-white text-[10px] tracking-wider">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button 
              onClick={(e) => handlePlayPause(e)}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current animate-pulse" />}
            </button>

            {/* Mute/Volume */}
            <button 
              onClick={(e) => handleMuteToggle(e)}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Time display */}
            <span className="opacity-75">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Fullscreen */}
            <button 
              onClick={(e) => handleFullscreenToggle(e)}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
