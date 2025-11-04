'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getGroupMembers } from '../lib/firestore';

interface GroupDetailsModalProps {
  group: any;
  onClose: () => void;
}

export default function GroupDetailsModal({ group, onClose }: GroupDetailsModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await getGroupMembers(group.id);
        setMembers(data);
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [group.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">פרטי קבוצה</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">שם הקבוצה</p>
              <p className="text-white font-medium">{group.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">קטגוריה</p>
              <p className="text-white font-medium">{group.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">יוצר</p>
              <p className="text-white font-medium">{group.creator}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">חברים</p>
              <p className="text-white font-medium">{group.members}/{group.maxMembers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">זמן מחויבות</p>
              <p className="text-white font-medium">{group.commitmentTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">טווח גילאים</p>
              <p className="text-white font-medium">{group.ageRange}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">ימי פעילות</p>
            <div className="flex gap-2">
              {group.activeDays?.map((day: string) => (
                <span key={day} className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm">
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-3">חברי הקבוצה ({members.length})</h4>
            {loading ? (
              <p className="text-gray-400">טוען...</p>
            ) : members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div>
                      <p className="text-white font-medium">{member.userName}</p>
                      <p className="text-sm text-gray-400">
                        הצטרף: {new Date(member.joinedAt).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">אין חברים בקבוצה</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}