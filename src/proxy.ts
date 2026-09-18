import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neon } from '@neondatabase/serverless';

// Common patterns probed by malicious bots looking for WordPress, PHP, or config files
const BOT_PROBE_PATTERNS = [
  /\.php$/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/wp-content/i,
  /^\/wp-includes/i,
  /xmlrpc\.php/i,
  /\.env.*/i,
  /\.git.*/i,
  /\.vscode/i,
  /^\/phpmyadmin/i,
  /^\/mysql/i,
  /^\/config/i,
  /^\/backup/i,
  /^\/old/i,
  /^\/\.well-known/i // Optional, but usually probed.
];

let sqlClient: any = null;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Protect admin routes manually at the edge
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const hasSessionCookie = request.cookies.has('authjs.session-token') || request.cookies.has('__Secure-authjs.session-token');
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 1. Edge Firewall: Immediately block known bad bot patterns to save bandwidth
  for (const pattern of BOT_PROBE_PATTERNS) {
    if (pattern.test(pathname)) {
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  // Ignore static files, API routes, Next.js internals, and admin routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname === '/maintenance' ||
    pathname.includes('.')
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  try {
    if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL!);
    const sql = sqlClient;
    const settings = await sql`
      SELECT maintenance_mode, maintenance_auto_deactivate, maintenance_end_time, maintenance_reason 
      FROM site_settings 
      ORDER BY id DESC LIMIT 1
    `;
    
    if (settings.length > 0 && settings[0].maintenance_mode === true) {
      const now = new Date();
      const endTime = settings[0].maintenance_end_time ? new Date(settings[0].maintenance_end_time) : null;
      
      // If auto deactivate is on, and the end time has passed, we don't show maintenance mode
      if (settings[0].maintenance_auto_deactivate && endTime && now >= endTime) {
        return NextResponse.next();
      }

      // Otherwise, rewrite to maintenance page and pass the end time so the UI can show it
      const rewriteUrl = new URL('/maintenance', request.url);
      if (endTime) {
        rewriteUrl.searchParams.set('endTime', endTime.toISOString());
      }
      if (settings[0].maintenance_reason) {
        rewriteUrl.searchParams.set('reason', settings[0].maintenance_reason);
      }
      return NextResponse.rewrite(rewriteUrl);
    }
  } catch (err) {
    console.error('Middleware DB Error:', err);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
