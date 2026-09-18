"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  Activity, 
  Tv, 
  Camera, 
  FolderTree, 
  Tag,
  Menu,
  X,
  LifeBuoy,
  Globe,
  History
} from 'lucide-react';

const quickAccess = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Articles', href: '/admin/articles', icon: FileText },
  { name: 'Live', href: '/admin/live', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const moreItems = [
  { name: 'Wayback Machine', href: '/admin/wayback', icon: History },
  { name: 'Live Settings', href: '/admin/live/settings', icon: Settings },
  { name: 'YouTube', href: '/admin/youtube', icon: Tv },
  { name: 'Ads', href: '/admin/ads', icon: Camera },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Tags', href: '/admin/tags', icon: Tag },
  { name: 'Old Website', href: '/admin/old-website', icon: Globe },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Support', href: '/admin/support', icon: LifeBuoy },
  { name: 'Server Health', href: '/admin/health', icon: Activity },
];

export default function MobileDock() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to determine active state. Dashboard is strict match, others are prefix matches.
  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Dimmed Overlay for More Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* More Menu Slide-up Panel */}
      <div 
        className={`fixed bottom-18 left-4 right-4 z-50 bg-background/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}
      >
        <div className="grid grid-cols-3 gap-4">
          {moreItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
              >
                <item.icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide text-center">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Bottom Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {quickAccess.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all active:scale-95 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${active ? 'bg-primary/10' : ''}`}>
                  <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-all ${active ? 'opacity-100' : 'opacity-70'}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* More Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-all active:scale-95 ${isMenuOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${isMenuOpen ? 'bg-muted' : ''}`}>
              {isMenuOpen ? (
                <X className="w-5 h-5" strokeWidth={2.5} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2} />
              )}
            </div>
            <span className={`text-[10px] font-medium tracking-wide transition-all ${isMenuOpen ? 'opacity-100' : 'opacity-70'}`}>
              Menu
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
