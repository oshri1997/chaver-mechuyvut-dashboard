'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      <Sidebar />
      <main className="mr-64 p-8">
        {children}
      </main>
    </div>
  );
}