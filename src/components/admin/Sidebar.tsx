"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Settings, Users, ShieldCheck, Activity, Tv, Camera, FolderTree, Tag, LifeBuoy, Globe, History } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Articles', href: '/admin/articles', icon: FileText },
  { name: 'Wayback Machine', href: '/admin/wayback', icon: History },
  { name: 'Live Updates', href: '/admin/live', icon: Activity },
  { name: 'Live Feed Settings', href: '/admin/live/settings', icon: Settings },
  { name: 'YouTube', href: '/admin/youtube', icon: Tv },
  { name: 'Ads Management', href: '/admin/ads', icon: Camera },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Tags Engine', href: '/admin/tags', icon: Tag },
  { name: 'Old Website', href: '/admin/old-website', icon: Globe },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Support', href: '/admin/support', icon: LifeBuoy },
  { name: 'Server Health', href: '/admin/health', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-background border-r border-border flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-20 flex items-center px-8 border-b border-border">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-5 h-5 text-background" />
          </div>
          <span className="font-black text-xl tracking-tighter text-foreground">JHARKHAND EXPRESS</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">Workspace</div>
        {navigation.map((item) => {
          let isActive = false;
          if (item.href === '/admin') {
            isActive = pathname === '/admin';
          } else {
            isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-muted text-foreground font-semibold' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
