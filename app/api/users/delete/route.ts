import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/app/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userId, authId } = await request.json();

    await adminDb.collection('users').doc(userId).delete();

    if (authId) {
      try {
        await adminAuth.deleteUser(authId);
      } catch (authError: any) {
        if (authError.code !== 'auth/user-not-found') {
          throw authError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
