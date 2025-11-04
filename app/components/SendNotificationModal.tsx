'use client';

import { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { sendNotificationToUser } from '../lib/firestore';

interface SendNotificationModalProps {
  user: any;
  onClose: () => void;
}

export default function SendNotificationModal({ user, onClose }: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert('נא למלא כותרת ותוכן');
      return;
    }

    setLoading(true);
    try {
      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: title,
          message: message,
          userName: user.name
        })
      });

      if (!response.ok) throw new Error('Failed to send email');

      await sendNotificationToUser(user.id, title, message);
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה בשליחת האימייל');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
        {/* Loading/Success Circle Overlay */}
        {loading && !success && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-32 h-32 border-8 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-20 h-20 text-white" strokeWidth={3} />
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">שליחת התראה</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 mb-4">למשתמש: <span className="font-bold text-white">{user.name}</span></p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">כותרת</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                placeholder="כותרת ההתראה..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">תוכן</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                placeholder="תוכן ההתראה..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={loading || success}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            שלח אימייל
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}