import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { title, body, link, scheduledTime, target } = await request.json();

    await addDoc(collection(db, 'scheduled_notifications'), {
      title,
      body,
      link,
      scheduledTime,
      target,
      status: 'pending',
      createdAt: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Schedule notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
