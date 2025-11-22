'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const admin = await loginAdmin(email, password);
      if (admin) {
        localStorage.setItem('adminUser', JSON.stringify(admin));
        router.push('/admin/dashboard');
      } else {
        setError('אימייל או סיסמה שגויים, או שאין לך הרשאות אדמין');
      }
    } catch (err: any) {
      if (err?.code === 'auth/invalid-credential') {
        setError('אימייל או סיסמה שגויים');
      } else if (err?.code === 'auth/user-not-found') {
        setError('משתמש לא קיים');
      } else if (err?.code === 'auth/wrong-password') {
        setError('סיסמה שגויה');
      } else if (err?.code === 'permission-denied') {
        setError('אין לך הרשאות אדמין');
      } else {
        setError('שגיאה בהתחברות. נסה שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-800">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">חבר מחויבות</h1>
        <p className="text-gray-400 text-center mb-8">דשבורד ניהול</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              אימייל
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              סיסמה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>
      </div>
    </div>
  );
}
