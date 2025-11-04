'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateUser } from '../lib/firestore';

interface EditUserModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(user.id, { name, email });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה בעדכון המשתמש');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">עריכת משתמש</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">שם</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'שומר...' : 'שמור'}
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