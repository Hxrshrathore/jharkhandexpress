'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCcw, TrendingUp, Users, Eye, PlaySquare } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function OmniDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics/omni');
      if (!res.ok) {
        if (res.status === 401) throw new Error('NotConnected');
        throw new Error('Failed to load analytics.');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-4">
        <RefreshCcw className="w-12 h-12 animate-spin text-primary" />
        <p className="font-medium text-lg animate-pulse">Aggregating Omni-Analytics (YouTube + GA4 + Trends)...</p>
      </div>
    );
  }

  if (error === 'NotConnected') {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Action Required</h3>
          <p className="text-sm opacity-80 mt-1">Please Reconnect YouTube to grant the required Analytics scopes.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl">
        Error loading analytics: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">YT Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {data?.youtube?.stats?.subscribers?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">YT Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              {data?.youtube?.stats?.views?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">YT Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <PlaySquare className="w-5 h-5 text-red-500" />
              {data?.youtube?.stats?.videos?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GA4 Active Users (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              {data?.ga?.totalActiveUsers?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Omni-Analytics Timeline (Last 30 Days)</CardTitle>
          <CardDescription>Correlating YouTube Views, Google Analytics Users, and Google Trends Interest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--foreground)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                <Area yAxisId="left" type="monotone" name="YouTube Views" dataKey="ytViews" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorYt)" />
                <Area yAxisId="left" type="monotone" name="GA4 Active Users" dataKey="gaUsers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGa)" />
                <Area yAxisId="right" type="monotone" name="Trends Interest (0-100)" dataKey="trendInterest" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
