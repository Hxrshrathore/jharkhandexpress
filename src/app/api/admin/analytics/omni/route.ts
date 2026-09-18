import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthenticatedClient, clearTokens } from '@/lib/youtube/auth';
import googleTrends from 'google-trends-api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Default to last 30 days if not provided
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const startDate = startDateParam || defaultStartDate;
    const endDate = endDateParam || defaultEndDate;

    // Calculate difference in days for mapping
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const diffDays = Math.max(0, Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24)));

    const oauth2Client = await getAuthenticatedClient();

    // 1. Fetch YouTube Analytics Data
    const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });
    const youtubeData = google.youtube({ version: 'v3', auth: oauth2Client });
    
    let ytStats = { subscribers: 0, views: 0, videos: 0 };
    let ytHistorical: any[] = [];
    
    try {
      const channelRes = await youtubeData.channels.list({
        part: ['statistics'],
        mine: true
      });
      if (channelRes.data.items && channelRes.data.items.length > 0) {
        const stats = channelRes.data.items[0].statistics;
        ytStats = {
          subscribers: parseInt(stats?.subscriberCount || '0'),
          views: parseInt(stats?.viewCount || '0'),
          videos: parseInt(stats?.videoCount || '0'),
        };
      }

      const reportRes = await youtubeAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'views,estimatedMinutesWatched,likes',
        dimensions: 'day',
        sort: 'day'
      });
      
      if (reportRes.data.rows) {
        ytHistorical = reportRes.data.rows.map(row => ({
          date: row[0],
          views: row[1],
          watchTime: row[2],
          likes: row[3]
        }));
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('invalid_grant') || e.message.includes('Token has been expired'))) {
        throw e;
      }
      console.warn("YouTube API error (maybe missing scopes or no channel):", e);
    }

    // 2. Fetch Google Analytics (GA4) Data
    // We attempt to find the first GA4 property if a specific one isn't provided
    let gaHistorical: any[] = [];
    let gaActiveUsers = 0;
    try {
      const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth: oauth2Client });
      const accountsRes = await analyticsAdmin.accountSummaries.list();
      
      let propertyId = process.env.GA_PROPERTY_ID;
      if (!propertyId && accountsRes.data.accountSummaries && accountsRes.data.accountSummaries.length > 0) {
        const firstAccount = accountsRes.data.accountSummaries[0];
        if (firstAccount.propertySummaries && firstAccount.propertySummaries.length > 0) {
          propertyId = firstAccount.propertySummaries[0].property?.replace('properties/', '');
        }
      }

      if (propertyId) {
        const analyticsData = google.analyticsdata({ version: 'v1beta', auth: oauth2Client });
        const gaRes = await analyticsData.properties.runReport({
          property: `properties/${propertyId}`,
          requestBody: {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }]
          }
        });

        if (gaRes.data.rows) {
          gaHistorical = gaRes.data.rows.map(row => {
            const d = row.dimensionValues?.[0].value || '';
            const formattedDate = `${d.substring(0,4)}-${d.substring(4,6)}-${d.substring(6,8)}`;
            return {
              date: formattedDate,
              users: parseInt(row.metricValues?.[0].value || '0'),
              pageViews: parseInt(row.metricValues?.[1].value || '0')
            };
          });
          
          gaActiveUsers = gaHistorical.reduce((acc, curr) => acc + curr.users, 0);
        }
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('invalid_grant') || e.message.includes('Token has been expired'))) {
        throw e;
      }
      console.warn("Google Analytics API error:", e);
    }

    // 3. Fetch Google Trends Data
    let trendsData: any[] = [];
    try {
      // Fetching trends for a default keyword like "News" in IN (India) for the last 30 days
      const trendsRes = await googleTrends.interestOverTime({
        keyword: 'News',
        startTime: startObj,
        endTime: endObj,
        geo: 'IN'
      });
      const parsed = JSON.parse(trendsRes);
      if (parsed.default && parsed.default.timelineData) {
        trendsData = parsed.default.timelineData.map((item: any) => ({
          date: new Date(item.time * 1000).toISOString().split('T')[0],
          interest: item.value[0]
        }));
      }
    } catch (e) {
      console.warn("Google Trends API error:", e);
    }

    // 4. Combine historical data by date
    const mergedDataMap = new Map<string, any>();
    
    // Initialize map with dates from the date range
    for (let i = 0; i <= diffDays; i++) {
      const dObj = new Date(startObj.getTime() + i * 24 * 60 * 60 * 1000);
      const d = dObj.toISOString().split('T')[0];
      mergedDataMap.set(d, { date: d, ytViews: 0, gaUsers: 0, trendInterest: 0 });
    }

    ytHistorical.forEach(row => {
      if (mergedDataMap.has(row.date)) mergedDataMap.get(row.date).ytViews = row.views;
    });

    gaHistorical.forEach(row => {
      if (mergedDataMap.has(row.date)) mergedDataMap.get(row.date).gaUsers = row.users;
    });

    trendsData.forEach(row => {
      if (mergedDataMap.has(row.date)) mergedDataMap.get(row.date).trendInterest = row.interest;
    });

    const combinedTimeline = Array.from(mergedDataMap.values());

    return NextResponse.json({
      youtube: { stats: ytStats },
      ga: { totalActiveUsers: gaActiveUsers },
      timeline: combinedTimeline
    });

  } catch (error: any) {
    console.error('Omni Analytics API Error:', error);
    
    // Check for "YouTube not connected" from our auth script or "invalid_grant" from Google
    const isNotConnected = error.message === 'YouTube not connected';
    const isInvalidGrant = error.message && (error.message.includes('invalid_grant') || error.message.includes('Token has been expired or revoked'));
    
    if (isNotConnected || isInvalidGrant) {
      if (isInvalidGrant) {
        try {
          await clearTokens(); // Purge expired tokens from DB to force reconnect
        } catch (e) {
          console.error("Failed to clear expired tokens:", e);
        }
      }
      return NextResponse.json({ error: 'NotConnected' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
