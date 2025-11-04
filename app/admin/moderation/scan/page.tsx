'use client';

import { useState } from 'react';
import { Shield, Play, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showComingSoon, setShowComingSoon] = useState(true);

  const handleScan = async () => {
    setScanning(true);
    
    setTimeout(() => {
      setResults({
        totalScanned: 150,
        flagged: 3,
        clean: 147,
        issues: [
          { type: 'הודעה', content: 'תוכן חשוד...', severity: 'high' },
          { type: 'תמונה', content: 'תמונה לא הולמת', severity: 'medium' },
          { type: 'פרופיל', content: 'שם משתמש פוגעני', severity: 'low' }
        ]
      });
      setScanning(false);
    }, 3000);
  };

  return (
    <div className="relative">
      {showComingSoon && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-700">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">בקרוב...</h2>
              <p className="text-gray-300 text-lg mb-6">
                תכונת הסריקה האוטומטית תהיה זמינה בקרוב
              </p>
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">תכונות עתידיות:</p>
                <ul className="text-sm text-gray-300 space-y-1 text-right">
                  <li>• זיהוי תוכן לא הולם</li>
                  <li>• סריקת תמונות אוטומטית</li>
                  <li>• זיהוי שפה פוגענית</li>
                  <li>• דוחות מפורטים</li>
                </ul>
              </div>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                הבנתי
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">סריקת תוכן אוטומטית</h1>
          <p className="text-gray-400 mt-2">בדיקה אוטומטית של תוכן במערכת</p>
        </div>
        <Link href="/admin/moderation" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          חזרה למודרציה
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">סריקת תוכן</h2>
          <p className="text-gray-400 mb-6">
            הסריקה תבדוק הודעות, תמונות ופרופילים לאיתור תוכן לא הולם
          </p>
          
          <button
            onClick={handleScan}
            disabled={scanning}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {scanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                סורק...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                התחל סריקה
              </>
            )}
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold mb-1">{results.totalScanned}</div>
              <div className="text-blue-100 text-sm">פריטים נסרקו</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold mb-1">{results.flagged}</div>
              <div className="text-red-100 text-sm">דגולים לבדיקה</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
              <div className="text-3xl font-bold mb-1">{results.clean}</div>
              <div className="text-green-100 text-sm">תקינים</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-white mb-4">פריטים דגולים</h3>
            <div className="space-y-3">
              {results.issues.map((issue: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      issue.severity === 'high' ? 'text-red-400' :
                      issue.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`} />
                    <div>
                      <div className="font-medium text-white">{issue.type}</div>
                      <div className="text-sm text-gray-400">{issue.content}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    issue.severity === 'high' ? 'bg-red-900 text-red-300' :
                    issue.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {issue.severity === 'high' ? 'גבוה' : issue.severity === 'medium' ? 'בינוני' : 'נמוך'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
