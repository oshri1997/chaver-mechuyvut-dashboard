import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, message, userName } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'חבר מחויבות <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px;">שלום ${userName},</h2>
            <div style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; text-align: center;">הודעה זו נשלחה מאפליקציית חבר מחויבות</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
