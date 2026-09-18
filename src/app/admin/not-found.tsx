'use client';

import Link from 'next/link';
import { ShieldAlert, Home, Mail, ArrowLeft } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "'General Sans', sans-serif" }}>
      <div className="bg-muted border border-border rounded-2xl p-10 md:p-16 max-w-2xl w-full shadow-2xl flex flex-col items-center relative overflow-hidden">
        
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />

        <div className="w-20 h-20 bg-background border-2 border-border rounded-2xl flex items-center justify-center mb-8 relative z-10 shadow-inner">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-4 tracking-tight">404</h1>
        <h2 className="text-2xl font-semibold text-zinc-200 mb-4">Classified Route Not Found</h2>
        
        <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed text-sm md:text-base">
          The administrative module you are looking for does not exist, has been moved, or you lack the clearance to access it. 
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/admin" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-foreground px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-600/20"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-muted hover:bg-zinc-700 text-foreground px-6 py-3 rounded-lg font-medium transition-all border border-zinc-700 hover:border-zinc-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>

      {/* Developer Contact Footer */}
      <div className="mt-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
        <p>System Error? Require Technical Support?</p>
        <a 
          href="mailto:hxrshrathore@gmail.com?subject=Admin%20Panel%20404%20Error"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted px-4 py-2 rounded-full border border-border"
        >
          <Mail className="w-4 h-4 text-blue-500" />
          <span className="font-medium">Contact Developer: hxrshrathore@gmail.com</span>
        </a>
      </div>
    </div>
  );
}
