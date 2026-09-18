'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Megaphone, Trash2, ImageDown, Plus, Camera, Aperture } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { captureDesktopWayback, uploadScreenshotToR2, addScaledImageToPdf } from '@/lib/screenshotHelper';

interface Campaign {
  id: number;
  name: string;
  valid_from: string;
  valid_to: string;
  show_in_articles: boolean;
  ads: { id: number; type: string; image_url: string; active: boolean }[];
}

export default function ScreenshotAdminPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Batch Proofs State
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentDay: '' });
  const [batchProofs, setBatchProofs] = useState<{ date: string; url: string }[]>([]);

  // Single Screenshot State
  const [singleScreenshotRunning, setSingleScreenshotRunning] = useState(false);
  const [singleScreenshotUrl, setSingleScreenshotUrl] = useState<string | null>(null);
  const [multiPagePdf, setMultiPagePdf] = useState(true);

  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const DESKTOP_W = 1280;
  const DESKTOP_H = 800;

  useEffect(() => {
    const update = () => {
      if (previewWrapperRef.current) {
        const w = previewWrapperRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    update();
    const t1 = setTimeout(update, 100);
    const t2 = setTimeout(update, 500);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setContainerWidth(w);
      }
    });

    if (previewWrapperRef.current) {
      observer.observe(previewWrapperRef.current);
    }

    window.addEventListener('resize', update);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [batchRunning]);

  const previewScale = containerWidth > 0 ? containerWidth / DESKTOP_W : 0.42;
  const scaledHeight = containerWidth > 0 ? Math.round(DESKTOP_H * previewScale) : 340;


  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/ads');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entire campaign and its ads?')) return;
    try {
      await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' });
      await fetchCampaigns();
    } catch (err) {
      alert('Failed to delete campaign');
    }
  };

  const captureScreenshot = async (url: string): Promise<{ url: string | null; dataUrl?: string; width?: number; height?: number }> => {
    try {
      // Primary: High-fidelity client-side html-to-image capture with asset waiting
      const result = await captureDesktopWayback(url);
      let cdnUrl: string | null = null;
      try {
        cdnUrl = await uploadScreenshotToR2(result.blob);
      } catch (uploadErr) {
        console.warn('R2 upload failed, proceeding with local dataUrl', uploadErr);
      }
      return {
        url: cdnUrl || result.dataUrl,
        dataUrl: result.dataUrl,
        width: result.width,
        height: result.height,
      };
    } catch (localErr) {
      console.error('Desktop screenshot capture failed:', localErr);
      return { url: null };
    }
  };

  const handleTakeSingleScreenshot = async () => {
    setSingleScreenshotRunning(true);
    setSingleScreenshotUrl(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://jharkhandexpress.com';
      const captured = await captureScreenshot(`${origin}/`);
      if (captured.url) {
        setSingleScreenshotUrl(captured.url);
      } else {
        alert('Failed to capture screenshot');
      }
    } catch (e) {
      alert('Error taking screenshot');
    }
    setSingleScreenshotRunning(false);
  };

  const runBatchScreenshotEngine = async (camp: Campaign) => {
    setBatchProofs([]);
    setBatchRunning(true);
    
    const fromTime = new Date(camp.valid_from).getTime();
    const toTime = new Date(camp.valid_to).getTime();
    
    // Calculate total days
    const days: Date[] = [];
    for (let t = fromTime; t <= toTime; t += 86400000) {
      days.push(new Date(t));
    }

    setBatchProgress({ current: 0, total: days.length, currentDay: '' });
    
    const newProofs: { date: string, url: string }[] = [];
    const pdf = new jsPDF('p', 'mm', 'a4');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://truth24x7.com';
    let isFirstPdfPage = true;

    for (let i = 0; i < days.length; i++) {
      const currentDay = days[i];
      // Random time between 6:00 PM and 11:00 PM (18:00 to 22:59)
      const hours = Math.floor(Math.random() * 5) + 18;
      const minutes = Math.floor(Math.random() * 60);
      const seconds = Math.floor(Math.random() * 60);
      
      // Construct local wall-clock string to avoid UTC offset shifting into AM
      const year = currentDay.getFullYear();
      const month = String(currentDay.getMonth() + 1).padStart(2, '0');
      const day = String(currentDay.getDate()).padStart(2, '0');
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');

      const simulatedTimeStr = `${year}-${month}-${day}T${hStr}:${mStr}:${sStr}`;
      setBatchProgress({ current: i + 1, total: days.length, currentDay: simulatedTimeStr });
      
      try {
        const baseUrl = `${origin}/wayback/${encodeURIComponent(simulatedTimeStr)}?campaign_id=${camp.id}&is_screenshot=1`;
        
        // 1. Capture Full-Length Homepage Proof
        const homeCapture = await captureScreenshot(baseUrl);
        if (homeCapture.url) {
          newProofs.push({ date: new Date(simulatedTimeStr).toLocaleString() + ' (Home)', url: homeCapture.url });
          if (homeCapture.dataUrl && homeCapture.width && homeCapture.height) {
            await addScaledImageToPdf(
              pdf,
              homeCapture.dataUrl,
              homeCapture.width,
              homeCapture.height,
              `Proof: ${new Date(simulatedTimeStr).toLocaleString()} - Homepage`,
              { fitToSinglePage: !multiPagePdf, isFirstPage: isFirstPdfPage, campaignName: camp.name }
            );
            isFirstPdfPage = false;
          }
        }

        // 2. Capture Full-Length Article Proof if campaign shows in articles
        if (camp.ads.some((a: any) => a.show_in_articles)) {
          try {
            const articleWaybackUrl = `${origin}/wayback/${encodeURIComponent(simulatedTimeStr)}/article?campaign_id=${camp.id}&is_screenshot=1`;
            const articleCapture = await captureScreenshot(articleWaybackUrl);
            if (articleCapture.url) {
              newProofs.push({ date: new Date(simulatedTimeStr).toLocaleString() + ' (Article)', url: articleCapture.url });
              if (articleCapture.dataUrl && articleCapture.width && articleCapture.height) {
                await addScaledImageToPdf(
                  pdf,
                  articleCapture.dataUrl,
                  articleCapture.width,
                  articleCapture.height,
                  `Proof: ${new Date(simulatedTimeStr).toLocaleString()} - Article View`,
                  { fitToSinglePage: !multiPagePdf, isFirstPage: isFirstPdfPage, campaignName: camp.name }
                );
                isFirstPdfPage = false;
              }
            }
          } catch(e) { console.error('Article screenshot failed', e); }
        }

        setBatchProofs([...newProofs]);
      } catch (err) {
        console.error('Batch capture failed for', simulatedTimeStr, err);
      }
    }
    
    pdf.save(`Campaign_Proof_${camp.name}.pdf`);
    setBatchRunning(false);
    alert('Batch Campaign Proofs successfully generated & PDF Downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'General Sans', sans-serif" }}>Ads Management & Campaigns</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Generate time-traveled proof of run reports for your active ad campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin"
            className="bg-secondary border border-border text-secondary-foreground px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Core
          </Link>
          <Link 
            href="/admin/ads/new"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ACTIVE CAMPAIGNS LIST */}
        <Card className="flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="border-b border-border mb-4 shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Megaphone className="w-4 h-4 text-emerald-500" />
              </div>
              Active Campaigns
            </CardTitle>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={multiPagePdf} 
                onChange={(e) => setMultiPagePdf(e.target.checked)} 
                className="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary accent-primary" 
              />
              <span>Full-Width Sliced PDF</span>
            </label>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {campaigns.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">No active campaigns running.</div>
            ) : (
              campaigns.map(camp => (
                <div key={camp.id} className="border border-border bg-muted/30 rounded-xl p-4 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-foreground text-sm">{camp.name}</h3>
                    <div className="flex gap-1">
                      <Link href={`/admin/ads/edit/${camp.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCampaign(camp.id)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mb-4 uppercase">
                    {new Date(camp.valid_from).toLocaleDateString()} — {new Date(camp.valid_to).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary" className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
                      {camp.ads.filter(a => a.type === 'leaderboard').length} LDBR
                    </Badge>
                    <Badge variant="secondary" className="text-cyan-500 font-bold uppercase tracking-widest text-[10px]">
                      {camp.ads.filter(a => a.type === 'rectangle').length} RECT
                    </Badge>
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => runBatchScreenshotEngine(camp)}
                    disabled={batchRunning}
                    className="w-full text-xs font-bold uppercase tracking-widest"
                  >
                    <ImageDown className="w-4 h-4 mr-2" /> GENERATE PROOFS
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: BATCH ENGINE OR LIVE CAPTURE */}
        <div className="flex flex-col gap-8">
          
          {batchRunning && (
            <Card className="flex flex-col h-[600px] overflow-hidden border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)]">
              <CardHeader className="border-b border-border bg-muted/50">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Batch Proof Engine Running
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Progress</span>
                    <span>{batchProgress.current} / {batchProgress.total} Days</span>
                  </div>
                  <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
                </div>
                
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Currently Simulating:</p>
                  <p className="text-lg font-mono font-bold text-foreground">
                    {batchProgress.currentDay ? new Date(batchProgress.currentDay).toLocaleString() : 'Initializing...'}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground max-w-sm text-center">
                  The engine is time-traveling your database, taking headless screenshots of the site logic, and stitching them into a PDF. Do not close this tab.
                </div>
              </CardContent>
            </Card>
          )}

          {!batchRunning && (
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b border-border bg-muted/20">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Aperture className="w-4 h-4 text-blue-500" />
                  </div>
                  Live Capture Studio
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-4">
                {/* Desktop Preview Frame */}
                <div
                  ref={previewWrapperRef}
                  className="relative w-full rounded-xl border border-border bg-muted/30 overflow-hidden shadow-xs"
                  style={{ height: `${scaledHeight}px` }}
                >
                  <div
                    style={{
                      width: `${DESKTOP_W}px`,
                      height: `${DESKTOP_H}px`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                    }}
                  >
                    <iframe
                      src="/"
                      title="Desktop Live Preview"
                      style={{
                        display: 'block',
                        width: `${DESKTOP_W}px`,
                        height: `${DESKTOP_H}px`,
                        border: 'none',
                      }}
                    />
                  </div>
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur border border-border text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-xs z-10 pointer-events-none flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    🖥 Desktop Preview (1280px)
                  </div>
                </div>
                
                {/* Controls */}
                <div className="space-y-3">
                  {singleScreenshotUrl ? (
                    <div className="p-4 bg-muted/50 rounded-xl border border-border flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">Snapshot Ready</span>
                        <span className="text-xs text-muted-foreground font-mono">{new Date().toLocaleString()}</span>
                      </div>
                      <a href={singleScreenshotUrl} target="_blank" rel="noreferrer">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-widest uppercase">
                          Open Full Resolution
                        </Button>
                      </a>
                      <Button variant="ghost" className="w-full text-xs" onClick={() => setSingleScreenshotUrl(null)}>Take Another</Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleTakeSingleScreenshot}
                      disabled={singleScreenshotRunning}
                      className="w-full bg-primary text-primary-foreground py-6 text-sm font-black uppercase tracking-widest hover:bg-primary/90"
                    >
                      {singleScreenshotRunning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Camera className="w-5 h-5 mr-2" />} CAPTURE LIVE HOMEPAGE
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
