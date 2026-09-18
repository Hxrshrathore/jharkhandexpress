import React from 'react';
import { getRssItems } from '@/lib/db';
import { FileText, Users, Eye, TrendingUp, Clock, AlertCircle, Plus, Activity, Rss, PlaySquare, Server, ShieldCheck, Zap, Settings, ArrowRight, Cloud } from 'lucide-react';
import Link from 'next/link';
import MetricsCharts from '@/components/admin/MetricsCharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { sql } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 60; // revalidate every minute

import { unstable_cache } from 'next/cache';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const getR2Usage = unstable_cache(async () => {
  try {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
      return 0;
    }
    
    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    
    let totalBytes = 0;
    let continuationToken: string | undefined = undefined;
    
    do {
      const listCommand: any = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        ContinuationToken: continuationToken,
      });
      const response: any = await r2.send(listCommand);
      if (response.Contents) {
        for (const item of response.Contents) {
          totalBytes += item.Size || 0;
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    return totalBytes;
  } catch (error) {
    console.error('Error fetching R2 usage:', error);
    return 0;
  }
}, ['r2_storage_usage'], { revalidate: 3600 });

export default async function AdminDashboard() {
  const recentArticles = await getRssItems(6);
  
  // Measure DB Latency
  const startPing = Date.now();
  await sql`SELECT 1`;
  const dbLatency = Date.now() - startPing;

  // Get push subscriber count
  const subQuery = await sql`SELECT COUNT(*) as count FROM push_subscriptions`;
  const subscriberCount = subQuery[0]?.count || 0;

  // Removed NewsBridge Sync Logic
  // Quick dynamic greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Calculate Storage
  const realR2Bytes = await getR2Usage();
  const totalBytes = realR2Bytes;
  const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const maxGB = 10; // 10GB soft cap for display
  let storageProgress = (parseFloat(totalGB) / maxGB) * 100;
  if (storageProgress > 100) storageProgress = 100;

  return (
    <div className="space-y-10 relative">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentDate} — System Online
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">{greeting}, Admin.</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl leading-relaxed">
            Welcome to the JHARKHAND EXPRESS Command Center. Here is your real-time overview of article performance, audience metrics, and system health.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Button asChild className="gap-2">
            <Link href="/admin/articles/new">
              <Plus className="w-4 h-4" /> New Article
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/live">
              <Activity className="w-4 h-4 text-emerald-500" /> Live Feed
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Recharts Metrics Row */}
      <MetricsCharts hasArticles={recentArticles.length > 0} />
      
      {/* Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Pane */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-muted-foreground" /> Recent Syndications
              </CardTitle>
              <CardDescription>Latest synchronized articles across all sources.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/admin/articles">
                View Database <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentArticles.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No syndications detected</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Check the Live Feed Aggregator to initiate a sync.</p>
                <Button asChild>
                  <Link href="/admin/live">Go to Live Feed</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {recentArticles.map((article: any) => (
                  <div key={article.id} className="group flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    {article.featured_image ? (
                      <div className="w-24 h-20 md:w-32 md:h-24 shrink-0 rounded-md overflow-hidden bg-muted">
                        <img src={article.featured_image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="w-24 h-20 md:w-32 md:h-24 shrink-0 rounded-md bg-muted flex items-center justify-center border">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {article.categories?.[0] && (
                          <Badge variant="secondary" className="text-[10px] uppercase">{article.categories[0]}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(article.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-base line-clamp-2 leading-tight mb-1.5 group-hover:text-primary transition-colors">{article.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{article.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 sm:hidden border-t">
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/admin/articles">View All <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </CardFooter>
        </Card>        {/* Side Pane */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Status Core
              </CardTitle>
              <CardDescription>Real-time infrastructure health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Database Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold">Neon DB</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${dbLatency < 100 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-orange-500 border-orange-500/20 bg-orange-500/10'}`}>CONNECTED</Badge>
                </div>
                <Progress value={Math.max(10, 100 - dbLatency)} className="h-1.5" />
                <p className="text-xs text-muted-foreground">Read/Write latency: {dbLatency}ms</p>
              </div>

              {/* Cloudflare CDN Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">Media Storage (SSD)</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/20 bg-blue-500/10">
                    ACTIVE
                  </Badge>
                </div>
                <Progress value={storageProgress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">Storage used: {totalGB} GB / {maxGB} GB</p>
              </div>

              {/* Redis Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold">Upstash Redis</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-500/20 bg-orange-500/10">ACTIVE</Badge>
                </div>
                <Progress value={100} className="h-1.5" />
                <p className="text-xs text-muted-foreground">Timeline cache synced</p>
              </div>

              {/* Push Subscribers Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-semibold">Push Audience</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-purple-500 border-purple-500/20 bg-purple-500/10">GROWING</Badge>
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-2xl font-black">{subscriberCount}</span>
                   <span className="text-xs text-muted-foreground">Active Devices</span>
                </div>
              </div>

              {/* Fast Links */}
              <div className="pt-4 border-t mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Quick Navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/admin/live/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Sources
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/admin/youtube">
                      <PlaySquare className="w-4 h-4 mr-2" />
                      YouTube
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>    
    </div>  
  );
}
