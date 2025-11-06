import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAllUsers, getAllGroups } from '../../lib/firestore';

export async function GET() {
  try {
    const now = Date.now();
    const scheduledRef = collection(db, 'scheduled_notifications');
    const q = query(
      scheduledRef,
      where('status', '==', 'pending'),
      where('scheduledTime', '<=', now)
    );

    const snapshot = await getDocs(q);
    const [users, groups] = await Promise.all([getAllUsers(), getAllGroups()]);

    let processed = 0;

    for (const notifDoc of snapshot.docs) {
      const notification = notifDoc.data();
      let tokens: string[] = [];

      if (notification.target.type === 'general') {
        tokens = users.map((u: any) => u.pushToken).filter((t: any) => t);
      } else if (notification.target.type === 'group') {
        const group: any = groups.find((g: any) => g.id === notification.target.groupId);
        if (group) {
          tokens = users
            .filter((u: any) => group.memberIds?.includes(u.id))
            .map((u: any) => u.pushToken)
            .filter((t: any) => t);
        }
      } else if (notification.target.type === 'user') {
        const user = users.find((u: any) => u.id === notification.target.userId);
        if (user?.pushToken) tokens = [user.pushToken];
      }

      if (tokens.length > 0) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens,
            title: notification.title,
            body: notification.body,
            data: { link: notification.link || '' }
          })
        });
      }

      await updateDoc(doc(db, 'scheduled_notifications', notifDoc.id), {
        status: 'sent',
        sentAt: Date.now()
      });

      processed++;
    }

    return NextResponse.json({ success: true, processed });
  } catch (error: any) {
    console.error('Process scheduled error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
