export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans selection:bg-red-600/20 selection:text-black overflow-x-hidden">
      
      {/* ── 1. TOP UTILITY STRIP SKELETON (DARK NAVY) ── */}
      <div className="bg-[#0B132B] text-slate-300 border-b border-slate-800/80 py-1.5 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 text-xs">
          
          {/* Left: Live Edition Indicator & Clock */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="w-24 h-2.5 bg-emerald-700/50 rounded skeleton-shimmer-dark" />
            </div>

            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-700/60 skeleton-shimmer-dark shrink-0" />
              <div className="w-36 h-2.5 bg-slate-700/50 rounded skeleton-shimmer-dark" />
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/40">
              <span className="text-[11px]">🌤️</span>
              <div className="w-20 h-2.5 bg-slate-700/50 rounded skeleton-shimmer-dark" />
            </div>
          </div>

          {/* Right: Language Selector & WhatsApp Alerts */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-20 h-6 rounded-full bg-slate-800/80 border border-slate-700/60 skeleton-shimmer-dark" />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/30">
              <span className="w-2 h-2 rounded-full bg-[#25D366]/70 animate-pulse" />
              <div className="w-24 h-2.5 bg-[#25D366]/40 rounded skeleton-shimmer-dark" />
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. MAIN MASTHEAD BAR & CATEGORIES SKELETON ── */}
      <div className="bg-[#FAF9F6] border-b border-slate-200/80 py-2.5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          
          {/* Mobile hamburger menu placeholder */}
          <div className="lg:hidden p-2 rounded-lg bg-slate-200/80 w-9 h-9 skeleton-shimmer shrink-0" />

          {/* Main Brand Logo & Editorial Wordmark */}
          <div className="flex items-center gap-3 shrink-0 pr-2 lg:pr-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 skeleton-shimmer shrink-0" />
            <div className="hidden sm:flex flex-col gap-1 shrink-0">
              <div className="w-48 h-5 bg-slate-300 rounded skeleton-shimmer" />
              <div className="w-28 h-2.5 bg-slate-200 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Desktop Category Navigation Pills Strip */}
          <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0 justify-start 2xl:justify-center px-2">
            <div className="w-24 h-7.5 rounded-full bg-slate-900/90 shrink-0" />
            <div className="w-20 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
            <div className="w-18 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
            <div className="w-20 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
            <div className="w-22 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
            <div className="w-24 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
            <div className="w-18 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
            <div className="w-18 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
            <div className="w-22 h-7.5 rounded-full bg-slate-200/90 skeleton-shimmer shrink-0" />
          </nav>

          {/* Actions: Search, Saved, Newsletter */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-28 sm:w-36 h-8 rounded-full bg-white border border-slate-200 skeleton-shimmer shadow-2xs" />
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 skeleton-shimmer shadow-2xs" />
            <div className="hidden sm:block w-28 h-8 rounded-full bg-slate-950/85 skeleton-shimmer-dark shadow-xs" />
          </div>

        </div>
      </div>

      {/* ── 3. TRENDING BAR SKELETON ── */}
      <div className="bg-white border-b border-slate-200/90 py-1.5 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 flex items-center gap-3">
          
          {/* Left: Trending Badge */}
          <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E63946] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E63946]" />
            </span>
            <span className="font-sans font-black text-[11px] tracking-wider uppercase text-slate-800 hidden sm:inline">
              TRENDING
            </span>
          </div>

          {/* Center: Hashtag Topic Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
            <div className="w-28 h-6.5 rounded-full bg-slate-100 border border-slate-200/80 skeleton-shimmer shrink-0" />
            <div className="w-32 h-6.5 rounded-full bg-slate-100 border border-slate-200/80 skeleton-shimmer shrink-0" />
            <div className="w-24 h-6.5 rounded-full bg-slate-100 border border-slate-200/80 skeleton-shimmer shrink-0" />
            <div className="w-36 h-6.5 rounded-full bg-slate-100 border border-slate-200/80 skeleton-shimmer shrink-0" />
            <div className="w-28 h-6.5 rounded-full bg-slate-100 border border-slate-200/80 skeleton-shimmer shrink-0" />
            <div className="w-30 h-6.5 rounded-full bg-slate-100 border border-slate-200/80 skeleton-shimmer shrink-0" />
            <div className="w-26 h-6.5 rounded-full bg-slate-100 border border-slate-200/80 skeleton-shimmer shrink-0" />
          </div>

        </div>
      </div>

      {/* ── 4. EXPRESS WIRE TICKER SKELETON ── */}
      <div className="bg-[#0B132B] text-white border-b border-slate-800/80 py-2 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#E63946] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Express Wire</span>
          </div>
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div className="w-16 h-4 bg-emerald-900/60 rounded skeleton-shimmer-dark shrink-0" />
            <div className="w-64 sm:w-96 h-3.5 bg-slate-700/60 rounded skeleton-shimmer-dark shrink-0" />
            <span className="text-slate-700 select-none hidden md:inline">/</span>
            <div className="w-16 h-4 bg-emerald-900/60 rounded skeleton-shimmer-dark shrink-0 hidden md:block" />
            <div className="w-72 h-3.5 bg-slate-700/60 rounded skeleton-shimmer-dark shrink-0 hidden md:block" />
          </div>
        </div>
      </div>

      {/* ── 5. MAIN CONTENT CONTAINER ── */}
      <main className="relative bg-white text-black pb-20 lg:pb-12" role="main">

        {/* Leaderboard Ad Skeleton */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 mt-6">
          <div className="w-full h-22 sm:h-24 bg-slate-100/80 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center gap-2 skeleton-shimmer">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
              ADVERTISEMENT
            </span>
            <div className="w-48 h-3 bg-slate-200 rounded" />
          </div>
        </div>

        {/* ── 6. 12-COLUMN HERO SECTION SKELETON ── */}
        <section className="py-6 px-4 sm:px-8 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Lead Flagship Story (8 Cols) */}
            <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-slate-900 shadow-md min-h-[460px] md:min-h-[540px] flex flex-col justify-between p-6 sm:p-8 skeleton-shimmer-dark">
              
              {/* Top Floating Badges & Controls */}
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-[#E63946] text-white text-[10px] font-extrabold uppercase tracking-widest shadow-xs">
                    Featured
                  </div>
                  <div className="px-3 py-1 rounded-full bg-slate-950/70 border border-slate-700/50 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Lead Dispatch</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-6 rounded-full bg-slate-950/70 border border-slate-700/50" />
                  <div className="w-7 h-7 rounded-full bg-slate-950/70 border border-slate-700/50" />
                  <div className="w-7 h-7 rounded-full bg-slate-950/70 border border-slate-700/50" />
                </div>
              </div>

              {/* Bottom Editorial Content Overlay */}
              <div className="space-y-4 relative z-10 pt-16">
                <div className="w-28 h-4 rounded bg-emerald-400/30" />
                
                {/* Serif Headline Placeholders */}
                <div className="space-y-2.5">
                  <div className="w-full h-8 sm:h-11 bg-white/25 rounded-lg" />
                  <div className="w-4/5 h-8 sm:h-11 bg-white/20 rounded-lg" />
                </div>

                {/* Excerpt Placeholders */}
                <div className="space-y-2 pt-1">
                  <div className="w-11/12 h-3.5 bg-slate-300/30 rounded" />
                  <div className="w-2/3 h-3.5 bg-slate-300/25 rounded" />
                </div>

                {/* Author & Reading Time Row */}
                <div className="flex items-center gap-3 pt-3">
                  <div className="w-8 h-8 rounded-full bg-white/25" />
                  <div className="w-32 h-3.5 bg-white/25 rounded" />
                  <div className="w-16 h-3 bg-white/15 rounded" />
                </div>
              </div>

            </div>

            {/* Right: Secondary Featured Stories (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
              {[1, 2, 3].map((num) => (
                <div 
                  key={num}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex gap-4 items-center justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#E63946]">
                        {String(num).padStart(2, '0')}
                      </span>
                      <div className="w-16 h-4 bg-slate-200 rounded-full skeleton-shimmer" />
                    </div>
                    <div className="w-full h-4 bg-slate-200 rounded skeleton-shimmer" />
                    <div className="w-4/5 h-4 bg-slate-200 rounded skeleton-shimmer" />
                    <div className="w-24 h-3 bg-slate-100 rounded skeleton-shimmer" />
                  </div>
                  <div className="w-24 h-20 rounded-xl bg-slate-200 skeleton-shimmer shrink-0" />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── 7. REGIONAL RADAR ("HEART OF JHARKHAND") SKELETON ── */}
        <section className="px-4 sm:px-8 max-w-[1600px] mx-auto pt-2 pb-6">
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0D5C46] animate-pulse" />
                <span className="font-serif font-bold text-base text-slate-900">
                  Regional Radar: Across Jharkhand
                </span>
              </div>
              <div className="w-24 h-3 bg-slate-200 rounded skeleton-shimmer" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Santhal Pargana'].map((district) => (
                <div key={district} className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs space-y-2">
                  <div className="w-full aspect-16/10 rounded-lg bg-slate-200 skeleton-shimmer" />
                  <div className="w-16 h-3 bg-emerald-100 rounded skeleton-shimmer" />
                  <div className="w-full h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                  <div className="w-3/4 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. MAIN MAGAZINE LAYOUT (8 COLS HARD NEWS + 4 COLS SIDEBAR) ── */}
        <div className="px-4 sm:px-8 max-w-[1600px] mx-auto pt-4">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
            
            {/* Left Column: Hard News & Features (8 cols) */}
            <div className="w-full lg:w-8/12 xl:w-3/4 flex flex-col gap-10">
              
              {/* Section 1: National Desk */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-5 bg-[#1D4ED8] rounded-xs" />
                    <span className="font-serif font-black text-xl text-slate-900 tracking-tight">
                      National Desk
                    </span>
                  </div>
                  <div className="w-20 h-4 bg-slate-200 rounded skeleton-shimmer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-3 group">
                      <div className="aspect-16/10 bg-slate-200 rounded-xl skeleton-shimmer shadow-2xs" />
                      <div className="w-16 h-3 bg-blue-100 rounded skeleton-shimmer" />
                      <div className="w-full h-4 bg-slate-200 rounded skeleton-shimmer" />
                      <div className="w-4/5 h-4 bg-slate-200 rounded skeleton-shimmer" />
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-5 h-5 rounded-full bg-slate-200 skeleton-shimmer" />
                        <div className="w-24 h-3 bg-slate-100 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard Mid-Feed Ad */}
              <div className="w-full h-22 sm:h-24 bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col items-center justify-center gap-2 skeleton-shimmer">
                <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                  SPONSORED DISPATCH
                </span>
                <div className="w-40 h-3 bg-slate-200 rounded" />
              </div>

              {/* Section 2: State Politics & Governance */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-5 bg-[#E63946] rounded-xs" />
                    <span className="font-serif font-black text-xl text-slate-900 tracking-tight">
                      State Politics & Governance
                    </span>
                  </div>
                  <div className="w-20 h-4 bg-slate-200 rounded skeleton-shimmer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-3 group">
                      <div className="aspect-16/10 bg-slate-200 rounded-xl skeleton-shimmer shadow-2xs" />
                      <div className="w-16 h-3 bg-red-100 rounded skeleton-shimmer" />
                      <div className="w-full h-4 bg-slate-200 rounded skeleton-shimmer" />
                      <div className="w-4/5 h-4 bg-slate-200 rounded skeleton-shimmer" />
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-5 h-5 rounded-full bg-slate-200 skeleton-shimmer" />
                        <div className="w-24 h-3 bg-slate-100 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Sidebar (4 cols) */}
            <div className="w-full lg:w-4/12 xl:w-1/4">
              <div className="space-y-6">
                
                {/* Sidebar Widget 1: Most Read / Express Pulse */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                      <span className="font-serif font-black text-base text-slate-900">
                        Most Read Today
                      </span>
                    </div>
                    <div className="w-12 h-3 bg-slate-200 rounded skeleton-shimmer" />
                  </div>

                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="font-mono text-sm font-black text-slate-400 shrink-0">
                          {String(i).padStart(2, '0')}
                        </span>
                        <div className="space-y-1.5 w-full">
                          <div className="w-full h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                          <div className="w-3/4 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                          <div className="w-20 h-2.5 bg-slate-100 rounded skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Widget 2: Live Wire Updates */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-serif font-bold text-base text-slate-900">
                      Live Wire Timeline
                    </span>
                  </div>

                  <div className="space-y-4 pl-2 border-l-2 border-slate-200">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-1.5 relative pl-4">
                        <span className="w-2 h-2 rounded-full bg-slate-400 absolute -left-[21px] top-1" />
                        <div className="w-16 h-3 bg-emerald-100 rounded skeleton-shimmer" />
                        <div className="w-full h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                        <div className="w-4/5 h-3.5 bg-slate-200 rounded skeleton-shimmer" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Widget 3: Newsletter Promo Box */}
                <div className="bg-[#0B132B] text-white rounded-2xl p-5 shadow-md space-y-3 skeleton-shimmer-dark">
                  <div className="w-20 h-4 bg-amber-400/30 rounded" />
                  <div className="w-full h-5 bg-white/20 rounded" />
                  <div className="w-3/4 h-3 bg-slate-400/30 rounded" />
                  <div className="w-full h-9 rounded-xl bg-white/10 mt-2" />
                </div>

              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}

