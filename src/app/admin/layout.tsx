import React from 'react';
import { auth } from '@/auth';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import MobileDock from '@/components/admin/MobileDock';
import { TooltipProvider } from '@/components/ui/tooltip';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (!session) {
    if (pathname !== '/admin/login') {
      redirect('/admin/login');
    }
    // If not authenticated and ON the login page, just render the child (which is the login page)
    return <>{children}</>;
  }
  if (session && pathname === '/admin/login') {
    redirect('/admin');
  }

  return (
    <div className="admin-scope min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex" style={{ fontFamily: "'General Sans', sans-serif" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:p-10 md:pb-10 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </div>
        </main>
      </div>
      <MobileDock />
      <Toaster position="top-right" theme="system" richColors />
    </div>
  );
}
