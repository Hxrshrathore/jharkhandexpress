import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    // If OAuth credentials are not fully configured, return a real error — do NOT mock success.
    // The UI error state is far better than silently discarding messages.
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
      console.error('Contact form: Google OAuth credentials are not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN missing). Email not sent.');
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact us directly at contact@jharkhandexpress.com' },
        { status: 503 }
      );
    }

    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error('Failed to retrieve access token using refresh token.');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.SMTP_EMAIL || 'admin@jharkhandexpress.com',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken
      }
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL || 'admin@jharkhandexpress.com',
      to: process.env.SMTP_EMAIL || 'admin@jharkhandexpress.com',
      replyTo: email, // Allow replying directly to the user
      subject: `[Contact Form] ${subject || 'New Inquiry'} from ${name}`,
      text: `You have received a new message from the contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to send message.', details: error.message }, { status: 500 });
  }
}
