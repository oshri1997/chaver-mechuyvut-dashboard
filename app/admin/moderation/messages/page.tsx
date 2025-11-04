'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (messageId: string) => {
    if (confirm('למחוק הודעה זו?')) {
      await deleteDoc(doc(db, 'messages', messageId));
      loadMessages();
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">בדיקת הודעות</h1>
          <p className="text-gray-400 mt-2">סקירת הודעות אחרונות במערכת</p>
        </div>
        <Link href="/admin/moderation" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          חזרה למודרציה
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">הודעות אחרונות</h2>
          <span className="text-gray-400 text-sm">{messages.length} הודעות</span>
        </div>
        
        <div className="space-y-3">
          {messages.map(message => (
            <div key={message.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-white">{message.senderName || 'משתמש'}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleString('he-IL')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(message.id)}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-300 text-sm mt-2">{message.text || message.content}</p>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              אין הודעות להצגה
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
