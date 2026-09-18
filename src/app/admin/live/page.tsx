'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, RefreshCcw, Settings, CheckCircle2, XCircle, Database, Rss, Globe } from 'lucide-react';

export default function LiveUpdatesDashboard() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rss-timeline');
      const data = await res.json();
      if (data.timeline) setTimeline(data.timeline);
      if (data.report) setReport(data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/rss-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        fetchTimeline(); // refresh timeline from cache
      } else {
        alert('Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error during sync');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-2 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'General Sans', sans-serif" }}>Live Feed Aggregator</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Real-time intelligence gathered across all active network sources.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/live/settings"
            className="bg-secondary border border-border text-secondary-foreground px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors shadow-sm shrink-0"
          >
            <Settings className="w-5 h-5" />
            Manage Sources
          </Link>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 shrink-0"
          >
            <RefreshCcw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Network...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted border border-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Database className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Total Articles</span>
            </div>
            <div className="text-3xl font-black text-foreground" style={{ fontFamily: "'General Sans', sans-serif" }}>
              {report.totalScanned?.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-muted border border-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Active Feeds</span>
            </div>
            <div className="text-3xl font-black text-foreground" style={{ fontFamily: "'General Sans', sans-serif" }}>
              {report.activeSources}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Successful Parses</span>
            </div>
            <div className="text-3xl font-black text-green-400" style={{ fontFamily: "'General Sans', sans-serif" }}>
              {report.successfulCount}
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Failed Endpoints</span>
            </div>
            <div className="text-3xl font-black text-red-400" style={{ fontFamily: "'General Sans', sans-serif" }}>
              {report.failedCount}
            </div>
          </div>
        </div>
      )}

      {/* Diagnostics Report (If any failures) */}
      {report?.failedCount > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 space-y-3">
          <h3 className="text-destructive font-bold flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Sync Diagnostics: Failed Sources
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {report.failedSources.map((failed: any, i: number) => (
              <li key={i} className="text-sm bg-background/40 border border-destructive/20 px-3 py-2 rounded-lg flex flex-col gap-1">
                <Link 
                  href={`/admin/live/settings?edit_name=${encodeURIComponent(failed.name)}`}
                  className="font-semibold text-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1 w-fit"
                >
                  {failed.name} <Settings className="w-3 h-3" />
                </Link>
                <span className="text-destructive text-xs font-mono text-wrap">{failed.error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Aggregated Timeline */}
      <div className="bg-muted border border-border rounded-xl overflow-hidden">
        <div className="bg-card p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground flex items-center gap-2" style={{ fontFamily: "'General Sans', sans-serif" }}>
            <Activity className="w-5 h-5 text-primary" /> Live Network Stream
          </h2>
          {report?.timestamp && (
            <span className="text-xs text-muted-foreground font-mono">Last Synced: {new Date(report.timestamp).toLocaleString()}</span>
          )}
        </div>
        
        <div className="p-4 md:p-6">
          {loading || isSyncing ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
              <p className="font-medium">
                {isSyncing 
                  ? `Fetching from ${report?.activeSources ? (report.activeSources - 1) + '+' : 'multiple'} endpoints across the network. Please wait...` 
                  : 'Loading cached timeline from Redis...'}
              </p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-border rounded-xl text-muted-foreground font-medium bg-card">
              No articles found. Click "Sync Now" to fetch live data from the network.
            </div>
          ) : (
            <div className="space-y-6">
              {timeline.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 group">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border p-1.5 flex items-center justify-center shrink-0 z-10 group-hover:border-primary/50 transition-colors">
                      {item.favicon_url ? (
                        <img src={item.favicon_url} alt="" className="w-full h-full object-contain rounded-md" />
                      ) : (
                        <Rss className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    {i !== timeline.length - 1 && <div className="w-px h-full bg-border my-2 group-hover:bg-primary/20 transition-colors" />}
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 pb-6">
                    <div className="bg-background border border-border rounded-xl p-5 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-foreground bg-secondary px-2.5 py-1 rounded-md border border-border">
                          {item.source_name}
                        </span>
                        {item.category && (
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                            {item.category}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground font-mono ml-auto">
                          {new Date(item.pubDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      
                      <a href={item.link} target="_blank" rel="noreferrer" className="block text-xl font-bold text-foreground hover:text-primary transition-colors mb-3 leading-snug" style={{ fontFamily: "'General Sans', sans-serif" }}>
                        {item.title}
                      </a>
                      
                      <div 
                        className="text-sm text-muted-foreground line-clamp-3 prose dark:prose-invert prose-sm max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.contentSnippet }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
