'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, MessageCircle, Clock, Power, RefreshCw, X, ChevronRight, Activity, Database, Cloud, Key, Settings, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Settings State
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [googleNewsUrl, setGoogleNewsUrl] = useState('');
  const [breakingNewsExpiry, setBreakingNewsExpiry] = useState<number>(36);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Modal states for Maintenance
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('Updating');
  const [autoDeactivate, setAutoDeactivate] = useState(false);
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.maintenance_mode !== undefined) setMaintenanceMode(data.maintenance_mode);
        if (data.whatsapp_url !== undefined) setWhatsappUrl(data.whatsapp_url);
        if (data.google_news_url !== undefined) setGoogleNewsUrl(data.google_news_url || '');
        if (data.breaking_news_expiry_hours !== undefined) setBreakingNewsExpiry(data.breaking_news_expiry_hours);
        if (data.maintenance_auto_deactivate !== undefined) setAutoDeactivate(data.maintenance_auto_deactivate);
        if (data.maintenance_end_time) {
          const d = new Date(data.maintenance_end_time);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          setEndTime(d.toISOString().slice(0, 16));
        }
        setFetching(false);
      })
      .catch(console.error);
  }, []);

  const handleGlobalSave = async () => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          whatsapp_url: whatsappUrl,
          google_news_url: googleNewsUrl,
          breaking_news_expiry_hours: Number(breakingNewsExpiry)
        })
      });
      alert('Settings saved successfully.');
    } catch (err) {
      alert('Failed to save settings.');
    }
    setLoading(false);
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    if (checked) {
      setIsModalOpen(true);
    } else {
      saveMaintenanceConfig(false);
    }
  };

  const saveMaintenanceConfig = async (isTurningOn: boolean) => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          maintenance_mode: isTurningOn,
          maintenance_auto_deactivate: isTurningOn ? autoDeactivate : false,
          maintenance_end_time: (isTurningOn && endTime) ? new Date(endTime).toISOString() : null,
          maintenance_reason: isTurningOn ? reason : 'maintenance'
        })
      });
      setMaintenanceMode(isTurningOn);
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to update maintenance mode.');
    }
    setLoading(false);
  };

  if (fetching) return <div className="p-8 text-muted-foreground flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin"/> Loading Settings...</div>;

  return (
    <div className="relative min-h-screen bg-[#f2f2f7] dark:bg-[#000000] pb-24 -m-4 sm:-m-8 p-4 sm:p-8 font-sans">
      
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto pt-4">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <button 
          onClick={handleGlobalSave}
          disabled={loading}
          className="text-indigo-600 dark:text-indigo-400 font-semibold px-4 py-1 hover:bg-indigo-500/10 rounded-full transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          Save
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">

        {/* SECURITY GROUP */}
        <section>
          <div className="bg-card border-y sm:border sm:rounded-2xl border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-medium">Admin Passkey</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-base truncate max-w-[120px]">********</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-4 uppercase tracking-wide">Managed via .env.local (ADMIN_PASSWORD)</p>
        </section>

        {/* CONTENT MANAGEMENT GROUP */}
        <section>
          <div className="bg-card border-y sm:border sm:rounded-2xl border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-medium">Breaking News Expiry</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Select value={breakingNewsExpiry.toString()} onValueChange={(val) => setBreakingNewsExpiry(Number(val))}>
                  <SelectTrigger className="w-[120px] bg-transparent border-none shadow-none text-right focus:ring-0">
                    <SelectValue placeholder="Select expiry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Hours</SelectItem>
                    <SelectItem value="6">6 Hours</SelectItem>
                    <SelectItem value="12">12 Hours</SelectItem>
                    <SelectItem value="24">24 Hours</SelectItem>
                    <SelectItem value="36">36 Hours</SelectItem>
                    <SelectItem value="48">48 Hours</SelectItem>
                    <SelectItem value="72">72 Hours</SelectItem>
                    <SelectItem value="168">7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-4 uppercase tracking-wide">Auto-removes breaking news badge after duration.</p>
        </section>

        {/* SOCIAL GROUP */}
        <section>
          <div className="bg-card border-y sm:border sm:rounded-2xl border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-medium">WhatsApp Channel</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground w-1/2">
                <Input 
                  type="text"
                  value={whatsappUrl}
                  onChange={(e) => setWhatsappUrl(e.target.value)}
                  placeholder="https://whatsapp.com/..."
                  className="bg-transparent text-base text-right border-none shadow-none focus-visible:ring-0 w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-card border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-base font-medium block">Google News Preferred Source</span>
                  <span className="text-xs text-muted-foreground">Publication Follow URL / Search Link</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground w-1/2">
                <Input 
                  type="text"
                  value={googleNewsUrl}
                  onChange={(e) => setGoogleNewsUrl(e.target.value)}
                  placeholder="https://www.google.com/preferences/source?q=newswavejharkhand.com"
                  className="bg-transparent text-base text-right border-none shadow-none focus-visible:ring-0 w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SYSTEM STATUS GROUP */}
        <section>
          <div className="bg-card border-y sm:border sm:rounded-2xl border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
                  <Power className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-medium">Maintenance Mode</span>
              </div>
              <div 
                onClick={() => !loading && handleMaintenanceToggle(!maintenanceMode)}
                className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${maintenanceMode ? 'bg-green-500' : 'bg-muted-foreground/30'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ justifyContent: maintenanceMode ? 'flex-end' : 'flex-start' }}
              >
                <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 30 }} className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-4 uppercase tracking-wide">Takes the public site offline while keeping admin routes active.</p>
        </section>
        
        {/* SERVICE HEALTH GROUP */}
        <section className="pt-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">Service Health</h2>
          <div className="bg-card border-y sm:border sm:rounded-2xl border-border overflow-hidden divide-y divide-border">
            
            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-indigo-500" />
                <span className="text-base font-medium">Neon Postgres</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-blue-500" />
                <span className="text-base font-medium">Media Storage (SSD)</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-500" />
                <span className="text-base font-medium">OpenAI API</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-orange-500" />
                <span className="text-base font-medium">Upstash Redis</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>
            
          </div>
        </section>

      </div>

      {/* Maintenance Mode Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 text-center space-y-4 relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2 text-red-500">
                <Power className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Activate Maintenance</h2>
              <p className="text-sm text-muted-foreground">The public site will go offline immediately.</p>
              
              <div className="space-y-4 text-left pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="w-full bg-muted border border-border p-3 text-sm rounded-xl outline-none">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Updating">Updating Core Systems</SelectItem>
                      <SelectItem value="Maintenance">Scheduled Maintenance</SelectItem>
                      <SelectItem value="Down">Emergency Outage</SelectItem>
                      <SelectItem value="Deploying">Deploying New Features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto Deactivate</label>
                    <div 
                      onClick={() => setAutoDeactivate(!autoDeactivate)}
                      className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${autoDeactivate ? 'bg-red-500' : 'bg-muted-foreground/30'}`}
                      style={{ justifyContent: autoDeactivate ? 'flex-end' : 'flex-start' }}
                    >
                      <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 30 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                  {autoDeactivate && (
                    <div className="pt-2">
                      <DateTimePicker 
                        value={endTime ? new Date(endTime) : undefined}
                        onChange={(date) => {
                          if (date) {
                            const d = new Date(date);
                            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                            setEndTime(d.toISOString().slice(0, 16));
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => saveMaintenanceConfig(true)}
                disabled={loading || (autoDeactivate && !endTime)}
                className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-6 rounded-xl"
              >
                {loading ? 'Processing...' : 'Confirm & Take Offline'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
