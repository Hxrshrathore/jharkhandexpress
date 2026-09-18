import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({
      isDev: true,
      appStats: {
        status: 'online',
        cpu: Math.random() * 5 + 1,
        memoryPct: Math.random() * 5 + 5
      },
      system: {
        uptime: ' up 2 days, 4:15, 1 user, load average: 0.10, 0.15, 0.15',
        memory: 'Total: 2000MB, Free: 500MB (MOCK)',
        disk: 'Total: 20G, Used: 15G, Avail: 5G (MOCK)',
        releasesCount: '5',
        cpuStr: '%Cpu(s):  5.0 us,  2.0 sy,  0.0 ni, 92.0 id,  0.5 wa,  0.0 hi,  0.5 si,  0.0 st',
        network: 'eth0: 100000000 100000 0 0 0 0 0 0 50000000 50000 0 0 0 0 0 0',
      },
      processes: [
        { pid: '101', mem: '15.0', cpu: '5.2', cmd: 'next-server (v' },
        { pid: '102', mem: '2.0', cpu: '1.0', cmd: 'pm2 God Daemon' },
        { pid: '99', mem: '1.0', cpu: '0.1', cmd: 'systemd' }
      ],
      logs: `0|truth24x | 2026-09-13T00:40:00: INFO: Server started on port 3000\n0|truth24x | 2026-09-13T00:41:00: GET /api/health 200\n0|truth24x | 2026-09-13T00:42:00: Mock log line 3...`,
      history: Array.from({ length: 60 }).map((_, i) => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - (60 - i));
        return {
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          serverCpu: Math.random() * 20 + 5,
          appCpu: Math.random() * 10 + 2,
          appMemPct: Math.random() * 5 + 10
        };
      })
    });
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const [uptimeResult, freeResult, dfResult, releasesResult, netResult] = await Promise.allSettled([
      execAsync('uptime'),
      execAsync('free -m'),
      execAsync('df -h /'),
      execAsync('ls -1 /var/www/truth-media/releases/ 2>/dev/null | wc -l'),
      execAsync('cat /proc/net/dev | grep -E "eth0|ens3|ens4|ens5"')
    ]);

    // Fetch historical data directly from Upstash
    const [historyStrings, logsResult, psResultStr] = await Promise.all([
      redis.lrange('health_metrics_history', 0, 2160),
      redis.get<string>('health_logs_latest'),
      redis.get<string>('health_processes_latest')
    ]);

    // Parse the history array
    const history = (historyStrings || [])
        .map(h => typeof h === 'string' ? JSON.parse(h) : h)
        .reverse(); // Reverse so oldest is first for the graph

    // Get the latest metrics for current stats
    let latestAppCpu = 0;
    let latestAppMem = 0;
    let latestAppStatus = 'offline';

    if (history.length > 0) {
      const latest = history[history.length - 1];
      latestAppCpu = latest.appCpu;
      latestAppMem = latest.appMemPct;
      latestAppStatus = 'online';
    }

    let processes: any[] = [];
    if (psResultStr) {
      const lines = psResultStr.trim().split('\n').slice(1);
      processes = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        const cmd = parts.slice(3).join(' ');
        return {
          pid: parts[0],
          mem: parts[1],
          cpu: parts[2],
          cmd: cmd
        };
      });
    }

    return NextResponse.json({
      isDev: false,
      appStats: {
        status: latestAppStatus,
        cpu: latestAppCpu,
        memoryPct: latestAppMem
      },
      system: {
        uptime: uptimeResult.status === 'fulfilled' ? uptimeResult.value.stdout.trim() : 'Error',
        memory: freeResult.status === 'fulfilled' ? freeResult.value.stdout.trim() : 'Error',
        disk: dfResult.status === 'fulfilled' ? dfResult.value.stdout.trim() : 'Error',
        releasesCount: releasesResult.status === 'fulfilled' ? releasesResult.value.stdout.trim() : '0',
        network: netResult.status === 'fulfilled' ? netResult.value.stdout.trim() : ''
      },
      processes,
      logs: logsResult || 'No logs found in Redis',
      history: history
    });
  } catch (error) {
    console.error('Health API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch server health' }, { status: 500 });
  }
}
