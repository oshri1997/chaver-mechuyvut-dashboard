'use client';

import { useState, useEffect } from 'react';
import { Search, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { getAllUsers } from '../../../lib/firestore';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';

export default function AnalyzeUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [suspiciousUsers, setSuspiciousUsers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const usersData = await getAllUsers();
    const reportsSnapshot = await getDocs(collection(db, 'reports'));
    const reports = reportsSnapshot.docs.map(doc => doc.data());

    // Find users with multiple reports
    const userReportCount: any = {};
    reports.forEach(report => {
      const userId = report.reportedUserId;
      if (userId) {
        userReportCount[userId] = (userReportCount[userId] || 0) + 1;
      }
    });

    const suspicious = usersData
      .map((user: any) => ({
        ...user,
        reportCount: userReportCount[user.id] || 0
      }))
      .filter((user: any) => user.reportCount >= 2 || user.isBlocked)
      .sort((a: any, b: any) => b.reportCount - a.reportCount);

    setUsers(usersData);
    setSuspiciousUsers(suspicious);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">ניתוח משתמשים</h1>
          <p className="text-gray-400 mt-2">זיהוי משתמשים בעייתיים</p>
        </div>
        <Link href="/admin/moderation" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          חזרה למודרציה
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
          <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{suspiciousUsers.length}</div>
          <div className="text-red-100 text-sm">משתמשים חשודים</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">
            {suspiciousUsers.filter(u => u.reportCount >= 3).length}
          </div>
          <div className="text-yellow-100 text-sm">3+ דוחות</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <Search className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{users.length}</div>
          <div className="text-blue-100 text-sm">סה"כ משתמשים</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-white mb-4">משתמשים חשודים</h2>
        <div className="space-y-3">
          {suspiciousUsers.map(user => (
            <div key={user.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user.name?.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{user.reportCount}</div>
                  <div className="text-xs text-gray-400">דוחות</div>
                </div>
                {user.isBlocked && (
                  <span className="bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm">
                    חסום
                  </span>
                )}
              </div>
            </div>
          ))}
          {suspiciousUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              לא נמצאו משתמשים חשודים
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
