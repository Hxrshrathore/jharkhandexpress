'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, CheckCircle2, AlertCircle, RefreshCw, Zap, ExternalLink, Cpu } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GeminiMetrics {
  configured: boolean;
  model: string;
  tier: string;
  rpmLimit: number;
  rpdLimit: number;
  rpmCurrent: number;
  rpdCurrent: number;
  totalTranslations: number;
  totalArticles: number;
  status: 'healthy' | 'warning' | 'error' | 'unconfigured';
  lastLatencyMs?: number;
  lastChecked?: string;
  cloudMonitoring?: {
    connected: boolean;
    projectId: string;
    totalRequests24h?: number;
    geminiRequests24h?: number;
    apiBreakdown?: Record<string, number>;
    error?: string;
  };
  pingResult?: {
    success: boolean;
    latencyMs: number;
    error?: string;
  };
}

export default function GeminiUsageMetric() {
  const [data, setData] = useState<GeminiMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchMetrics = async (runTest = false) => {
    try {
      if (runTest) setTestingPing(true);
      else setLoading(true);

      const res = await fetch(`/api/admin/gemini-usage${runTest ? '?test=true' : ''}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch Gemini usage:', err);
    } finally {
      setLoading(false);
      setTestingPing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh every 3 minutes automatically
    const interval = setInterval(() => {
      fetchMetrics();
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  const rpdPercent = data ? Math.min(100, Math.round((data.rpdCurrent / (data.rpdLimit || 1500)) * 100)) : 0;
  const isHealthy = data?.configured && data?.status !== 'error';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 hover:border-indigo-500/40 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 hover:from-blue-500/15 hover:to-purple-500/15 transition-all shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer"
          title="Google Gemini AI Engine Usage & Quota"
        >
          {/* Animated Gradient Sparkle Icon */}
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-500 transition-transform group-hover:scale-110 duration-200" />
            {isHealthy && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
            )}
          </div>

          {/* Metric Pill Label */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
              Gemini 3.5
            </span>

            {/* Quota or Status Pill */}
            {data ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {data.rpdCurrent > 0 ? `${data.rpdCurrent} reqs` : '15 RPM'}
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
            )}
          </div>

          {/* Status Dot */}
          <span
            className={`w-2 h-2 rounded-full ${
              !data?.configured
                ? 'bg-amber-500'
                : data.status === 'error'
                ? 'bg-destructive'
                : 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
            }`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 md:w-88 p-4 bg-background/95 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl z-50 text-foreground"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm leading-tight text-foreground">Google Gemini Engine</h4>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-indigo-500/30 text-indigo-500 font-mono">
                  {data?.model || '3.5-flash-lite'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Free Tier (15 RPM / 1.5K RPD)
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchMetrics()}
            disabled={loading || testingPing}
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </Button>
        </div>

        {/* Quota Consumption */}
        <div className="py-3 space-y-3">
          {/* Daily Quota Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Daily Requests Quota
              </span>
              <span className="font-mono text-[11px] font-bold">
                {data?.rpdCurrent || 0} / {data?.rpdLimit || 1500}
              </span>
            </div>
            <Progress value={Math.max(2, rpdPercent)} className="h-1.5 bg-muted" />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{rpdPercent}% used today</span>
              <span>Reset: Midnight UTC</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                RPM Rate Limit
              </span>
              <span className="text-base font-black text-foreground mt-0.5 flex items-baseline gap-1">
                {data?.rpmCurrent || 0}
                <span className="text-[10px] font-normal text-muted-foreground">/ 15 RPM</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 flex flex-col">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                AI Translations
              </span>
              <span className="text-base font-black text-indigo-500 mt-0.5">
                {data?.totalTranslations ?? '—'}
              </span>
            </div>
          </div>

          {/* Latency & Key Status */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <div>
                <div className="font-semibold text-foreground text-[11px]">API Key Status</div>
                <div className="text-[10px] text-muted-foreground">
                  {data?.configured ? 'Active (.env.local)' : 'Missing GEMINI_API_KEY'}
                </div>
              </div>
            </div>

            {data?.lastLatencyMs ? (
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                {data.lastLatencyMs}ms
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                Ready
              </Badge>
            )}
          </div>

          {/* Google Cloud Monitoring Telemetry */}
          {data?.cloudMonitoring?.connected ? (
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-600 dark:text-blue-400 text-[11px] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Cloud Monitoring
                </span>
                <Badge variant="outline" className="text-[9px] font-mono text-blue-500 border-blue-500/30">
                  {data.cloudMonitoring.projectId}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span>Total Cloud Requests (24h):</span>
                <span className="font-bold text-foreground font-mono">{data.cloudMonitoring.totalRequests24h ?? 0}</span>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-muted/30 border border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-muted-foreground" />
                Google Cloud Monitoring
              </span>
              <a href="/admin/youtube" className="text-indigo-500 hover:underline font-medium">
                Connect via OAuth
              </a>
            </div>
          )}

          {/* Ping test result message if available */}
          {data?.pingResult && (
            <div
              className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                data.pingResult.success
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border border-destructive/20'
              }`}
            >
              {data.pingResult.success ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Verified live response: {data.pingResult.latencyMs}ms</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Error: {data.pingResult.error}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchMetrics(true)}
            disabled={testingPing || !data?.configured}
            className="text-xs h-7 gap-1.5 font-medium border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          >
            {testingPing ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                Ping Gemini API
              </>
            )}
          </Button>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            AI Studio <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
