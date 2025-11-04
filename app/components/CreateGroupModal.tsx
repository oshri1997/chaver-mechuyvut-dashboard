'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createGroup } from '../lib/firestore';
import { getCurrentUser } from '../lib/auth';

interface CreateGroupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupModal({ onClose, onSuccess }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ספורט');
  const [maxMembers, setMaxMembers] = useState(6);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [emoji, setEmoji] = useState('⚽');
  const [time, setTime] = useState('19:00');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [loading, setLoading] = useState(false);

  const admin = getCurrentUser();
  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const toggleDay = (index: number) => {
    if (activeDays.includes(index)) {
      setActiveDays(activeDays.filter(d => d !== index));
    } else {
      setActiveDays([...activeDays, index]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('נא למלא שם קבוצה');
      return;
    }
    if (!description.trim()) {
      alert('נא למלא תיאור קבוצה');
      return;
    }
    if (activeDays.length === 0) {
      alert('נא לבחור לפחות יום אחד');
      return;
    }
    if (!whatsappLink.trim()) {
      alert('נא למלא קישור WhatsApp');
      return;
    }

    setLoading(true);
    try {
      await createGroup({
        activeDays: activeDays.sort(),
        category,
        createdAt: Date.now(),
        createdBy: admin.name,
        createdByUserId: admin.authId || admin.id,
        description,
        emoji,
        maxAge,
        maxMembers,
        minAge,
        name,
        time,
        whatsappLink: whatsappLink.trim()
      }, admin.authId || admin.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה ביצירת הקבוצה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">יצירת קבוצה חדשה</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">שם הקבוצה</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                placeholder="למשל: ריצה עם נונה"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">אימוג'י</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-center text-2xl"
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">תיאור הקבוצה</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              placeholder="למשל: ריצה בשעה 19 עם נונה"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">שעת מחויבות</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">מספר חברים מקסימלי</label>
              <input
                type="number"
                min="2"
                max="20"
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">גיל מינימלי</label>
              <input
                type="number"
                min="13"
                max="99"
                value={minAge}
                onChange={(e) => setMinAge(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">גיל מקסימלי</label>
              <input
                type="number"
                min="13"
                max="99"
                value={maxAge}
                onChange={(e) => setMaxAge(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">ימי פעילות</label>
            <div className="grid grid-cols-4 gap-2">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  onClick={() => toggleDay(index)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    activeDays.includes(index)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">קישור WhatsApp</label>
            <input
              type="url"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
              placeholder="https://chat.whatsapp.com/..."
              required
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'יוצר...' : 'צור קבוצה'}
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