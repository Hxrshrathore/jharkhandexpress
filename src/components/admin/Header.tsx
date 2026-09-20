import React from 'react';
import { signOut } from '@/auth';
import { LogOut, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import GeminiUsageMetric from './GeminiUsageMetric';

export default function Header({ user }: { user?: any }) {
  return (
    <header className="h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile Logo */}
        <Link href="/admin" className="flex items-center gap-2 group md:hidden">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-background" />
          </div>
          <span className="font-black text-lg tracking-tighter text-foreground">JE Admin</span>
        </Link>
        
        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-muted/50 border border-border rounded-full pl-10 pr-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Google Gemini Usage & Quota Metric Widget (Replaces Static Bell) */}
        <GeminiUsageMetric />
        
        <div className="flex items-center gap-3 border-l border-border pl-3 md:pl-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-foreground">{user?.name || 'Administrator'}</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Admin Role</span>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary border-2 border-background flex items-center justify-center text-primary-foreground font-bold shadow-lg text-sm md:text-base">
            {user?.name?.[0] || 'A'}
          </div>
        </div>

        <form action={async () => {
          'use server';
          await signOut({ redirectTo: '/admin/login' });
        }}>
          <button type="submit" className="p-2 text-muted-foreground hover:text-destructive transition-colors ml-2" title="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
