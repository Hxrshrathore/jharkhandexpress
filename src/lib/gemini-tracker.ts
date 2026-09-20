import { sql } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';
import { google } from 'googleapis';
import { getAuthenticatedClient } from '@/lib/youtube/auth';

export interface CloudMonitoringInfo {
  connected: boolean;
  projectId: string;
  totalRequests24h?: number;
  geminiRequests24h?: number;
  apiBreakdown?: Record<string, number>;
  error?: string;
}

export interface GeminiUsageStats {
  configured: boolean;
  model: string;
  tier: string;
  rpmLimit: number;
  rpdLimit: number;
  rpmCurrent: number;
  rpdCurrent: number;
  totalTranslations: number;
  totalArticles: number;
  status: 'healthy' | 'warning' | 'error' | 'unconfigured';
  lastLatencyMs?: number;
  lastChecked?: string;
  cloudMonitoring?: CloudMonitoringInfo;
}

/**
 * Query Google Cloud Monitoring API v3 directly using OAuth2 credentials
 * to get real-time API call metrics for the project (e.g. jharkhand-express-509210).
 */
export async function fetchGoogleMonitoringMetrics(): Promise<CloudMonitoringInfo> {
  const projectId = process.env.GOOGLE_PROJECT_ID || 'jharkhand-express-509210';

  try {
    const oauth2Client = await getAuthenticatedClient();
    const monitoring = google.monitoring({ version: 'v3', auth: oauth2Client });

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const res = await monitoring.projects.timeSeries.list({
      name: `projects/${projectId}`,
      filter: 'metric.type = "serviceruntime.googleapis.com/api/request_count"',
      'interval.startTime': oneDayAgo.toISOString(),
      'interval.endTime': now.toISOString(),
      'aggregation.alignmentPeriod': '86400s',
      'aggregation.perSeriesAligner': 'ALIGN_SUM',
    });

    let totalCount = 0;
    let geminiCount = 0;
    const breakdown: Record<string, number> = {};

    if (res.data.timeSeries) {
      for (const series of res.data.timeSeries) {
        const service = series.resource?.labels?.service || 'other';
        const points = series.points || [];
        let seriesSum = 0;
        for (const p of points) {
          const val = parseInt(p.value?.int64Value || '0', 10);
          seriesSum += val;
        }
        totalCount += seriesSum;
        breakdown[service] = (breakdown[service] || 0) + seriesSum;
        if (service.includes('generativelanguage') || service.includes('aiplatform') || service.includes('gemini')) {
          geminiCount += seriesSum;
        }
      }
    }

    return {
      connected: true,
      projectId,
      totalRequests24h: totalCount,
      geminiRequests24h: geminiCount,
      apiBreakdown: breakdown,
    };
  } catch (error: any) {
    return {
      connected: false,
      projectId,
      error: error.message?.includes('YouTube not connected')
        ? 'OAuth not linked yet. Connect in /admin/youtube to stream Google Cloud Monitoring.'
        : error.message || 'Could not query Cloud Monitoring',
    };
  }
}

/**
 * Call this whenever a Gemini generation or translation occurs to record live usage in PostgreSQL.
 */
export async function recordGeminiCall(latencyMs?: number) {
  try {
    const lat = latencyMs ? Math.round(latencyMs) : null;
    await sql`
      INSERT INTO gemini_usage_logs (latency_ms, created_at)
      VALUES (${lat}, CURRENT_TIMESTAMP)
    `;
  } catch (error) {
    // Non-blocking: fail silently if DB write fails
    console.warn('Failed to record Gemini usage in DB:', error);
  }
}

/**
 * Get comprehensive Gemini usage metrics combining Google Cloud Monitoring API and PostgreSQL stats.
 */
