'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Camera, 
  Loader2, 
  Plus, 
  Upload, 
  Trash2, 
  AlertTriangle, 
  XCircle, 
  CheckCircle,
  Info,
  Monitor,
  Layers
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import AdCropModal, { CropQueueItem } from '@/components/admin/AdCropModal';

interface AdAsset {
  id?: number;
  type: 'leaderboard' | 'rectangle';
  image_url: string;
  target_url?: string;
  show_in_articles?: boolean;
  show_on_homepage?: boolean;
}

const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

interface Campaign {
  id: number;
  name: string;
  valid_from: string;
  valid_to: string;
  show_in_articles: boolean;
  ads: { id: number; type: string; image_url: string; target_url?: string; active: boolean; show_on_homepage?: boolean; show_in_articles?: boolean }[];
}

interface ModalNotice {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const campaignId = resolvedParams.id;
  const [uploadingAd, setUploadingAd] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingCampaign, setSavingCampaign] = useState(false);
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  
  // Campaign Builder State
  const [newCampName, setNewCampName] = useState('');
  const [newCampFrom, setNewCampFrom] = useState(new Date().toISOString().split('T')[0]);
  const [newCampTo, setNewCampTo] = useState('');
  const [pendingAds, setPendingAds] = useState<AdAsset[]>([]);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rectangle'>('leaderboard');
  
  // Capacity Engine State
  const [capacityStatus, setCapacityStatus] = useState<'ok' | 'warning' | 'error'>('ok');
  const [capacityMessage, setCapacityMessage] = useState('');
  const [modalNotice, setModalNotice] = useState<ModalNotice | null>(null);

  // Aspect Ratio Cropping Queue State
  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);

  useEffect(() => {
    fetch('/api/admin/ads')
      .then(res => res.json())
      .then(data => {
        const camps = data.campaigns || [];
        setCampaigns(camps);
        
        // Find current campaign
        const currentCamp = camps.find((c: any) => c.id.toString() === campaignId);
        if (currentCamp) {
          setNewCampName(currentCamp.name);
          setNewCampFrom(currentCamp.valid_from.split('T')[0]);
          setNewCampTo(currentCamp.valid_to.split('T')[0]);
          setPendingAds(currentCamp.ads || []);
        }
      })
      .catch(console.error);
  }, [campaignId]);

  // Calculate Capacity
  useEffect(() => {
    if (!newCampFrom || !newCampTo) {
      setCapacityStatus('ok');
      setCapacityMessage('');
      return;
    }

    const fromTime = new Date(newCampFrom).getTime();
    const toTime = new Date(newCampTo).getTime();
    if (toTime < fromTime) {
      setCapacityStatus('error');
      setCapacityMessage('End Date cannot be before Start Date.');
      return;
    }

    let maxDailyAds = 0;
    let peakDate = '';

    for (let t = fromTime; t <= toTime; t += 86400000) {
      const currentDay = new Date(t);
      let activeCount = pendingAds.length;
      
      campaigns.forEach(camp => {
        if (camp.id.toString() === campaignId) return;
        const cFrom = new Date(camp.valid_from).getTime();
        const cTo = new Date(camp.valid_to).getTime();
        if (t >= cFrom && t <= cTo) {
          activeCount += camp.ads.length;
        }
      });

      if (activeCount > maxDailyAds) {
        maxDailyAds = activeCount;
        peakDate = currentDay.toLocaleDateString();
      }
    }

    if (maxDailyAds > 24) {
      setCapacityStatus('error');
      setCapacityMessage(`CAPACITY EXCEEDED! Peak load is ${maxDailyAds} ads on ${peakDate}. Maximum allowed is 24.`);
    } else if (maxDailyAds >= 20) {
      setCapacityStatus('warning');
      setCapacityMessage(`HIGH CAPACITY: Peak load is ${maxDailyAds} ads on ${peakDate}. Only ${24 - maxDailyAds} slots left.`);
    } else {
      setCapacityStatus('ok');
      setCapacityMessage(`Capacity OK. Peak load: ${maxDailyAds}/24 ads.`);
    }
  }, [newCampFrom, newCampTo, pendingAds, campaigns, campaignId]);

  const uploadFileToServer = async (file: File, type: 'leaderboard' | 'rectangle'): Promise<AdAsset> => {
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/admin/ads/upload', { method: 'POST', body: formData });
    const uploadData = await uploadRes.json();
    
    if (!uploadRes.ok || !uploadData.success) {
      throw new Error(uploadData.error || 'Failed to upload ad asset');
    }
    
    return {
      type,
      image_url: uploadData.url,
      target_url: '',
      show_in_articles: false,
      show_on_homepage: true
    };
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    e.target.value = '';
    
    const targetConfig = activeTab === 'leaderboard' 
      ? { ratio: 728 / 90, width: 728, height: 90, name: 'Leaderboard (728×90)' }
      : { ratio: 300 / 250, width: 300, height: 250, name: 'Rectangle (300×250)' };

    const directUploads: File[] = [];
    const queueForCropping: CropQueueItem[] = [];

    for (const file of filesArray) {
      if (file.type.startsWith('image/') && !file.type.includes('gif')) {
        try {
          const imgUrl = URL.createObjectURL(file);
          const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = imgUrl;
          });

          const actualRatio = width / height;
          const ratioDiff = Math.abs(actualRatio - targetConfig.ratio) / targetConfig.ratio;

          if (ratioDiff > 0.08) {
            queueForCropping.push({
              file,
              type: activeTab,
              imageUrl: imgUrl,
              width,
              height,
              actualRatio,
              targetRatio: targetConfig.ratio,
              targetWidth: targetConfig.width,
              targetHeight: targetConfig.height,
              targetName: targetConfig.name
            });
          } else {
            directUploads.push(file);
          }
        } catch (err) {
          directUploads.push(file);
        }
      } else {
        directUploads.push(file);
      }
    }

    if (queueForCropping.length > 0) {
      setCropQueue(prev => [...prev, ...queueForCropping]);
    }

    if (directUploads.length > 0) {
      await processDirectUploads(directUploads);
    }
  };

  const processDirectUploads = async (files: File[]) => {
    setUploadingAd(true);
    setUploadProgress(0);
    try {
      const newAds: AdAsset[] = [];
      for (let i = 0; i < files.length; i++) {
        const ad = await uploadFileToServer(files[i], activeTab);
        newAds.push(ad);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setPendingAds(prev => [...prev, ...newAds]);
    } catch (err: any) {
      setModalNotice({
        title: 'Upload Failed',
        message: err.message || 'Error uploading ad asset to server.',
        type: 'error'
      });
    } finally {
      setUploadingAd(false);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    const currentItem = cropQueue[0];
    if (!currentItem) return;

    setCropQueue(prev => prev.slice(1));
    setUploadingAd(true);
    try {
      const ad = await uploadFileToServer(croppedFile, currentItem.type);
      setPendingAds(prev => [...prev, ad]);
    } catch (err: any) {
      setModalNotice({
        title: 'Upload Failed',
        message: err.message || 'Error uploading cropped ad asset.',
        type: 'error'
      });
    } finally {
      setUploadingAd(false);
    }
  };

  const handleSkipCrop = async () => {
    const currentItem = cropQueue[0];
    if (!currentItem) return;

    setCropQueue(prev => prev.slice(1));
    setUploadingAd(true);
    try {
      const ad = await uploadFileToServer(currentItem.file, currentItem.type);
      setPendingAds(prev => [...prev, ad]);
    } catch (err: any) {
      setModalNotice({
        title: 'Upload Failed',
        message: err.message || 'Error uploading ad asset.',
        type: 'error'
      });
    } finally {
      setUploadingAd(false);
    }
  };

  const handleCancelCrop = () => {
    setCropQueue(prev => prev.slice(1));
  };

  const removePendingAd = (index: number) => {
    setPendingAds(pendingAds.filter((_, i) => i !== index));
  };

  const handleLaunchCampaign = async () => {
    if (!newCampName.trim() || !newCampFrom || !newCampTo) {
      setModalNotice({
        title: 'Missing Required Information',
        message: 'Please provide a Campaign Name, Start Date, and End Date.',
        type: 'warning'
      });
      return;
    }

    if (new Date(newCampTo).getTime() < new Date(newCampFrom).getTime()) {
      setModalNotice({
        title: 'Invalid Date Range',
        message: 'Campaign End Date cannot precede the Start Date.',
        type: 'warning'
      });
      return;
    }

    if (pendingAds.length === 0) {
      setModalNotice({
        title: 'No Ad Assets Attached',
        message: 'Please attach at least one Leaderboard or Rectangle ad asset.',
        type: 'warning'
      });
      return;
    }

    if (capacityStatus === 'error') {
      setModalNotice({
        title: 'Capacity Exceeded',
        message: capacityMessage || 'Cannot update campaign. Date capacity exceeded.',
        type: 'error'
      });
      return;
    }

    setSavingCampaign(true);
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(campaignId, 10),
          name: newCampName.trim(),
          valid_from: new Date(newCampFrom).toISOString(),
          valid_to: new Date(newCampTo).toISOString(),
          ads: pendingAds
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server failed to update campaign');
      }
      
      router.push('/admin/ads');
    } catch (err: any) {
      setModalNotice({
        title: 'Failed to Update Campaign',
        message: err.message || 'Error updating campaign in database.',
        type: 'error'
      });
    } finally {
      setSavingCampaign(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 sm:pb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'General Sans', sans-serif" }}>
            Edit Campaign
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm font-medium">
            Update ad pools and configurations for Campaign #{campaignId}.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link 
            href="/admin/ads"
            className="w-full sm:w-auto justify-center bg-secondary border border-border text-secondary-foreground px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors shadow-xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      {/* Specifications & Ad Types Guide Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3.5 text-emerald-600 dark:text-emerald-400">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider">
            Supported Ad Formats & Dimension Specifications
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-background/80 backdrop-blur rounded-xl p-3.5 sm:p-4 border border-border">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
              <span className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-emerald-500 shrink-0" />
                Leaderboard Banner
              </span>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                728 × 90 px (8.09:1)
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Standard horizontal banner. Placed across Homepage news sections (Slots 1–6) and distributed between paragraphs inside news articles.
            </p>
            <div className="text-[10px] sm:text-[11px] space-y-1 font-mono text-muted-foreground border-t border-border pt-2.5">
              <div><strong className="text-foreground">Retina 2x:</strong> 1456 × 180 px</div>
              <div><strong className="text-foreground">Supported:</strong> JPG, PNG, WEBP, GIF, MP4, WEBM (Max 5MB img / 20MB vid)</div>
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur rounded-xl p-3.5 sm:p-4 border border-border">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
              <span className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-500 shrink-0" />
                Medium Rectangle
              </span>
              <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                300 × 250 px (1.20:1)
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Compact sidebar banner. Placed in Desktop Right Sidebar across Homepage (Slots 1–6), Article Sidebar, and mid-story fallbacks.
            </p>
            <div className="text-[10px] sm:text-[11px] space-y-1 font-mono text-muted-foreground border-t border-border pt-2.5">
              <div><strong className="text-foreground">Retina 2x:</strong> 600 × 500 px</div>
              <div><strong className="text-foreground">Supported:</strong> JPG, PNG, WEBP, GIF, MP4, WEBM (Supports Video Ads)</div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
              <Plus className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Campaign Meta</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Campaign Name</Label>
              <Input 
                type="text" 
                value={newCampName}
                onChange={e => setNewCampName(e.target.value)}
                placeholder="e.g. Q3 Startup Funding"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Run From</Label>
              <Input 
                type="date" 
                value={newCampFrom}
                onChange={e => setNewCampFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Run To</Label>
              <Input 
                type="date" 
                value={newCampTo}
                onChange={e => setNewCampTo(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-8">
            {capacityStatus === 'ok' && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4 stroke-current" />
                <AlertTitle className="text-xs font-bold uppercase tracking-widest">Capacity Intelligence Network</AlertTitle>
                <AlertDescription>{capacityMessage || 'Capacity OK.'}</AlertDescription>
              </Alert>
            )}
            {capacityStatus === 'warning' && (
              <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-4 w-4 stroke-current" />
                <AlertTitle className="text-xs font-bold uppercase tracking-widest">Capacity Intelligence Network</AlertTitle>
                <AlertDescription>{capacityMessage}</AlertDescription>
              </Alert>
            )}
            {capacityStatus === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-bold uppercase tracking-widest">Capacity Intelligence Network</AlertTitle>
                <AlertDescription>{capacityMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-muted/30 border border-border rounded-xl p-3.5 sm:p-6 mb-6 sm:mb-8">
            <Tabs defaultValue="leaderboard" value={activeTab} onValueChange={(val) => setActiveTab(val as 'leaderboard' | 'rectangle')}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attach Campaign Assets</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Images are automatically checked for the recommended aspect ratio and can be cropped to fit.
                  </p>
                </div>
                <TabsList className="w-full grid grid-cols-2 h-auto p-1 bg-muted rounded-xl sm:w-auto sm:flex sm:h-10">
                  <TabsTrigger value="leaderboard" className="py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center">
                    Leaderboards (728×90)
                  </TabsTrigger>
                  <TabsTrigger value="rectangle" className="py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center">
                    Rectangles (300×250)
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* LEADERBOARDS TAB */}
              <TabsContent value="leaderboard" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pendingAds.filter(a => a.type === 'leaderboard').map((ad, i) => (
                    <div key={i} className="relative group bg-muted border border-border rounded-xl overflow-hidden flex flex-col p-3 shadow-sm">
                      <div className="relative w-full aspect-[728/90] bg-black/40 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                        {isVideo(ad.image_url) ? (
                          <video src={ad.image_url} autoPlay muted loop className="w-full h-full object-contain" />
                        ) : (
                          <img src={ad.image_url} alt="Ad Asset" className="w-full h-full object-contain" />
                        )}
                        <Button 
                          variant="destructive"
                          size="icon"
                          onClick={() => removePendingAd(pendingAds.indexOf(ad))}
                          className="absolute top-1 right-1 h-6 w-6 opacity-80 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Optional Target Link */}
                      <div className="space-y-1.5 mb-3">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Target URL (Click Destination)
                        </Label>
                        <Input
                          type="url"
                          placeholder="https://client-website.com"
                          value={ad.target_url || ''}
                          onChange={(e) => {
                            const newAds = [...pendingAds];
                            newAds[pendingAds.indexOf(ad)].target_url = e.target.value;
                            setPendingAds(newAds);
                          }}
                          className="h-8 text-xs font-mono"
                        />
                      </div>

                      {/* Placements checkboxes */}
                      <div className="bg-background/90 p-2 rounded-lg flex items-center justify-around border border-border mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            id={`edit-home-lead-${i}`}
                            className="h-3.5 w-3.5"
                            checked={ad.show_on_homepage !== false}
                            onCheckedChange={(checked) => {
                              const newAds = [...pendingAds];
                              newAds[pendingAds.indexOf(ad)].show_on_homepage = !!checked;
                              setPendingAds(newAds);
                            }}
                          />
                          <Label htmlFor={`edit-home-lead-${i}`} className="text-[10px] font-bold uppercase cursor-pointer">
                            Homepage
                          </Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            id={`edit-art-lead-${i}`}
                            className="h-3.5 w-3.5"
                            checked={ad.show_in_articles}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const activeGlobal = campaigns.reduce((acc, camp) => {
                                  if (camp.id.toString() === campaignId) return acc;
                                  if (new Date(camp.valid_to).getTime() < Date.now()) return acc;
                                  return acc + camp.ads.filter(a => a.type === 'leaderboard' && a.show_in_articles).length;
                                }, 0);
                                const currentSelected = pendingAds.filter(a => a.type === 'leaderboard' && a.show_in_articles).length;
                                if (activeGlobal + currentSelected >= 6) {
                                  setModalNotice({
                                    title: 'Article Ad Limit (6 Max)',
                                    message: `You cannot activate more than 6 article ads globally.\n\nActive in other campaigns: ${activeGlobal}\nProposed for this campaign: ${currentSelected + 1}`,
                                    type: 'warning'
                                  });
                                  return;
                                }
                              }
                              const newAds = [...pendingAds];
                              newAds[pendingAds.indexOf(ad)].show_in_articles = !!checked;
                              setPendingAds(newAds);
                            }}
                          />
                          <Label htmlFor={`edit-art-lead-${i}`} className="text-[10px] font-bold uppercase cursor-pointer">
                            Article Body
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload Leaderboard Card */}
                  <div className="relative border-2 border-dashed border-border hover:border-emerald-500 rounded-xl min-h-[160px] flex flex-col items-center justify-center cursor-pointer transition-colors group p-4 text-center">
                    <input 
                      type="file" 
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      multiple
                      onChange={handleAssetUpload}
                      disabled={uploadingAd || capacityStatus === 'error'}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {uploadingAd ? (
                      <div className="w-full px-4 flex flex-col items-center">
                        <Progress value={uploadProgress} className="w-full mb-2 h-2" />
                        <span className="text-xs font-bold text-emerald-500">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500 mb-2 transition-colors" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                          Upload Leaderboard
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                          728 × 90 px (8.09:1 Ratio)
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          JPG, PNG, WEBP, GIF, MP4, WEBM
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* RECTANGLES TAB */}
              <TabsContent value="rectangle" className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pendingAds.filter(a => a.type === 'rectangle').map((ad, i) => (
                    <div key={i} className="relative group bg-muted border border-border rounded-xl overflow-hidden flex flex-col p-3 shadow-sm">
                      <div className="relative w-full aspect-[300/250] bg-black/40 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                        {isVideo(ad.image_url) ? (
                          <video src={ad.image_url} autoPlay muted loop className="w-full h-full object-contain" />
                        ) : (
                          <img src={ad.image_url} alt="Ad Asset" className="w-full h-full object-contain" />
                        )}
                        <Button 
                          variant="destructive"
                          size="icon"
                          onClick={() => removePendingAd(pendingAds.indexOf(ad))}
                          className="absolute top-1 right-1 h-6 w-6 opacity-80 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Optional Target Link */}
                      <div className="space-y-1.5 mb-3">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Target URL (Click Destination)
                        </Label>
                        <Input
                          type="url"
                          placeholder="https://client-website.com"
                          value={ad.target_url || ''}
                          onChange={(e) => {
                            const newAds = [...pendingAds];
                            newAds[pendingAds.indexOf(ad)].target_url = e.target.value;
                            setPendingAds(newAds);
                          }}
                          className="h-8 text-xs font-mono"
                        />
                      </div>

                      {/* Placements checkboxes */}
                      <div className="bg-background/90 p-2 rounded-lg flex items-center justify-around border border-border mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            id={`edit-home-rect-${i}`}
                            className="h-3.5 w-3.5"
                            checked={ad.show_on_homepage !== false}
                            onCheckedChange={(checked) => {
                              if (checked && isVideo(ad.image_url)) {
                                const activeGlobalVideo = campaigns.reduce((acc, camp) => {
                                  if (camp.id.toString() === campaignId) return acc;
                                  if (new Date(camp.valid_to).getTime() < Date.now()) return acc;
                                  return acc + camp.ads.filter(a => a.type === 'rectangle' && isVideo(a.image_url) && a.show_on_homepage !== false).length;
                                }, 0);
                                const currentSelectedVideo = pendingAds.filter(a => a.type === 'rectangle' && isVideo(a.image_url) && a.show_on_homepage !== false).length;
                                if (activeGlobalVideo + currentSelectedVideo >= 6) {
                                  setModalNotice({
                                    title: 'Video Ad Limit (6 Max)',
                                    message: `You cannot activate more than 6 rectangle video ads globally on the homepage.\n\nActive in other campaigns: ${activeGlobalVideo}\nProposed for this campaign: ${currentSelectedVideo + 1}`,
                                    type: 'warning'
                                  });
                                  return;
                                }
                              }
                              const newAds = [...pendingAds];
                              newAds[pendingAds.indexOf(ad)].show_on_homepage = !!checked;
                              setPendingAds(newAds);
                            }}
                          />
                          <Label htmlFor={`edit-home-rect-${i}`} className="text-[10px] font-bold uppercase cursor-pointer">
                            Homepage
                          </Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            id={`edit-art-rect-${i}`}
                            className="h-3.5 w-3.5"
                            checked={ad.show_in_articles}
                            onCheckedChange={(checked) => {
                              const newAds = [...pendingAds];
                              newAds[pendingAds.indexOf(ad)].show_in_articles = !!checked;
                              setPendingAds(newAds);
                            }}
                          />
                          <Label htmlFor={`edit-art-rect-${i}`} className="text-[10px] font-bold uppercase cursor-pointer">
                            Article Sidebar
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload Rectangle Card */}
                  <div className="relative border-2 border-dashed border-border hover:border-emerald-500 rounded-xl min-h-[160px] flex flex-col items-center justify-center cursor-pointer transition-colors group p-4 text-center">
                    <input 
                      type="file" 
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      multiple
                      onChange={handleAssetUpload}
                      disabled={uploadingAd || capacityStatus === 'error'}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {uploadingAd ? (
                      <div className="w-full px-4 flex flex-col items-center">
                        <Progress value={uploadProgress} className="w-full mb-2 h-2" />
                        <span className="text-xs font-bold text-emerald-500">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500 mb-2 transition-colors" />
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider mb-1">
                          Upload Rectangle
                        </span>
                        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold mb-1">
                          300 × 250 px (1.20:1 Ratio)
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          JPG, PNG, WEBP, GIF, MP4, WEBM
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Button 
            onClick={handleLaunchCampaign}
            disabled={savingCampaign || capacityStatus === 'error'}
            className="w-full bg-primary text-primary-foreground py-4 sm:py-6 text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-primary/90 shadow-md transition-all min-h-[48px]"
          >
            {savingCampaign ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Camera className="w-5 h-5 mr-2" />} 
            UPDATE CAMPAIGN IN DATABASE
          </Button>
        </CardContent>
      </Card>

      {/* Aspect Ratio Cropper Modal */}
      <AdCropModal
        item={cropQueue.length > 0 ? cropQueue[0] : null}
        onCropComplete={handleCropComplete}
        onSkipCrop={handleSkipCrop}
        onCancel={handleCancelCrop}
      />

      {/* Dynamic Feedback Dialog */}
      <Dialog open={!!modalNotice} onOpenChange={(open) => !open && setModalNotice(null)}>
        <DialogContent className="sm:max-w-md border-border bg-background p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-full ${
                modalNotice?.type === 'error' ? 'bg-destructive/10 text-destructive' :
                modalNotice?.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {modalNotice?.type === 'error' && <XCircle className="w-5 h-5" />}
                {modalNotice?.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {modalNotice?.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              <DialogTitle className="text-xl font-bold font-sans">
                {modalNotice?.title || 'Notification'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground font-medium whitespace-pre-wrap text-sm leading-relaxed">
              {modalNotice?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              variant="secondary" 
              className="font-bold uppercase tracking-widest text-xs" 
              onClick={() => setModalNotice(null)}
            >
              Okay, Understood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
