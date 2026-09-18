/**
 * TrendingBar — Real-time Trending Topics & Hashtags
 */

"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Flame, X } from 'lucide-react';

export type DateFilter = 'today' | 'yesterday' | 'custom' | 'older';

interface TrendingBarProps {
  selectedFilter: DateFilter;
  customDate: string;
  onFilterChange: (filter: DateFilter, date?: string) => void;
  selectedTopic?: string | null;
  onTopicClick?: (topic: string | null) => void;
  articles?: any[];
}

const DEFAULT_POPULAR_TOPICS = [
  'Jharkhand Budget', 'Hemant Soren', 'Ranchi Express', 'JSSC CGL', 'Mining Policy',
  'IPL 2026', 'East India Corridors', 'Tribal Rights', 'Dhanbad Coal', 'Jamshedpur Industry',
  'Bokaro Steel', 'State Cabinet', 'Crime Watch', 'Deoghar Airport', 'Jharkhand Tourism',
  'Ranchi Smart City', 'Education Updates', 'Digital Jharkhand', 'Health Mission', 'Youth Rojgar',
  'Assembly Session', 'Weather Alert', 'Monsoon Watch', 'Forest Conservation', 'Road Infrastructure'
];

export default function TrendingBar({
  selectedTopic,
  onTopicClick,
  articles
}: TrendingBarProps) {
  const [trendingTopics, setTrendingTopics] = useState<{ label: string; slug: string; hot?: boolean }[]>([]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      const tagCounts: Record<string, number> = {};
      
      articles.forEach(a => {
        // Collect from tags
        if (a.tags && Array.isArray(a.tags)) {
          a.tags.forEach((t: string) => {
            const cleanTag = t.trim().replace(/^#/, '');
            if (cleanTag && cleanTag.length > 1) {
              tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
            }
          });
        }
        // Also capture category
        if (a.category && typeof a.category === 'string') {
          tagCounts[a.category] = (tagCounts[a.category] || 0) + 1;
        }
      });

      const extractedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([label]) => label);

      // Merge extracted tags with popular defaults to ensure the bar is full
      const combined = Array.from(new Set([...extractedTags, ...DEFAULT_POPULAR_TOPICS])).slice(0, 30);

      const dynamicTopics = combined.map((label, idx) => ({
        label,
        slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        hot: idx < 3
      }));

      setTrendingTopics(dynamicTopics);
    } else {
      const fallbackTopics = DEFAULT_POPULAR_TOPICS.map((label, idx) => ({
        label,
        slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        hot: idx < 3
      }));
      setTrendingTopics(fallbackTopics);
    }
  }, [articles]);

  return (
    <div className="bg-white border-b border-slate-200/90 py-1.5 shadow-2xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center gap-3">
        
        {/* Left: Fixed Trending Badge */}
        <div className="flex items-center gap-2 text-slate-900 shrink-0 pr-3 border-r border-slate-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E63946]"></span>
          </span>
          <TrendingUp className="w-3.5 h-3.5 text-[#E63946]" />
          <span className="font-sans font-black text-[11px] tracking-wider uppercase text-slate-800 hidden sm:inline">
            TRENDING
          </span>
        </div>

        {/* Center & Right: High-Density Trending Topics Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0 scroll-smooth">
          {trendingTopics.map((topic) => {
            const isSelected = selectedTopic === topic.slug;
            return (
              <button
                key={topic.slug}
                onClick={() => onTopicClick?.(isSelected ? null : topic.slug)}
                className={`px-3 py-1 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E63946] text-white font-bold shadow-xs'
                    : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200/70 hover:border-slate-300'
                }`}
              >
                {topic.hot && !isSelected && (
                  <span className="text-[11px] text-amber-500 font-bold">🔥</span>
                )}
                <span>#{topic.label}</span>
                {isSelected && (
                  <X className="w-3 h-3 ml-0.5 opacity-80 hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>

        {/* Clear Filter Pill (visible when a topic is selected) */}
        {selectedTopic && (
          <button
            onClick={() => onTopicClick?.(null)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#E63946] bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1 active:scale-95"
          >
            <span>Reset</span>
            <X className="w-3 h-3" />
          </button>
        )}

      </div>
    </div>
  );
}
