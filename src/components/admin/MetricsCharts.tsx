"use client";

import { useEffect, useState } from "react";
import { Users, Eye, Play, TrendingUp, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, ComposedChart, Line,
  ResponsiveContainer, YAxis, Tooltip, XAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

interface OmniData {
  youtube: { stats: { subscribers: number; views: number; videos: number } };
  ga: { totalActiveUsers: number };
  timeline: Array<{ date: string; ytViews: number; gaUsers: number; trendInterest: number }>;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function MetricsCharts({ hasArticles }: { hasArticles: boolean }) {
  const [data, setData] = useState<OmniData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'NotConnected' | 'error' | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [days, setDays] = useState('30');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch 2x the requested days so we can calculate the previous period's delta
      const totalDaysToFetch = parseInt(days) * 2;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - totalDaysToFetch * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const res = await fetch(`/api/admin/analytics/omni?startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' });
      if (res.status === 401) { setError('NotConnected'); return; }
      if (!res.ok) { setError('error'); return; }
      const json = await res.json();
      if (json.error === 'NotConnected') { setError('NotConnected'); return; }
      setData(json);
      setLastUpdated(new Date());
    } catch {
      setError('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [days]);

  // ── Not Connected ──
  if (!loading && error === 'NotConnected') {
    return (
      <Card className="col-span-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
          <div>
            <p className="font-semibold text-base">Google Account Not Connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect your Google account via YouTube settings to enable live GA4 & YouTube analytics.
            </p>
          </div>
          <Button asChild className="gap-2 mt-2">
            <Link href="/admin/youtube">Connect Google Account →</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-35">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ── Data available ──
  const gaUsers = data?.ga.totalActiveUsers ?? 0;
  const ytSubs = data?.youtube.stats.subscribers ?? 0;
  const ytViews = data?.youtube.stats.views ?? 0;
  const ytVideos = data?.youtube.stats.videos ?? 0;
  const fullTimeline = data?.timeline ?? [];

  const currentDaysCount = parseInt(days);
  
  // Current period (last `days`)
  const currentPeriod = fullTimeline.slice(-currentDaysCount);
  
  // Sparklines
  const gaSparkline = currentPeriod.map(d => ({ day: d.date.slice(5), value: d.gaUsers }));
  const ytSparkline = currentPeriod.map(d => ({ day: d.date.slice(5), value: d.ytViews }));

  // Previous period (the `days` before current period)
  const previousPeriod = fullTimeline.slice(-(currentDaysCount * 2), -currentDaysCount);
  
  const calcDelta = (key: 'gaUsers' | 'ytViews') => {
    const cur = currentPeriod.reduce((s, d) => s + d[key], 0);
    const prv = previousPeriod.reduce((s, d) => s + d[key], 0);
    if (prv === 0) return null;
    return ((cur - prv) / prv) * 100;
  };
  const gaUsersDelta = calcDelta('gaUsers');
  const ytViewsDelta = calcDelta('ytViews');

  const DeltaBadge = ({ delta }: { delta: number | null }) => {
    if (delta === null) return <span className="text-xs text-muted-foreground">No prior data</span>;
    return (
      <span className={`text-xs font-medium ${delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}% vs prev {days}d
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Last updated bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live — Google Analytics + YouTube
          </Badge>
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-35 h-8 text-xs">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* GA4 — Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GA4 Users ({days}d)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline mb-1">
              <div className="text-2xl font-bold">{fmt(gaUsers)}</div>
              <DeltaBadge delta={gaUsersDelta} />
            </div>
            <div className="h-15 mt-4">
              <ChartContainer config={{ value: { label: "Users", color: "hsl(var(--chart-1))" } }} className="h-full w-full">
                <AreaChart data={gaSparkline}>
                  <defs>
                    <linearGradient id="gaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Area dataKey="value" type="monotone" fill="url(#gaGrad)" stroke="var(--color-value)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* YouTube — Subscribers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YT Subscribers</CardTitle>
            <Play className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline mb-1">
              <div className="text-2xl font-bold">{fmt(ytSubs)}</div>
              <span className="text-xs text-muted-foreground">{fmt(ytVideos)} videos</span>
            </div>
            <div className="h-15 mt-4">
              <ChartContainer config={{ value: { label: "Views/day", color: "hsl(var(--chart-2))" } }} className="h-full w-full">
                <BarChart data={ytSparkline}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* YouTube — Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YT Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline mb-1">
              <div className="text-2xl font-bold">{fmt(ytViews)}</div>
              <DeltaBadge delta={ytViewsDelta} />
            </div>
            <div className="h-15 mt-4">
              <ChartContainer config={{ value: { label: "YT Views", color: "hsl(var(--chart-3))" } }} className="h-full w-full">
                <AreaChart data={ytSparkline}>
                  <defs>
                    <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Area dataKey="value" type="monotone" fill="url(#ytGrad)" stroke="var(--color-value)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Combined Trend (GA Users + YT Views) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{days}d Combined Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-baseline mb-1">
              <div className="text-2xl font-bold">{fmt((gaUsers + ytViews) / currentDaysCount)}</div>
              <span className="text-[10px] text-muted-foreground font-mono">GA + YT avg/day</span>
            </div>
            <div className="h-15 mt-4">
              <ChartContainer
                config={{
                  gaUsers: { label: "GA Users", color: "hsl(var(--chart-1))" },
                  ytViews: { label: "YT Views", color: "hsl(var(--chart-4))" },
                }}
                className="h-full w-full"
              >
                <ComposedChart data={currentPeriod.map(d => ({ ...d, day: d.date.slice(5) }))}>
                  <YAxis hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Area dataKey="gaUsers" type="monotone" fill="hsl(var(--chart-1)/20%)" stroke="hsl(var(--chart-1))" strokeWidth={1.5} dot={false} />
                  <Line dataKey="ytViews" type="monotone" stroke="hsl(var(--chart-4))" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
