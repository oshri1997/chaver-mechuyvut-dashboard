'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { updateGroup } from '../lib/firestore';

interface EditGroupModalProps {
  group: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGroupModal({ group, onClose, onSuccess }: EditGroupModalProps) {
  const [description, setDescription] = useState(group.name);
  const [category, setCategory] = useState(group.category);
  const [maxMembers, setMaxMembers] = useState(group.maxMembers);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateGroup(group.id, { description, category, maxMembers: parseInt(maxMembers) });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה בעדכון הקבוצה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">עריכת קבוצה</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">שם הקבוצה</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">קטגוריה</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
            >
              <option value="ספורט">ספורט</option>
              <option value="לימוד">לימוד</option>
              <option value="תפילה">תפילה</option>
              <option value="חברתי">חברתי</option>
              <option value="בריאות">בריאות</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">מספר חברים מקסימלי</label>
            <input
              type="number"
              min="2"
              max="20"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
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