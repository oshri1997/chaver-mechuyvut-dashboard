import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export async function POST(request: Request) {
  try {
    const { tokens, title, body, data } = await request.json();

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ error: 'No tokens provided' }, { status: 400 });
    }

    const expoTokens = tokens.filter((t: string) => t.startsWith('ExponentPushToken['));
    const fcmTokens = tokens.filter((t: string) => !t.startsWith('ExponentPushToken['));

    let expoSuccess = 0, expoFailure = 0, fcmSuccess = 0, fcmFailure = 0;

    // Send to Expo
    if (expoTokens.length > 0) {
      const expoMessages = expoTokens.map((token: string) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data: data || {}
      }));

      const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(expoMessages)
      });

      const expoResult = await expoResponse.json();
      expoSuccess = expoResult.data?.filter((r: any) => r.status === 'ok').length || 0;
      expoFailure = expoResult.data?.filter((r: any) => r.status === 'error').length || 0;
    }

    // Send to FCM
    if (fcmTokens.length > 0) {
      try {
        const fcmResponse = await admin.messaging().sendEachForMulticast({
          notification: { title, body },
          data: data || {},
          tokens: fcmTokens
        });
        fcmSuccess = fcmResponse.successCount;
        fcmFailure = fcmResponse.failureCount;
      } catch (fcmError: any) {
        console.error('FCM Error:', fcmError.message);
        fcmFailure = fcmTokens.length;
      }
    }

    return NextResponse.json({
      success: true,
      successCount: expoSuccess + fcmSuccess,
      failureCount: expoFailure + fcmFailure
    });
  } catch (error: any) {
    console.error('❌ Push notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
