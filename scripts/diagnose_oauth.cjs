const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
const envLocalPath = path.resolve(__dirname, '..', '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function runDiagnostics() {
  console.log('=== JHARKHAND EXPRESS OAUTH & API INTEGRATION DIAGNOSTIC ===\n');

  // 1. Check Credentials in .env.local
  console.log('1. Checking Environment Variables:');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const dbUrl = process.env.DATABASE_URL;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const smtpEmail = process.env.SMTP_EMAIL;

  console.log(' - GOOGLE_CLIENT_ID:', clientId ? `Configured (${clientId.slice(0, 20)}...apps.googleusercontent.com)` : '❌ MISSING');
  console.log(' - GOOGLE_CLIENT_SECRET:', clientSecret ? `Configured (Starts with ${clientSecret.slice(0, 8)}...)` : '❌ MISSING');
  console.log(' - GOOGLE_REFRESH_TOKEN:', refreshToken ? 'Configured' : '⚠️ Missing (Needed for Gmail contact form sending)');
  console.log(' - SMTP_EMAIL:', smtpEmail ? smtpEmail : '⚠️ Missing (Will default to admin@jharkhandexpress.com)');
  console.log(' - DATABASE_URL:', dbUrl ? 'Configured' : '❌ MISSING');

  // 2. Test Google OAuth2 Client Instantiation
  console.log('\n2. Testing Google OAuth2 Client Configuration:');
  try {
    const { OAuth2Client } = require('google-auth-library');
    const oauth2Client = new OAuth2Client(
      clientId,
      clientSecret,
      'http://localhost:3000/api/youtube/callback'
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/analytics.readonly'
      ],
      prompt: 'consent'
    });

    console.log(' ✅ OAuth2 Client initialized successfully.');
    console.log(' ✅ Auth URL generated successfully:');
    const parsedUrl = new URL(authUrl);
    console.log('    - Host:', parsedUrl.host);
    console.log('    - Redirect URI in Auth URL:', parsedUrl.searchParams.get('redirect_uri'));
    console.log('    - Client ID matches:', parsedUrl.searchParams.get('client_id') === clientId ? 'YES' : 'NO');
    console.log('    - Scopes requested:', parsedUrl.searchParams.get('scope'));

    // Check if client ID is valid format
    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      console.log(' ⚠️ WARNING: Client ID does not end with .apps.googleusercontent.com');
    } else {
      console.log(' ✅ Client ID has valid Google format.');
    }
  } catch (err) {
    console.error(' ❌ Error generating Auth URL:', err.message);
  }

  // 3. Test Database Connection and youtube_accounts Table
  console.log('\n3. Testing Database & youtube_accounts Table:');
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(dbUrl);

    const testRes = await sql`SELECT 1 as connected`;
    console.log(' ✅ Database connected successfully.');

    // Check if youtube_accounts table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'youtube_accounts'
      ) as exists;
    `;

    if (tableCheck[0]?.exists) {
      console.log(' ✅ Table `youtube_accounts` exists.');
      const rows = await sql`SELECT * FROM youtube_accounts ORDER BY id DESC LIMIT 1`;
      if (rows && rows.length > 0) {
        console.log(` ℹ️ Found connected YouTube account: Channel ID = ${rows[0].channel_id}, Updated = ${rows[0].updated_at}`);
      } else {
        console.log(' ℹ️ Table `youtube_accounts` is ready (currently 0 accounts linked - ready to connect).');
      }
    } else {
      console.log(' ⚠️ Table `youtube_accounts` DOES NOT exist. Creating it now...');
      await sql`
        CREATE TABLE IF NOT EXISTS youtube_accounts (
          id SERIAL PRIMARY KEY,
          channel_id VARCHAR(255) NOT NULL,
          refresh_token TEXT NOT NULL,
          access_token TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log(' ✅ Table `youtube_accounts` created successfully.');
    }
  } catch (err) {
    console.error(' ❌ Database error:', err.message);
  }

  console.log('\n=== DIAGNOSTIC COMPLETE ===');
}

runDiagnostics().catch(console.error);
