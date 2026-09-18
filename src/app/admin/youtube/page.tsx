import { sql } from '@/lib/db';
import OmniDashboard from './Dashboard';
import { Button } from '@/components/ui/button';

export default async function YouTubeAdminPage(props: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const searchParams = await props.searchParams;
  let isConnected = false;
  try {
    const accounts = await sql`SELECT * FROM youtube_accounts ORDER BY id DESC LIMIT 1`;
    isConnected = accounts && accounts.length > 0;
  } catch (error) {
    console.error('Error fetching youtube accounts:', error);
  }

  const isMissingCredentials = searchParams?.error === 'MissingCredentials';

  return (
    <main className="min-h-screen bg-background text-foreground pb-24 selection:bg-muted selection:text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-black text-xl tracking-tighter text-foreground uppercase">Omni-Analytics Command Center</h1>
        </div>
        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Connected
            </div>
          )}
          <a href="/api/youtube/connect">
            <Button variant={isConnected ? 'outline' : 'default'} size="sm" className="font-bold uppercase tracking-wider text-xs">
              {isConnected ? 'Reconnect Services' : 'Connect Services'}
            </Button>
          </a>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 mt-8">
        {isMissingCredentials && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 mb-8 text-sm leading-relaxed rounded-lg max-w-4xl">
            <strong className="font-bold">Configuration Error:</strong> You need to add <code className="font-mono bg-destructive/20 px-1 rounded">GOOGLE_CLIENT_ID</code> and <code className="font-mono bg-destructive/20 px-1 rounded">GOOGLE_CLIENT_SECRET</code> to your <code className="font-mono bg-destructive/20 px-1 rounded">.env.local</code> file.
          </div>
        )}
        
        {!isConnected && !isMissingCredentials && (
          <div className="border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 p-6 mb-8 rounded-xl max-w-4xl text-center py-16">
            <h2 className="text-xl font-bold mb-2">Google Services Not Connected</h2>
            <p className="text-sm opacity-80 mb-6">Connect your Google Account to unlock unified YouTube, Google Analytics, and Trends data.</p>
            <a href="/api/youtube/connect">
              <Button size="lg" className="font-bold uppercase tracking-widest">Connect Google Account</Button>
            </a>
          </div>
        )}

        {isConnected && <OmniDashboard />}
      </div>
    </main>
  );
}
