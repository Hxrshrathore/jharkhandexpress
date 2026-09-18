/**
 * TrendingBar — Trending Topics, Live Fuel Prices & Weather
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Hash, Fuel, Sun, Cloud, CloudFog, CloudRain, Snowflake, CloudLightning, Thermometer } from 'lucide-react';

export type DateFilter = 'today' | 'yesterday' | 'custom' | 'older';

interface TrendingBarProps {
  selectedFilter: DateFilter;
  customDate: string;
  onFilterChange: (filter: DateFilter, date?: string) => void;
  selectedTopic?: string | null;
  onTopicClick?: (topic: string | null) => void;
  articles?: any[];
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

export default function TrendingBar({
  selectedFilter,
  customDate,
  onFilterChange,
  selectedTopic,
  onTopicClick,
  articles
}: TrendingBarProps) {
  const [weather, setWeather] = useState<{ temp: number; city: string; region: string; code: number } | null>(null);
  const [fuelInfo, setFuelInfo] = useState<{ petrol: string; diesel: string } | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<{ label: string; slug: string; hot?: boolean }[]>([]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      const tagCounts: Record<string, number> = {};
      articles.forEach(a => {
        if (a.tags) {
          a.tags.forEach((t: string) => {
            const tag = t.trim();
            if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
        
      if (sortedTags.length > 0) {
        const dynamicTopics = sortedTags.map(([label], idx) => ({
          label,
          slug: label.toLowerCase().replace(/\s+/g, '-'),
          hot: idx < 2
        }));
        setTrendingTopics(dynamicTopics);
      }
    } else {
      let active = true;
      fetch('/api/tags/top?limit=10').then(async res => {
        if (res.ok && active) {
          const tagsData = await res.json();
          if (tagsData.success && tagsData.tags && tagsData.tags.length > 0) {
            const dynamicTopics = tagsData.tags.map((t: any, idx: number) => ({
              label: t.member,
              slug: t.member.toLowerCase().replace(/\s+/g, '-'),
              hot: idx < 2
            }));
            setTrendingTopics(dynamicTopics);
          }
        }
      }).catch(err => console.warn('Tags fetch failed', err));
      return () => { active = false; };
    }
  }, [articles]);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        let lat = 23.3441; // Ranchi, Jharkhand coordinates
        let lon = 85.3096;
        let city = 'Ranchi';
        let region = 'Jharkhand';

        try {
          const geoRes = await fetch('/api/geo');
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.latitude && geoData.longitude) {
              lat = geoData.latitude;
              lon = geoData.longitude;
              city = geoData.city || city;
              region = geoData.region || region;
            }
          }
        } catch (e) {
          // ignore
        }

        if (!active) return;

        const results = await Promise.allSettled([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`),
          fetch(`/api/fuel?state=${encodeURIComponent(region)}`)
        ]);

        const weatherRes = results[0].status === 'fulfilled' ? results[0].value : null;
        const fuelRes = results[1].status === 'fulfilled' ? results[1].value : null;

        if (weatherRes && weatherRes.ok && active) {
          try {
            const weatherData = await weatherRes.json();
            if (weatherData.current) {
              setWeather({
                temp: Math.round(weatherData.current.temperature_2m),
                city: city,
                region: region,
                code: weatherData.current.weather_code,
              });
            }
          } catch(e) {}
        }

        if (fuelRes && fuelRes.ok && active) {
          try {
            const fuelData = await fuelRes.json();
            if (fuelData && fuelData.petrol) {
              setFuelInfo(fuelData);
            }
          } catch(e) {}
        }
      } catch (err) {}
    }
    fetchData();
    return () => { active = false; };
  }, []);

  return (
    <div className="bg-white border-b border-slate-200/90 py-2">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Trending Tag Pills */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-2 border-r border-slate-200">
            <TrendingUp className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Trending</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {trendingTopics.length > 0 ? (
              trendingTopics.map((topic) => {
                const isSelected = selectedTopic === topic.slug;
                return (
                  <button
                    key={topic.slug}
                    onClick={() => onTopicClick?.(isSelected ? null : topic.slug)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight transition-all shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#E63946] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {topic.hot && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse" />
                    )}
                    <span>#{topic.label}</span>
                  </button>
                );
              })
            ) : (
              ['Jharkhand Budget', 'Ranchi Smart City', 'Mining Policy', 'IPL 2026', 'East India Corridors'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTopicClick?.(tag.toLowerCase().replace(/\s+/g, '-'))}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                >
                  #{tag}
                </button>
              ))
            )}

            {selectedTopic && (
              <button
                onClick={() => onTopicClick?.(null)}
                className="px-2.5 py-1 rounded-full text-xs font-bold text-[#E63946] bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Right: Fuel Rates & Local Weather */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600 shrink-0">
          {fuelInfo && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-sans font-bold text-slate-800">Petrol: ₹{fuelInfo.petrol}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-sans font-bold text-slate-800">Diesel: ₹{fuelInfo.diesel}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">({fuelInfo.petrol ? 'State Avg' : ''})</span>
            </div>
          )}

          {weather && (
            <div className="flex items-center gap-1.5 pl-4 border-l border-slate-200 text-slate-700">
              <span>{getWeatherEmoji(weather.code)}</span>
              <span className="font-bold text-[11px]">{weather.temp}°C</span>
              <span className="text-slate-400 text-[11px]">{weather.city}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
