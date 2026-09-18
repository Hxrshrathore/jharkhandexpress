"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Server, Activity, HardDrive, RefreshCcw, Cpu, Clock, Terminal, Network, List } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ServerHealthPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Historical data for charts loaded from Redis
  const [history, setHistory] = useState<any[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/health');
      if (!res.ok) throw new Error('Failed to fetch server health');
      const json = await res.json();
      setData(json);
      setHistory(json.history || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Poll every 60 seconds (since backend cron runs once a minute)
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-scroll logs to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.logs]);

  const getMemoryUsage = (memString: string) => {
    try {
      if (memString.includes('MOCK')) return 75; 
      const lines = memString.split('\n');
      if (lines.length > 1) {
        const memLine = lines[1].trim().split(/\s+/);
        const total = parseInt(memLine[1]);
        const used = parseInt(memLine[2]);
        return (used / total) * 100;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  };

  const getDiskUsage = (diskString: string) => {
    try {
      if (diskString.includes('MOCK')) return 75;
      const lines = diskString.split('\n');
      if (lines.length > 1) {
        const rootLine = lines.find(l => l.endsWith(' /'));
        if (rootLine) {
          const parts = rootLine.trim().split(/\s+/);
          const percent = parts[4].replace('%', '');
          return parseInt(percent);
        }
      }
      return 0;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="space-y-8 relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-emerald-500" />
            DevOps Command Center
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xl">
            Real-time infrastructure metrics, live process monitoring, and application logs (Last 36 Hours).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates (60s)
          </Badge>
          <Button onClick={fetchHealth} disabled={loading} variant="outline" className="gap-2">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
          Error fetching health stats: {error}
        </div>
      )}

      {data && (
        <>
          {data.isDev && (
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-lg text-sm mb-6">
              <strong>Development Mode:</strong> You are viewing mock data. Deploy to EC2 to see real system statistics.
            </div>
          )}

          {/* Top Row: Animated Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="w-4 h-4 text-blue-500" /> CPU Utilization (Last 36 Hours)
                </CardTitle>
                <CardDescription>Server Total vs Node.js App</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                    <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#888888" tickMargin={10} minTickGap={30} />
                    <YAxis tick={{fontSize: 10}} stroke="#888888" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="serverCpu" name="Server CPU %" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="appCpu" name="App CPU %" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4 text-purple-500" /> App Memory Usage (Last 36 Hours)
                </CardTitle>
                <CardDescription>Next.js Process RAM (% of Server Total)</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888833" />
                    <XAxis dataKey="time" tick={{fontSize: 10}} stroke="#888888" tickMargin={10} minTickGap={30} />
                    <YAxis tick={{fontSize: 10}} stroke="#888888" domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="appMemPct" name="Memory %" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Middle Left: Network / Disk */}
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Terminal className="w-5 h-5 text-emerald-500" /> App Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div>
                      <p className="font-bold text-lg">Next.js Core</p>
                      <p className="text-xs text-muted-foreground">Running on port 3000</p>
                    </div>
                    <Badge className={data.appStats?.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}>
                      {data.appStats?.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground mb-1">Process CPU</p>
                      <p className="font-bold text-lg text-blue-500">{data.appStats?.cpu}%</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/10">
                      <p className="text-xs text-muted-foreground mb-1">Process RAM</p>
                      <p className="font-bold text-lg text-purple-500">{data.appStats?.memoryPct}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Server className="w-4 h-4 text-emerald-500" /> Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2"><Cpu className="w-4 h-4 text-purple-500" /> Server RAM</span>
                      <span className="font-semibold">{Math.round(getMemoryUsage(data.system?.memory))}%</span>
                    </div>
                    <Progress value={getMemoryUsage(data.system?.memory)} className="h-2" />
                    <pre className="text-[10px] text-muted-foreground overflow-x-auto mt-1 p-2 bg-muted/30 rounded">
                      {data.system?.memory || 'N/A'}
                    </pre>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-orange-500" /> Root Disk (/)</span>
                      <span className="font-semibold">{getDiskUsage(data.system?.disk)}%</span>
                    </div>
                    <Progress value={getDiskUsage(data.system?.disk)} className="h-2" />
                    <pre className="text-[10px] text-muted-foreground overflow-x-auto mt-1 p-2 bg-muted/30 rounded">
                      {data.system?.disk?.split('\n').filter((l: string) => l.includes(' /') || l.includes('Size')).join('\n') || 'N/A'}
                    </pre>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold mb-1 flex items-center gap-2"><Network className="w-4 h-4 text-blue-500" /> Network Interface</p>
                    <pre className="text-[10px] text-muted-foreground overflow-x-auto p-2 bg-muted/30 rounded">
                      {data.system?.network || 'N/A'}
                    </pre>
                  </div>

                  <div className="pt-4 border-t">
                     <p className="text-sm font-semibold flex justify-between">Releases on Disk: <span>{data.system?.releasesCount}</span></p>
                     {parseInt(data.system?.releasesCount) > 10 && (
                        <p className="text-xs text-red-500 mt-1">Warning: Consider cleaning up old releases.</p>
                     )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Right: Logs & Top Processes */}
            <div className="space-y-6 lg:col-span-2">
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Terminal className="w-4 h-4 text-orange-500" /> Live Application Logs (Redis)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1e1e1e] rounded-lg p-4 h-[300px] overflow-y-auto font-mono text-xs text-[#a9dc76] leading-relaxed relative">
                    <pre className="whitespace-pre-wrap">{data.logs}</pre>
                    <div ref={logsEndRef} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <List className="w-4 h-4 text-zinc-500" /> Top Processes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 rounded-tl-lg">PID</th>
                          <th className="px-4 py-2">MEM %</th>
                          <th className="px-4 py-2">CPU %</th>
                          <th className="px-4 py-2 rounded-tr-lg">Command</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.processes && data.processes.map((proc: any, i: number) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-4 py-2 font-mono text-xs">{proc.pid}</td>
                            <td className="px-4 py-2 text-purple-500 font-semibold">{proc.mem}</td>
                            <td className="px-4 py-2 text-blue-500 font-semibold">{proc.cpu}</td>
                            <td className="px-4 py-2 font-mono text-xs truncate max-w-[200px]" title={proc.cmd}>{proc.cmd}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
