"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Calendar, 
  Clock, 
  Monitor, 
  Smartphone, 
  Tablet, 
  FileText, 
  Home, 
  Tag, 
  Info,
  Sparkles
} from 'lucide-react';

export default function AdminWaybackPage() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowTimeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

  // Date and Time states
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>(nowTimeStr);
  const [useCurrentTime, setUseCurrentTime] = useState<boolean>(true);

  // Target view
  const [targetView, setTargetView] = useState<'home' | 'latest-article' | 'specific-article'>('home');
  const [customArticleSlug, setCustomArticleSlug] = useState<string>('');

  // Ad campaign injection (optional)
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  // Preview & copy states
  const [copied, setCopied] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Load campaigns on mount
  useEffect(() => {
    fetch('/api/admin/ads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCampaigns(data);
        }
      })
      .catch(err => console.error('Failed to load campaigns:', err));
  }, []);

  // Quick date presets
  const applyDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Quick time presets
  const applyTimePreset = (time: string, isNow: boolean = false) => {
    setSelectedTime(time);
    setUseCurrentTime(isNow);
  };

  // Build the target Wayback URL
  const buildWaybackUrl = (relative: boolean = false) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jharkhandexpress.com';
    const baseDate = selectedDate || todayStr;

    let path = '';
    if (targetView === 'home') {
      path = `/wayback/${baseDate}`;
    } else if (targetView === 'latest-article') {
      path = `/wayback/${baseDate}/article`;
    } else {
      const cleanSlug = customArticleSlug.trim() || 'sample-article';
      path = `/wayback/${baseDate}/article/${encodeURIComponent(cleanSlug)}`;
    }

    const params = new URLSearchParams();
    if (!useCurrentTime && selectedTime) {
      params.set('time', selectedTime);
    }
    if (selectedCampaignId) {
      params.set('campaign_id', selectedCampaignId);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return relative ? `${path}${queryString}` : `${origin}${path}${queryString}`;
  };

  const waybackUrl = buildWaybackUrl(false);
  const relativeUrl = buildWaybackUrl(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(waybackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 gap-1.5 font-mono text-xs">
              <History className="w-3.5 h-3.5" />
              Time Machine Simulation
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Wayback Machine</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Simulate and inspect how Jharkhand Express appeared at any exact date and time in history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button asChild className="gap-2 bg-primary text-primary-foreground font-semibold">
            <a href={relativeUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              Launch in New Tab
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Date & Time Selection */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Target Date & Time
              </CardTitle>
              <CardDescription>
                Choose an exact point in time to reconstruct the site.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Calendar Date</span>
                  <span className="font-mono text-[11px] text-muted-foreground/80">{selectedDate}</span>
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="font-mono text-sm"
                />
                
                {/* Date Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button variant="secondary" size="xs" onClick={() => applyDateOffset(1)} className="text-xs h-7">
                    Yesterday
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => applyDateOffset(7)} className="text-xs h-7">
                    7 Days Ago
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => applyDateOffset(30)} className="text-xs h-7">
                    30 Days Ago
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => applyDateOffset(180)} className="text-xs h-7">
                    6 Months Ago
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => applyDateOffset(365)} className="text-xs h-7">
                    1 Year Ago
                  </Button>
                </div>
              </div>

              {/* Time Input */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Exact Time (HH:MM:SS)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useCurrentTime}
                      onChange={(e) => setUseCurrentTime(e.target.checked)}
                      className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="text-muted-foreground">Now's Time-of-Day</span>
                  </label>
                </div>

                <Input
                  type="time"
                  step="1"
                  disabled={useCurrentTime}
                  value={selectedTime}
                  onChange={(e) => {
                    setSelectedTime(e.target.value);
                    setUseCurrentTime(false);
                  }}
                  className={`font-mono text-sm ${useCurrentTime ? 'opacity-50' : ''}`}
                />

                {/* Time Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button 
                    variant={useCurrentTime ? "default" : "secondary"} 
                    size="xs" 
                    onClick={() => applyTimePreset(nowTimeStr, true)}
                    className="text-xs h-7"
                  >
                    Current Time (Now)
                  </Button>
                  <Button 
                    variant={!useCurrentTime && selectedTime.startsWith('09:00') ? "default" : "secondary"} 
                    size="xs" 
                    onClick={() => applyTimePreset('09:00:00', false)}
                    className="text-xs h-7"
                  >
                    Morning (09:00 AM)
                  </Button>
                  <Button 
                    variant={!useCurrentTime && selectedTime.startsWith('14:30') ? "default" : "secondary"} 
                    size="xs" 
                    onClick={() => applyTimePreset('14:30:00', false)}
                    className="text-xs h-7"
                  >
                    Afternoon (02:30 PM)
                  </Button>
                  <Button 
                    variant={!useCurrentTime && selectedTime.startsWith('20:00') ? "default" : "secondary"} 
                    size="xs" 
                    onClick={() => applyTimePreset('20:00:00', false)}
                    className="text-xs h-7"
                  >
                    Prime (08:00 PM)
                  </Button>
                  <Button 
                    variant={!useCurrentTime && selectedTime.startsWith('23:59') ? "default" : "secondary"} 
                    size="xs" 
                    onClick={() => applyTimePreset('23:59:59', false)}
                    className="text-xs h-7"
                  >
                    End of Day (11:59 PM)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Destination & Options */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                Target View
              </CardTitle>
              <CardDescription>
                Choose which page of Jharkhand Express you want to simulate.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={targetView === 'home' ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-2.5 px-2 text-xs font-medium"
                  onClick={() => setTargetView('home')}
                >
                  <Home className="w-4 h-4 mb-1" />
                  Homepage
                </Button>
                <Button
                  type="button"
                  variant={targetView === 'latest-article' ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-2.5 px-2 text-xs font-medium"
                  onClick={() => setTargetView('latest-article')}
                >
                  <Sparkles className="w-4 h-4 mb-1" />
                  Latest Article
                </Button>
                <Button
                  type="button"
                  variant={targetView === 'specific-article' ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-2.5 px-2 text-xs font-medium"
                  onClick={() => setTargetView('specific-article')}
                >
                  <FileText className="w-4 h-4 mb-1" />
                  Specific Slug
                </Button>
              </div>

              {targetView === 'specific-article' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Article Slug or ID
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. pm-modi-addresses-nation-2024"
                    value={customArticleSlug}
                    onChange={(e) => setCustomArticleSlug(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {/* Optional Ad Campaign Injection */}
              {campaigns.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Inject Ad Campaign (Optional)</span>
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">None (Auto-match scheduled campaigns)</option>
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.name} (#{camp.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Generated URL Display */}
          <Card className="border-border bg-muted/30">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Generated Wayback URL</span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {useCurrentTime ? 'Time: Dynamic Now' : 'Time: Exact'}
                </Badge>
              </div>
              <div className="p-3 bg-background border border-border rounded-lg font-mono text-xs break-all select-all text-primary">
                {waybackUrl}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 gap-1.5 text-xs">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy URL'}
                </Button>
                <Button size="sm" asChild className="flex-1 gap-1.5 text-xs">
                  <a href={relativeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Live
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Guide Card */}
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-500">
              <Info className="w-4 h-4" />
              How Wayback Simulation Works
            </div>
            <p>
              • <strong>Articles</strong>: Queries only news published <em>on or before</em> the chosen date & exact time.
            </p>
            <p>
              • <strong>Seamless Reading</strong>: Clicking articles inside the Wayback simulation opens them at <code>/wayback/[date]/article/[slug]</code> with all related and sidebar articles preserved from that era without leaking into live news.
            </p>
            <p>
              • <strong>Ad Campaigns</strong>: Automatically serves ads scheduled for that exact historical time window.
            </p>
          </div>
        </div>

        {/* Live Simulation Preview Column */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <Card className="flex-1 flex flex-col border-border overflow-hidden shadow-sm min-h-[700px]">
            <CardHeader className="py-3 px-4 border-b border-border flex flex-row items-center justify-between space-y-0 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                </div>
                <span className="text-xs font-mono font-medium text-muted-foreground truncate max-w-[280px] sm:max-w-md">
                  {relativeUrl}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Device switches */}
                <div className="hidden sm:flex items-center bg-muted p-1 rounded-lg gap-1 border border-border/50">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded text-xs transition-colors ${previewDevice === 'desktop' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Desktop (100%)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-1.5 rounded text-xs transition-colors ${previewDevice === 'tablet' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Tablet (768px)"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded text-xs transition-colors ${previewDevice === 'mobile' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Mobile (375px)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIframeKey(k => k + 1)}
                  title="Reload Preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardHeader>

            <div className="flex-1 bg-zinc-950/20 p-4 flex justify-center items-stretch overflow-auto">
              <div 
                className="transition-all duration-300 bg-background border border-border/70 rounded-lg overflow-hidden shadow-md flex flex-col"
                style={{
                  width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px',
                  minHeight: '650px',
                }}
              >
                <iframe
                  key={iframeKey}
                  src={relativeUrl}
                  className="w-full flex-1 border-0"
                  title="Wayback Machine Live Preview"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