export async function getGeminiUsage(): Promise<GeminiUsageStats> {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY);

  if (!isConfigured) {
    return {
      configured: false,
      model: 'gemini-3.5-flash-lite',
      tier: 'Free Tier',
      rpmLimit: 15,
      rpdLimit: 1500,
      rpmCurrent: 0,
      rpdCurrent: 0,
      totalTranslations: 0,
      totalArticles: 0,
      status: 'unconfigured',
    };
  }

  let rpmCurrent = 0;
  let rpdCurrent = 0;
  let lastLatencyMs: number | undefined;
  let totalTranslations = 0;
  let totalArticles = 0;

  // 1. Fetch DB metrics
  try {
    const [dailyRes, minuteRes, latencyRes, transRes, artRes] = await Promise.allSettled([
      sql`SELECT COUNT(*) as count FROM gemini_usage_logs WHERE created_at >= CURRENT_DATE`,
      sql`SELECT COUNT(*) as count FROM gemini_usage_logs WHERE created_at >= NOW() - INTERVAL '1 minute'`,
      sql`SELECT latency_ms FROM gemini_usage_logs WHERE latency_ms IS NOT NULL ORDER BY id DESC LIMIT 1`,
      sql`SELECT COUNT(*) as count FROM article_translations`,
      sql`SELECT COUNT(*) as count FROM articles`,
    ]);

    if (dailyRes.status === 'fulfilled' && dailyRes.value[0]?.count) {
      rpdCurrent = parseInt(String(dailyRes.value[0].count), 10);
    }

    if (minuteRes.status === 'fulfilled' && minuteRes.value[0]?.count) {
      rpmCurrent = parseInt(String(minuteRes.value[0].count), 10);
    }

    if (latencyRes.status === 'fulfilled' && latencyRes.value[0]?.latency_ms != null) {
      lastLatencyMs = parseInt(String(latencyRes.value[0].latency_ms), 10);
    }

    if (transRes.status === 'fulfilled' && transRes.value[0]?.count) {
      totalTranslations = parseInt(String(transRes.value[0].count), 10);
    }

    if (artRes.status === 'fulfilled' && artRes.value[0]?.count) {
      totalArticles = parseInt(String(artRes.value[0].count), 10);
    }
  } catch (err) {
    console.warn('Error reading Gemini metrics from PostgreSQL:', err);
  }

  // 2. Query Google Cloud Monitoring API
  let cloudMonitoring: CloudMonitoringInfo | undefined;
  try {
    cloudMonitoring = await fetchGoogleMonitoringMetrics();
    // If Google Cloud reports Gemini requests, reflect them
    if (cloudMonitoring?.connected && typeof cloudMonitoring.geminiRequests24h === 'number' && cloudMonitoring.geminiRequests24h > rpdCurrent) {
      rpdCurrent = cloudMonitoring.geminiRequests24h;
    }
  } catch (err) {
    console.warn('Error checking Cloud Monitoring:', err);
  }

  return {
    configured: true,
    model: 'gemini-3.5-flash-lite',
    tier: 'Free Tier',
    rpmLimit: 15,
    rpdLimit: 1500,
    rpmCurrent,
    rpdCurrent,
    totalTranslations,
    totalArticles,
    status: rpdCurrent >= 1400 ? 'warning' : 'healthy',
    lastLatencyMs,
    lastChecked: new Date().toISOString(),
    cloudMonitoring,
  };
}

/**
 * Ping the Gemini API to verify the API key, calculate real round-trip latency, and record it.
 */
export async function testGeminiConnection(): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, latencyMs: 0, error: 'GEMINI_API_KEY is not configured in environment.' };
  }

  const startTime = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: 'Respond with the word "OK"',
      config: {
        maxOutputTokens: 5,
        temperature: 0.1,
      },
    });

    const latencyMs = Date.now() - startTime;
    if (response.text) {
      await recordGeminiCall(latencyMs);
      return { success: true, latencyMs };
    }
    return { success: false, latencyMs, error: 'Empty response received from Gemini.' };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return { success: false, latencyMs, error: error.message || 'Failed to connect to Gemini API.' };
  }
}
