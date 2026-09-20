/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useRef, useState, useEffect, Fragment } from 'react';
import { Article, LiveUpdate } from '../../types';
import { TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Radio, Newspaper, Image as ImageIcon, Users, Sparkles, ChevronRight } from 'lucide-react';
import AdPlacement from '../AdPlacement';

interface SidebarProps {
  trending: Article[];
  live: LiveUpdate[];
  onArticleClick: (article: Article) => void;
  simulatedDate?: string;
  allArticles?: Article[];
  globalSettings?: any;
}

export default function Sidebar({
  trending,
  live,
  onArticleClick,
  simulatedDate,
  allArticles = [],
  globalSettings
}: SidebarProps) {
  const [marketData, setMarketData] = useState([
    { symbol: 'NIFTY 50', price: 'Loading...', change: '...', up: true },
    { symbol: 'SENSEX', price: 'Loading...', change: '...', up: true },
    { symbol: 'TATA STEEL', price: 'Loading...', change: '...', up: true },
    { symbol: 'COAL INDIA', price: 'Loading...', change: '...', up: true }
  ]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const symbols = ['^NSEI', '^BSESN', 'TATASTEEL.NS', 'COALINDIA.NS'];
        
        const results = await Promise.all(symbols.map(async (sym) => {
          try {
            const res = await fetch(`/api/market?symbol=${encodeURIComponent(sym)}`);
            if (!res.ok) return null;
            const data = await res.json();
            const meta = data?.chart?.result?.[0]?.meta;
            if (!meta) return null;
            
            let displayName = sym;
            if (sym === '^NSEI') displayName = 'NIFTY 50';
            else if (sym === '^BSESN') displayName = 'SENSEX';
            else if (sym.startsWith('TATA')) displayName = 'TATA STEEL';
            else if (sym.startsWith('COAL')) displayName = 'COAL INDIA';

            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose || meta.previousClose;
            const changeRaw = price - prevClose;
            const changePct = prevClose ? (changeRaw / prevClose) * 100 : 0;
            
            return {
              symbol: displayName,
              price: price ? price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : 'N/A',
              change: `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`,
              up: changeRaw >= 0
            };
          } catch (e) {
            return null;
          }
        }));

        const validResults = results.filter(Boolean);
        if (validResults.length > 0) {
          setMarketData(prev => prev.map(item => validResults.find((v: any) => v.symbol === item.symbol) || item));
        }
      } catch (error) {}
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000);
    return () => clearInterval(interval);
  }, []);

  const photoArticles = allArticles.filter(a => Boolean(a.imageUrl)).slice(0, 3);

  return (
    <aside className="space-y-8">
      
      {/* ── 1. Financial Markets Pulse ── */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0D5C46]" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
              Markets & Commodities
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {marketData.map((stock) => (
            <div
              key={stock.symbol}
              className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between"
            >
              <span className="text-[11px] font-bold text-slate-700 truncate">{stock.symbol}</span>
              <div className="mt-1 flex items-baseline justify-between gap-1">
                <span className="text-xs font-mono font-bold text-slate-900">{stock.price}</span>
                <span className={`text-[10px] font-bold font-mono flex items-center ${stock.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stock.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                  {stock.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ad Slot 1 (HP-REC-01) ── */}
      <AdPlacement
        type="rectangle"
        slotId="HP-REC-01"
        simulatedDate={simulatedDate}
        globalSettings={globalSettings}
        wrapperClassName="bg-slate-50/60 p-4 border border-slate-200/80 rounded-2xl flex justify-center overflow-hidden"
      />

      {/* ── 2. Trending Leaderboard ── */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <TrendingUp className="w-4 h-4 text-[#E63946]" />
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            Most Read Today
          </h3>
        </div>

        <div className="space-y-4">
          {trending.slice(0, 5).map((article, i) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article)}
              className="group cursor-pointer flex gap-3.5 items-start pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
            >
              <span className="font-serif font-black text-2xl text-slate-300 group-hover:text-[#E63946] transition-colors leading-none pt-0.5 shrink-0 w-6">
                0{i + 1}
              </span>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-wider text-[#0D5C46]">
                    {article.category}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {(2800 - i * 450).toLocaleString()} views
                  </span>
                </div>
                <h4 className="font-sans font-bold text-xs text-slate-900 leading-snug group-hover:text-[#E63946] transition-colors line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ad Slot 2 (HP-REC-02) ── */}
      <AdPlacement
        type="rectangle"
        slotId="HP-REC-02"
        simulatedDate={simulatedDate}
        globalSettings={globalSettings}
        wrapperClassName="bg-slate-50/60 p-4 border border-slate-200/80 rounded-2xl flex justify-center overflow-hidden"
      />

      {/* ── 3. Live Center Satellite Feed ── */}
      <section id="live-center" className="bg-[#0B132B] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              Live Wire Stream
            </h3>
          </div>
          <span className="text-[9px] font-mono text-slate-400 uppercase">SAT-LINK</span>
        </div>

        <div className="space-y-4 relative">
          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-800" />
          
          {live.map((update) => (
            <div
              key={update.id}
              onClick={() => {
                const article = allArticles.find(a => a.id === update.id);
                if (article) onArticleClick(article);
              }}
              className="relative pl-6 group cursor-pointer"
            >
              <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-[#E63946] group-hover:bg-[#E63946] transition-colors" />
              <span className="text-[10px] font-mono text-slate-400 block mb-0.5" suppressHydrationWarning>
                {update.timestamp}
              </span>
              <p className="text-xs font-sans text-slate-200 group-hover:text-white leading-relaxed line-clamp-2">
                {update.isBreaking && (
                  <span className="text-[#E63946] font-bold mr-1.5">BREAKING:</span>
                )}
                {update.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ad Slot 3 (HP-REC-03) ── */}
      <AdPlacement
        type="rectangle"
        slotId="HP-REC-03"
        simulatedDate={simulatedDate}
        globalSettings={globalSettings}
        wrapperClassName="bg-slate-50/60 p-4 border border-slate-200/80 rounded-2xl flex justify-center overflow-hidden"
      />

      {/* ── 4. WhatsApp Direct Community ── */}
      <section className="bg-gradient-to-br from-[#128C7E] to-[#075E54] rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-5 h-5 text-emerald-200 animate-pulse" />
          <h3 className="font-serif font-bold text-base">Jharkhand Express Alert Channel</h3>
        </div>
        <p className="text-xs text-emerald-100 mb-4 leading-relaxed font-sans">
          Never miss critical state alerts, emergency news, or breaking investigations.
        </p>
        <a
          href={globalSettings?.whatsapp_url || "https://whatsapp.com/channel/YOUR_CHANNEL_ID"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-white text-[#075E54] rounded-xl text-xs font-bold uppercase tracking-wider block text-center shadow hover:bg-emerald-50 transition-colors"
        >
          Join 25,000+ Readers
        </a>
      </section>

      {/* ── Ad Slot 4 (HP-REC-04) ── */}
      <AdPlacement
        type="rectangle"
        slotId="HP-REC-04"
        simulatedDate={simulatedDate}
        globalSettings={globalSettings}
        wrapperClassName="bg-slate-50/60 p-4 border border-slate-200/80 rounded-2xl flex justify-center overflow-hidden"
      />

      {/* ── 5. Visual Story Briefings ── */}
      {photoArticles.length > 0 && (
        <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#0D5C46]" />
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                Visual Briefs
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">PHOTO DESK</span>
          </div>

          <div className="space-y-3">
            {photoArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onArticleClick(article)}
                className="group cursor-pointer relative rounded-xl overflow-hidden aspect-video bg-slate-900"
              >
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-3.5 flex flex-col justify-end">
                  <span className="text-[9px] font-mono font-bold uppercase text-amber-400">
                    {article.category}
                  </span>
                  <h5 className="font-sans font-bold text-xs text-white line-clamp-2 group-hover:text-amber-200 transition-colors">
                    {article.title}
                  </h5>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Ad Slot 5 (HP-REC-05) ── */}
      <AdPlacement
        type="rectangle"
        slotId="HP-REC-05"
        simulatedDate={simulatedDate}
        globalSettings={globalSettings}
        wrapperClassName="bg-slate-50/60 p-4 border border-slate-200/80 rounded-2xl flex justify-center overflow-hidden"
      />

      {/* ── 6. Social Community ── */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0D5C46]" />
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            Follow The Bureau
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          Stay connected with Jharkhand Express reporters on digital channels.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <a
            href="https://www.youtube.com/@JharkhandExpress"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-colors border border-slate-100 text-slate-700"
          >
            <span className="text-xs font-bold">YouTube</span>
          </a>
          <a
            href="https://twitter.com/jharkhandexpress"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-colors border border-slate-100 text-slate-700"
          >
            <span className="text-xs font-bold">X (Twitter)</span>
          </a>
          <a
            href="https://www.instagram.com/jharkhandexpress/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-600 transition-colors border border-slate-100 text-slate-700"
          >
            <span className="text-xs font-bold">Instagram</span>
          </a>
        </div>
      </section>

      {/* ── Sticky Bottom Ad Slot 6 (HP-REC-06) ── */}
      <div className="sticky top-28">
        <AdPlacement
          type="rectangle"
          slotId="HP-REC-06"
          simulatedDate={simulatedDate}
          globalSettings={globalSettings}
          wrapperClassName="bg-slate-50/60 p-4 border border-slate-200/80 rounded-2xl flex justify-center overflow-hidden"
        />
      </div>

    </aside>
  );
}
