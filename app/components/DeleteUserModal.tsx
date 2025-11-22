'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface DeleteUserModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteUserModal({ user, onClose, onSuccess }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, authId: user.authId || user.id })
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה במחיקת המשתמש');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">מחיקת משתמש</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded p-4 mb-4">
          <p className="text-red-400 mb-2">האם אתה בטוח שברצונך למחוק את המשתמש:</p>
          <p className="text-white font-bold text-lg">{user.name}</p>
          <p className="text-red-300 text-sm mt-2">⚠️ פעולה זו אינה ניתנת לביטול!</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'מוחק...' : 'מחק משתמש'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}