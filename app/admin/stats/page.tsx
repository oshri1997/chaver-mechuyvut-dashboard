'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getStatistics, getDashboardStats } from '../../lib/firestore';

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, dashboardData] = await Promise.all([
          getStatistics(),
          getDashboardStats()
        ]);
        setStats(statsData);
        setWeeklyStats(dashboardData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="text-white">טוען סטטיסטיקות...</div>;
  }

  if (!stats) {
    return <div className="text-white">שגיאה בטעינת נתונים</div>;
  }
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">סטטיסטיקות ואנליטיקה</h1>
        <p className="text-gray-400 mt-2">מבט מעמיק על נתוני המערכת</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-400">סה"כ משתמשים</p>
          <p className="text-2xl font-bold text-white">{weeklyStats?.totalUsers || 0}</p>
          <p className="text-sm text-green-400">
            {weeklyStats?.usersChange || '+0%'} ({weeklyStats?.usersDiff >= 0 ? '+' : ''}{weeklyStats?.usersDiff || 0} משבוע שעבר)
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-400">משתמשים פעילים</p>
          <p className="text-2xl font-bold text-white">{weeklyStats?.activeUsers || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-400">קבוצות פעילות</p>
          <p className="text-2xl font-bold text-white">{weeklyStats?.totalGroups || 0}</p>
          <p className="text-sm text-green-400">
            {weeklyStats?.groupsChange || '+0%'} ({weeklyStats?.groupsDiff >= 0 ? '+' : ''}{weeklyStats?.groupsDiff || 0} משבוע שעבר)
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-400">Check-ins היום</p>
          <p className="text-2xl font-bold text-white">{weeklyStats?.todayCheckIns || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">צמיחת משתמשים</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Check-ins יומיים</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.checkInsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="checkins" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">התפלגות קטגוריות</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.categoriesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.categoriesData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">התפלגות גילאים</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ageDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top 10 - Streak הכי ארוך</h3>
          <div className="space-y-3">
            {stats.topUsers.length > 0 ? stats.topUsers.map((user: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center ml-3">
                    <span className="text-sm font-medium text-white">{user.avatar}</span>
                  </div>
                  <span className="font-medium text-white">{user.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-orange-400">{user.streak}</span>
                  <span className="text-sm text-gray-400 mr-1">ימים</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400">אין נתונים</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-white mb-4">קבוצות פעילות ביותר</h3>
          <div className="space-y-3">
            {stats.topGroups.length > 0 ? stats.topGroups.map((group: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-white">{group.name}</div>
                  <div className="text-sm text-gray-400">{group.category}</div>
                </div>
                <span className="text-lg font-bold text-green-400">{group.activity}%</span>
              </div>
            )) : (
              <p className="text-sm text-gray-400">אין נתונים</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}