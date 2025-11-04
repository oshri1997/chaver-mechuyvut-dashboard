'use client';

import { useState } from 'react';
import { Save, Plus, Edit, Trash2, Settings as SettingsIcon } from 'lucide-react';

const categories = [
  { id: '1', name: 'ספורט', order: 1 },
  { id: '2', name: 'לימוד', order: 2 },
  { id: '3', name: 'תפילה', order: 3 },
  { id: '4', name: 'חברתי', order: 4 },
  { id: '5', name: 'בריאות', order: 5 }
];

export default function SettingsPage() {
  const [maxGroupMembers, setMaxGroupMembers] = useState(6);
  const [minAge, setMinAge] = useState(13);
  const [emptyGroupDays, setEmptyGroupDays] = useState(7);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const handleSaveSettings = () => {
    console.log('Saving settings:', {
      maxGroupMembers,
      minAge,
      emptyGroupDays
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      console.log('Adding category:', newCategoryName);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (id: string) => {
    console.log('Deleting category:', id);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">הגדרות מערכת</h1>
        <p className="text-gray-400 mt-2">ניהול הגדרות כלליות ותצורת המערכת</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <SettingsIcon className="w-6 h-6 ml-3 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">הגדרות כלליות</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                מספר חברים מקסימלי בקבוצה
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={maxGroupMembers}
                onChange={(e) => setMaxGroupMembers(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">ברירת מחדל: 6</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                גיל מינימלי להרשמה
              </label>
              <input
                type="number"
                min="13"
                max="18"
                value={minAge}
                onChange={(e) => setMinAge(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">ברירת מחדל: 13</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ימים לפני מחיקת קבוצה ריקה
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={emptyGroupDays}
                onChange={(e) => setEmptyGroupDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">ברירת מחדל: 7</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveSettings}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              שמור הגדרות
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-white mb-6">ניהול קטגוריות</h2>

          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="שם קטגוריה חדשה..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddCategory}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הוסף
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">#{category.order}</span>
                  {editingCategory === category.id ? (
                    <input
                      type="text"
                      defaultValue={category.name}
                      className="px-2 py-1 bg-gray-600 border border-gray-500 text-white rounded focus:ring-2 focus:ring-blue-500"
                      onBlur={() => setEditingCategory(null)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setEditingCategory(null);
                        }
                      }}
                    />
                  ) : (
                    <span className="font-medium text-white">{category.name}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(category.id)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-white mb-6">תנאי שימוש ומדיניות</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                תנאי שימוש
              </label>
              <textarea
                rows={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="תנאי השימוש של האפליקציה..."
                defaultValue="ברוכים הבאים לאפליקציית חבר מחויבות. השימוש באפליקציה כפוף לתנאים הבאים..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                מדיניות פרטיות
              </label>
              <textarea
                rows={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="מדיניות הפרטיות של האפליקציה..."
                defaultValue="אנו מתחייבים לשמור על פרטיותכם. מדיניות זו מסבירה כיצד אנו אוספים ומשתמשים במידע..."
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="font-medium text-white">גרסה נוכחית</div>
                <div className="text-sm text-gray-400">v1.2.3 - עודכן ב-15/01/2024</div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                עדכן תנאים
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-white mb-6">הודעות ברירת מחדל</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                הודעת ברוכים הבאים
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="ברוכים הבאים לחבר מחויבות! אנחנו שמחים שהצטרפתם אלינו."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                הודעת תזכורת יומית
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="זכרו לבצע את המחויבות שלכם היום! החברים שלכם סומכים עליכם."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                הודעת עידוד
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="כל הכבוד! המשיכו כך והצלחה רבה!"
              />
            </div>
          </div>

          <div className="mt-6">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />
              שמור הודעות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}