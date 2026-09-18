'use client';

import { ShieldAlert, Clock, Rss } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function MaintenancePage() {
  const [endTimeStr, setEndTimeStr] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.maintenance_end_time) {
          const d = new Date(data.maintenance_end_time);
          setEndTimeStr(d.toLocaleString(undefined, { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit' 
          }));
        }
      })
      .catch(console.error);
  }, []);
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden" style={{ fontFamily: "'General Sans', sans-serif" }}>
      {/* Cinematic Red/Orange Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-125 bg-red-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
          SYSTEM MAINTENANCE
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl font-medium tracking-tight mb-12 max-w-xl mx-auto">
          Jharkhand Express is currently undergoing scheduled maintenance. We will be back shortly with the latest news from Jharkhand.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 p-5 rounded-xl flex items-start gap-4">
            <Clock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Est. Downtime</h3>
              <p className="text-xs text-zinc-300 mt-1 font-bold">
                {endTimeStr ? `Restoration expected by ${endTimeStr}.` : 'Systems will be restored shortly.'}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">Our engineers are monitoring the deployment.</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 p-5 rounded-xl flex items-start gap-4">
            <Rss className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Feed Integrity</h3>
              <p className="text-xs text-zinc-500 mt-1">All breaking news and raw data feeds are securely buffered during this window.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Status: Updating</span>
        </div>
      </motion.div>
    </div>
  );
}
