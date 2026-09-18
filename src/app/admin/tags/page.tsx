'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Tag, Zap, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RedisTag {
  member: string;
  score: number;
}

export default function TagsManager() {
  const [tags, setTags] = useState<RedisTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/tags/top?limit=100')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tags');
        return res.json();
      })
      .then(data => {
        if (data.tags) {
          setTags(data.tags);
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading Tag Engine...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Core
          </Link>
          <div className="h-4 w-px bg-muted mx-2 hidden sm:block"></div>
          <h1 className="font-black text-lg tracking-tighter hidden sm:block uppercase">Global Tag Engine</h1>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase bg-pink-500/10 text-pink-500 px-3 py-1.5 rounded-full border border-pink-500/20">
          <Zap className="w-3.5 h-3.5" /> Redis Cache Active
        </div>
      </header>

      <div className="max-w-300 mx-auto px-4 md:px-6 mt-8 md:mt-12">
        <Card>
          <CardHeader className="border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Tag Leaderboard</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold mt-1">
                  Showing Top {tags.length} Cached Tags. (100k+ total tags processed via GIN indexing on database)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-lg mb-6 text-sm font-bold">
                Error: {error}
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              {tags.length === 0 && !error ? (
                <div className="w-full text-center text-muted-foreground py-12 text-sm uppercase tracking-widest">
                  No tags cached in Redis
                </div>
              ) : (
                tags.map((t, idx) => (
                  <div key={idx} className="flex items-stretch group bg-muted/40 border border-border rounded-lg overflow-hidden hover:border-pink-500/50 transition-colors shadow-sm">
                    <div className="bg-muted/80 px-3 py-2 flex items-center justify-center text-muted-foreground group-hover:text-pink-500 transition-colors border-r border-border">
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div className="px-4 py-2 flex items-center">
                      <span className="text-sm font-medium text-foreground">{t.member}</span>
                    </div>
                    <div className="px-3 py-2 bg-pink-500/10 border-l border-border text-xs font-black text-pink-500 flex items-center justify-center min-w-12">
                      {t.score}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
