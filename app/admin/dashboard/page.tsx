'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, CheckCircle, TrendingUp } from 'lucide-react';
import { getDashboardStats, getRecentActivity, getPopularGroups } from '../../lib/firestore';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGroups: 0,
    todayCheckIns: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [popularGroups, setPopularGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, activityData, groupsData] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(4),
          getPopularGroups(4)
        ]);
        console.log('Stats data:', statsData);
        setStats(statsData);
        setRecentActivity(activityData);
        setPopularGroups(groupsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const statsDisplay = [
    {
      title: 'סה"כ משתמשים',
      value: stats.totalUsers.toString(),
      icon: Users
    },
    {
      title: 'משתמשים פעילים',
      value: stats.activeUsers.toString(),
      icon: UserCheck
    },
    {
      title: 'Check-ins היום',
      value: stats.todayCheckIns.toString(),
      icon: CheckCircle
    },
    {
      title: 'קבוצות פעילות',
      value: stats.totalGroups.toString(),
      icon: TrendingUp
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">דשבורד ניהול</h1>
        <p className="text-gray-400 mt-2">סקירה כללית של המערכת</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>

                </div>
                <div className="p-3 bg-blue-900 rounded-full">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">פעילות אחרונה</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => {
              const actionTypes: Record<string, string> = {
                'user_registered': 'משתמש חדש נרשם',
                'user_joined': 'משתמש הצטרף לקבוצה',
                'group_created': 'קבוצה חדשה נוצרה',
                'checkin': 'Check-in בוצע',
                'encouragement': 'עידוד נשלח',
                'user_left': 'משתמש עזב קבוצה'
              };
              const actionText = actionTypes[activity.type] || activity.type;
              
              const timeAgo = Math.floor((Date.now() - activity.timestamp) / 60000);
              const timeText = timeAgo < 60 ? `${timeAgo} דקות` : `${Math.floor(timeAgo / 60)} שעות`;
              
              return (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-white">{actionText}</p>
                    <p className="text-sm text-gray-400">{activity.userName}</p>
                  </div>
                  <span className="text-xs text-gray-500">לפני {timeText}</span>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-400">אין פעילות אחרונה</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">קבוצות פופולריות</h3>
          <div className="space-y-4">
            {popularGroups.length > 0 ? popularGroups.map((group, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-white">{group.description || 'ללא שם'}</p>
                  <p className="text-sm text-gray-400">{group.category}</p>
                </div>
                <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
                  {group.memberIds?.length || 0} חברים
                </span>
              </div>
            )) : (
              <p className="text-sm text-gray-400">אין קבוצות</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}