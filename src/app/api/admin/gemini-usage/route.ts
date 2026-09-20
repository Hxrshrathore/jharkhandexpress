import { NextResponse } from 'next/server';
import { getGeminiUsage, testGeminiConnection } from '@/lib/gemini-tracker';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const testMode = searchParams.get('test') === 'true';

    if (testMode) {
      const pingResult = await testGeminiConnection();
      const stats = await getGeminiUsage();
      return NextResponse.json({
        ...stats,
        pingResult,
      });
    }

    const stats = await getGeminiUsage();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching Gemini usage metrics:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
