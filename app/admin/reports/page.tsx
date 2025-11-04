'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, User, MessageSquare, Image, CheckCircle, XCircle, Eye } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc } from 'firebase/firestore';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filter, setFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleAction = async (reportId: string, action: 'approved' | 'rejected') => {
    const report = reports.find(r => r.id === reportId);
    
    await updateDoc(doc(db, 'reports', reportId), {
      status: action,
      reviewedAt: Date.now()
    });

    // Log the action
    await addDoc(collection(db, 'moderation_log'), {
      action: action === 'approved' ? 'report_approved' : 'report_rejected',
      description: action === 'approved' 
        ? `אישר דוח על ${report?.reportedUserName || 'משתמש'}` 
        : `דחה דוח על ${report?.reportedUserName || 'משתמש'}`,
      reportId: reportId,
      timestamp: Date.now()
    });

    loadReports();
    setSelectedReport(null);
  };

  const filteredReports = reports.filter(r => 
    filter === 'all' ? true : r.status === filter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-5 h-5" />;
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-900 text-yellow-300',
      approved: 'bg-green-900 text-green-300',
      rejected: 'bg-red-900 text-red-300'
    };
    return styles[status as keyof typeof styles] || styles.pending;
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
          <p className="text-xl font-semibold text-white mb-2">טוען דוחות...</p>
          <p className="text-gray-400 text-sm">אנא המתן</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">דוחות ומודרציה</h1>
        <p className="text-gray-400 mt-2">ניהול דוחות משתמשים ותוכן</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow mb-6 p-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            ממתין לטיפול ({reports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            אושר
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            נדחה
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            הכל
          </button>
        </div>

        <div className="space-y-4">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-yellow-400">
                  {getTypeIcon(report.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">{report.reportedUserName || 'משתמש'}</span>
                    <span className="text-sm text-gray-400">• {report.reasonText || report.reason || 'תוכן לא הולם'}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(report.status)}`}>
                      {report.status === 'pending' ? 'ממתין' : report.status === 'approved' ? 'אושר' : 'נדחה'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    דווח על ידי: {report.reporterName || 'משתמש'} • {new Date(report.createdAt).toLocaleDateString('he-IL')}
                  </p>
                  {report.description && (
                    <p className="text-sm text-gray-300 mt-2">
                      <span className="font-medium">תיאור:</span> {report.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(report.id, 'approved')}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'rejected')}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              אין דוחות להצגה
            </div>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedReport(null)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">פרטי דוח</h3>
            <div className="space-y-3 text-gray-300">
              <p><strong>סוג:</strong> {selectedReport.type}</p>
              <p><strong>דווח על:</strong> {selectedReport.reportedUserName || 'לא ידוע'}</p>
              <p><strong>סיבה:</strong> {selectedReport.reasonText || selectedReport.reason}</p>
              <p><strong>תיאור:</strong> {selectedReport.description || 'אין'}</p>
              <p><strong>דווח על ידי:</strong> {selectedReport.reporterName}</p>
              <p><strong>תאריך:</strong> {new Date(selectedReport.createdAt).toLocaleString('he-IL')}</p>
              <p><strong>סטטוס:</strong> {selectedReport.status}</p>
            </div>
            <div className="flex gap-3 mt-6">
              {selectedReport.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction(selectedReport.id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                  >
                    אשר דוח
                  </button>
                  <button
                    onClick={() => handleAction(selectedReport.id, 'rejected')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                  >
                    דחה דוח
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
