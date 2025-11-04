'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Users, UserCheck, BarChart3, Bell, 
  FileText, Settings, Shield, LogOut 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const menuItems = [
  { href: '/admin/dashboard', icon: Home, label: 'דשבורד' },
  { href: '/admin/users', icon: Users, label: 'משתמשים' },
  { href: '/admin/groups', icon: UserCheck, label: 'קבוצות' },
  { href: '/admin/stats', icon: BarChart3, label: 'סטטיסטיקות' },
  { href: '/admin/notifications', icon: Bell, label: 'התראות' },
  { href: '/admin/reports', icon: FileText, label: 'דוחות' },
  { href: '/admin/moderation', icon: Shield, label: 'מודרציה' },
  { href: '/admin/settings', icon: Settings, label: 'הגדרות' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState({ name: '', email: '' });
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      setAdmin(JSON.parse(stored));
    }

    // Listen to pending reports
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingReports(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  return (
    <div className="w-64 bg-gray-900 shadow-lg h-screen fixed right-0 top-0 z-10">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">חבר מחויבות</h1>
        <p className="text-sm text-gray-400">ניהול מערכת</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-blue-400 transition-colors ${
                isActive ? 'bg-gray-800 text-blue-400 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 ml-3" />
                {item.label}
              </div>
              {item.href === '/admin/reports' && pendingReports > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingReports}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-full border-t border-gray-800">
        <div className="p-4 bg-gray-800">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center ml-3">
              <span className="text-white font-bold">{admin.name.charAt(0)}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">{admin.name}</div>
              <div className="text-xs text-gray-400">{admin.email}</div>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center px-6 py-3 text-gray-300 hover:text-red-400 transition-colors">
          <LogOut className="w-5 h-5 ml-3" />
          יציאה
        </button>
      </div>
    </div>
  );
}