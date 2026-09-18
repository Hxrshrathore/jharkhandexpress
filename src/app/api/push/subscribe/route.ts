import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    const { endpoint, keys: { p256dh, auth } } = subscription;

    // Upsert the subscription (insert, or do nothing if endpoint exists)
    await sql`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth)
      VALUES (${endpoint}, ${p256dh}, ${auth})
      ON CONFLICT (endpoint) DO NOTHING;
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
