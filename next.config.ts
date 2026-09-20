import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.OUTPUT_STANDALONE === 'true' && !process.env.VERCEL ? { output: 'standalone' as const } : {}),
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.0.129", "127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jharkhandexpress.in',
      },
      {
        protocol: 'https',
        hostname: '*.jharkhandexpress.in',
      },
      {
        protocol: 'https',
        hostname: 'pub-332c6c4db0c74d3fbe39d9ed8deb79e1.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  // Force no-cache headers on all dynamic page routes so AWS Amplify's
  // CloudFront CDN never serves stale HTML from its cache.
  async headers() {
    const noStore = [
      { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
      { key: 'Pragma',        value: 'no-cache' },
      { key: 'Expires',       value: '0' },
      { key: 'Surrogate-Control', value: 'no-store' },
    ];
    return [
      { source: '/',                headers: noStore },
      { source: '/article/:slug*',  headers: noStore },
      { source: '/api/settings',    headers: noStore },
      { source: '/api/:path*',      headers: noStore },
    ];
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
};

export default nextConfig;
