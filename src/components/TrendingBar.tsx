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
      const tagStats: Record<string, { count: number; score: number; isTrending: boolean }> = {};
      const now = Date.now();

      articles.forEach(a => {
        const publishedTime = a.publishedAt ? new Date(a.publishedAt).getTime() : now;
        const hoursAgo = Math.max(0, (now - publishedTime) / (1000 * 60 * 60));
        
        // Recency factor: stories from last 12h get 4x, 24h get 3x, 48h get 2x, older get 1x
        const recencyWeight = hoursAgo <= 12 ? 4 : hoursAgo <= 24 ? 3 : hoursAgo <= 48 ? 2 : 1;
        const isStoryTrending = Boolean(a.trending || a.categories?.includes('Breaking News') || a.category === 'Breaking News');
        const trendingBonus = isStoryTrending ? 6 : 0;

        const allStoryTags = new Set<string>();
        if (a.tags && Array.isArray(a.tags)) {
          a.tags.forEach((t: string) => {
            const cleanTag = t.trim().replace(/^#/, '');
            if (cleanTag && cleanTag.length > 1) allStoryTags.add(cleanTag);
          });
        }
        if (a.category && typeof a.category === 'string') {
          const cleanCat = a.category.trim();
          if (cleanCat && cleanCat !== 'News' && cleanCat.length > 2) allStoryTags.add(cleanCat);
        }

        allStoryTags.forEach(tag => {
          if (!tagStats[tag]) {
            tagStats[tag] = { count: 0, score: 0, isTrending: false };
          }
          tagStats[tag].count += 1;
          tagStats[tag].score += recencyWeight + trendingBonus;
          if (isStoryTrending) tagStats[tag].isTrending = true;
        });
      });

      const sortedTags = Object.entries(tagStats)
        .sort((a, b) => b[1].score - a[1].score);

      const allScores = sortedTags.map(([, s]) => s.score);
      const avgScore = allScores.length > 0 ? (allScores.reduce((sum, v) => sum + v, 0) / allScores.length) : 0;

      // Dynamic Hot / Flame criteria:
      // A tag is dynamically "hot" if:
      // 1. It belongs to an active trending/breaking story, OR
      // 2. Its dynamic velocity score is >= 4 and significantly higher than average.
      const hotScoreThreshold = Math.max(4, avgScore * 1.3);

      let hotCount = 0;
      const dynamicTopics = sortedTags.map(([label, stat]) => {
        const isSurging = stat.isTrending || (stat.score >= hotScoreThreshold && stat.count >= 1);
        let hot = false;
        if (isSurging && hotCount < 4) {
          hot = true;
          hotCount++;
        }
        return {
          label,
          slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          hot
        };
      });

      // Complement with regional topics if total tags are under 30 (fallback topics never have hot = true)
      const existingSlugs = new Set(dynamicTopics.map(t => t.slug));
      const filler = DEFAULT_POPULAR_TOPICS
        .filter(t => !existingSlugs.has(t.toLowerCase().replace(/[^a-z0-9]+/g, '-')))
        .map(label => ({
          label,
          slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          hot: false
        }));

      const finalTopics = [...dynamicTopics, ...filler].slice(0, 35);
      setTrendingTopics(finalTopics);
    } else {
      const fallbackTopics = DEFAULT_POPULAR_TOPICS.map((label) => ({
        label,
        slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        hot: false
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
