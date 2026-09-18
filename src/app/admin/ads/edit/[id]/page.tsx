'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Loader2, Plus, Upload, Trash2, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface AdAsset {
  id?: number;
  type: 'leaderboard' | 'rectangle';
  image_url: string;
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
  ads: { id: number; type: string; image_url: string; active: boolean; show_on_homepage?: boolean; show_in_articles?: boolean }[];
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
  const [dialogMsg, setDialogMsg] = useState('');

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
    if (toTime < fromTime) return;

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
  }, [newCampFrom, newCampTo, pendingAds, campaigns]);

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingAd(true);
    setUploadProgress(0);
    
    try {
      const newAds: any[] = [];
      const total = e.target.files.length;
      for (let i = 0; i < total; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/admin/ads/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        
        if (!uploadData.success) throw new Error('Upload failed');
        newAds.push({ type: activeTab, image_url: uploadData.url, show_in_articles: false, show_on_homepage: true });
        
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }
      
      setPendingAds(prev => [...prev, ...newAds]);
    } catch (err) {
      setDialogMsg('Error uploading ad(s).');
    }
    setUploadingAd(false);
    
    // Clear the input so the same files can be selected/dropped again if needed
    e.target.value = '';
  };

  const removePendingAd = (index: number) => {
    setPendingAds(pendingAds.filter((_, i) => i !== index));
  };

  const handleLaunchCampaign = async () => {
    if (!newCampName || !newCampFrom || !newCampTo) {
      setDialogMsg('Please fill out Campaign Name and Dates.');
      return;
    }
    if (capacityStatus === 'error') {
      setDialogMsg('Cannot launch campaign. Date capacity exceeded.');
      return;
    }

    setSavingCampaign(true);
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(campaignId, 10),
          name: newCampName,
          valid_from: new Date(newCampFrom).toISOString(),
          valid_to: new Date(newCampTo).toISOString(),
          ads: pendingAds
        })
      });
      
      const data = await res.json();
      if (!data.success) throw new Error('DB save failed');
      
      router.push('/admin/ads');
    } catch (err) {
      setDialogMsg('Error launching campaign.');
    }
    setSavingCampaign(false);
  };

  return (
    <div className="p-2 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'General Sans', sans-serif" }}>Edit Campaign</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">Update ad pools and configurations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/ads"
            className="bg-secondary border border-border text-secondary-foreground px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
            Cancel
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Plus className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Campaign Meta</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <AlertDescription>{capacityMessage}</AlertDescription>
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

          <div className="bg-muted/30 border border-border rounded-xl p-6 mb-8">
            <Tabs defaultValue="leaderboard" value={activeTab} onValueChange={(val) => setActiveTab(val as 'leaderboard' | 'rectangle')}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attach Campaign Assets</h3>
                <TabsList>
                  <TabsTrigger value="leaderboard" className="text-xs font-bold uppercase tracking-widest">Leaderboards</TabsTrigger>
                  <TabsTrigger value="rectangle" className="text-xs font-bold uppercase tracking-widest">Rectangles</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="leaderboard" className="mt-0 outline-none">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pendingAds.filter(a => a.type === 'leaderboard').map((ad, i) => (
                    <div key={i} className="relative group bg-muted border border-border rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                      <img src={ad.image_url} alt="Ad Asset" className="max-w-full max-h-full object-contain" />
                      <Button 
                        variant="destructive"
                        size="icon"
                        onClick={() => removePendingAd(pendingAds.indexOf(ad))}
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-2 left-2 right-2 bg-background/90 p-1.5 rounded flex items-center justify-around border border-border">
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            className="h-3 w-3"
                            checked={ad.show_on_homepage !== false}
                            onCheckedChange={(checked) => {
                              const newAds = [...pendingAds];
                              newAds[pendingAds.indexOf(ad)].show_on_homepage = !!checked;
                              setPendingAds(newAds);
                            }}
                          />
                          <Label className="text-[9px] font-bold uppercase cursor-pointer leading-none">Home</Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            className="h-3 w-3"
                            checked={ad.show_in_articles}
                            onCheckedChange={(checked) => {
                            if (checked) {
                              const activeGlobal = campaigns.reduce((acc, camp) => {
                                if (camp.id.toString() === campaignId) return acc; // Exclude current campaign from global count
                                if (new Date(camp.valid_to).getTime() < Date.now()) return acc;
                                return acc + camp.ads.filter(a => a.type === 'leaderboard' && a.show_in_articles).length;
                              }, 0);
                              const currentSelected = pendingAds.filter(a => a.type === 'leaderboard' && a.show_in_articles).length;
                              if (activeGlobal + currentSelected >= 6) {
                                setDialogMsg(`You cannot activate more than 6 article ads globally.\n\nActive in other campaigns: ${activeGlobal}\nProposed for this campaign: ${currentSelected + 1}`);
                                return;
                              }
                            }
                            const newAds = [...pendingAds];
                            newAds[pendingAds.indexOf(ad)].show_in_articles = !!checked;
                            setPendingAds(newAds);
                          }}
                        />
                          <Label className="text-[9px] font-bold uppercase cursor-pointer leading-none">Article</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="relative border-2 border-dashed border-border hover:border-emerald-500 rounded-lg aspect-video flex flex-col items-center justify-center cursor-pointer transition-colors group">
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
                        <Upload className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 mb-2" />
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-emerald-500 uppercase tracking-widest text-center px-2">Upload Leaderboard</span>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rectangle" className="mt-0 outline-none">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pendingAds.filter(a => a.type === 'rectangle').map((ad, i) => (
                    <div key={i} className="relative group bg-muted border border-border rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                      <img src={ad.image_url} alt="Ad Asset" className="max-w-full max-h-full object-contain" />
                      <Button 
                        variant="destructive"
                        size="icon"
                        onClick={() => removePendingAd(pendingAds.indexOf(ad))}
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-2 left-2 right-2 bg-background/90 p-1.5 rounded flex items-center justify-around border border-border">
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            className="h-3 w-3"
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
                                  setDialogMsg(`You cannot activate more than 6 rectangle video ads globally on the homepage.\n\nActive in other campaigns: ${activeGlobalVideo}\nProposed for this campaign: ${currentSelectedVideo + 1}`);
                                  return;
                                }
                              }
                              const newAds = [...pendingAds];
                              newAds[pendingAds.indexOf(ad)].show_on_homepage = !!checked;
                              setPendingAds(newAds);
                            }}
                          />
                          <Label className="text-[9px] font-bold uppercase cursor-pointer leading-none">Home</Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Checkbox 
                            className="h-3 w-3"
                            checked={ad.show_in_articles}
                            onCheckedChange={(checked) => {
                              const newAds = [...pendingAds];
                              newAds[pendingAds.indexOf(ad)].show_in_articles = !!checked;
                              setPendingAds(newAds);
                            }}
                          />
                          <Label className="text-[9px] font-bold uppercase cursor-pointer leading-none">Article</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="relative border-2 border-dashed border-border hover:border-emerald-500 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer transition-colors group">
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
                        <Upload className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 mb-2" />
                        <span className="text-xs font-bold text-muted-foreground group-hover:text-emerald-500 uppercase tracking-widest text-center px-2">Upload Rectangle</span>
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
            className="w-full bg-primary text-primary-foreground py-6 text-sm font-black uppercase tracking-widest hover:bg-primary/90"
          >
            {savingCampaign ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Camera className="w-5 h-5 mr-2" />} UPDATE CAMPAIGN
          </Button>
        </CardContent>
      </Card>

      <Dialog open={!!dialogMsg} onOpenChange={(open) => !open && setDialogMsg('')}>
        <DialogContent className="sm:max-w-md border-border">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <DialogTitle className="text-xl font-bold font-sans">Ad Limit Reached</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground font-medium whitespace-pre-wrap">
              {dialogMsg}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="secondary" className="font-bold uppercase tracking-widest text-xs" onClick={() => setDialogMsg('')}>
              Okay, I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
