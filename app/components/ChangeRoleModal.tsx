'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateUserRole } from '../lib/firestore';

interface ChangeRoleModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeRoleModal({ user, onClose, onSuccess }: ChangeRoleModalProps) {
  const [role, setRole] = useState(user.role || 'user');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserRole(user.id, role);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה בשינוי התפקיד');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">שינוי תפקיד</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 mb-4">משתמש: <span className="font-bold text-white">{user.name}</span></p>
          <label className="block text-sm font-medium text-gray-300 mb-2">תפקיד</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
          >
            <option value="user">משתמש רגיל</option>
            <option value="moderator">מנהל משנה</option>
            <option value="admin">מנהל ראשי</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'משנה...' : 'שנה תפקיד'}
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