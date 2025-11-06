'use client';

import { useState, useEffect } from 'react';
import { Shield, Ban, CheckCircle, Clock, MessageSquare, Users, Search, AlertTriangle } from 'lucide-react';
import { getAllUsers, blockUser } from '../../lib/firestore';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, addDoc } from 'firebase/firestore';

export default function ModerationPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    blockedUsers: 0,
    todayActions: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [usersData, reportsSnapshot] = await Promise.all([
      getAllUsers(),
      getDocs(collection(db, 'reports'))
    ]);

    const reports = reportsSnapshot.docs.map(doc => doc.data());
    
    setUsers(usersData);
    setStats({
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      blockedUsers: usersData.filter((u: any) => u.isBlocked).length,
      todayActions: reports.filter(r => {
        const today = new Date().setHours(0, 0, 0, 0);
        return r.reviewedAt && r.reviewedAt >= today;
      }).length
    });

    // Load recent activity
    const activityRef = collection(db, 'moderation_log');
    const q = query(activityRef, orderBy('timestamp', 'desc'), limit(10));
    const activitySnapshot = await getDocs(q);
    setRecentActivity(activitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    await blockUser(userId, block);
    
    // Log the action
    const user = users.find(u => u.id === userId);
    await addDoc(collection(db, 'moderation_log'), {
      action: block ? 'user_blocked' : 'user_unblocked',
      description: block ? `חסם את ${user?.name}` : `ביטל חסימה של ${user?.name}`,
      targetUserId: userId,
      timestamp: Date.now()
    });
    
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-r-purple-600 border-b-transparent border-l-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
          </div>
          <p className="text-xl font-semibold text-white mb-2">טוען נתונים...</p>
          <p className="text-gray-400 text-sm">אנא המתן</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">מודרציה</h1>
        <p className="text-gray-400 mt-2">ניהול תוכן ומשתמשים</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalReports}</div>
          <div className="text-blue-100 text-sm">סך דוחות</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.pendingReports}</div>
          <div className="text-yellow-100 text-sm">ממתין לטיפול</div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Ban className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.blockedUsers}</div>
          <div className="text-red-100 text-sm">משתמשים חסומים</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.todayActions}</div>
          <div className="text-green-100 text-sm">פעולות היום</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            משתמשים חסומים
          </h2>
          <div className="space-y-3">
            {users.filter(u => u.isBlocked).map(user => (
              <div key={user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
                <button
                  onClick={() => handleBlockUser(user.id, false)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  בטל חסימה
                </button>
              </div>
            ))}
            {users.filter(u => u.isBlocked).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                אין משתמשים חסומים
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            פעילות אחרונה
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity: any) => {
              const actionTypes: Record<string, string> = {
                'report_approved': 'אישור דוח',
                'report_rejected': 'דחיית דוח',
                'user_blocked': 'חסימת משתמש',
                'user_unblocked': 'ביטול חסימה'
              };
              const actionText = actionTypes[activity.action] || activity.action;
              
              return (
                <div key={activity.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{actionText}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString('he-IL')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{activity.description}</p>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                אין פעילות אחרונה
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-bold text-white mb-4">כלי מודרציה</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/admin/moderation/scan'}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            סריקת תוכן אוטומטית
          </button>
          <button 
            onClick={() => window.location.href = '/admin/moderation/messages'}
            className="bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            בדיקת הודעות
          </button>
          <button 
            onClick={() => window.location.href = '/admin/moderation/analyze'}
            className="bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            ניתוח משתמשים
          </button>
        </div>
      </div>
    </div>
  );
}
