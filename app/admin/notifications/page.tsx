'use client';

import { useState, useEffect } from 'react';
import { Send, Clock, Users, User, Target, History, Check, Loader2 } from 'lucide-react';
import { getAllUsers, getAllGroups } from '../../lib/firestore';

const notificationHistory = [
  {
    id: '1',
    title: 'עדכון מערכת',
    content: 'המערכת תעבור שדרוג הלילה',
    type: 'כללי',
    recipients: 1234,
    clicks: 456,
    sentAt: '2024-01-15 10:30',
    status: 'נשלח'
  },
  {
    id: '2',
    title: 'תזכורת Check-in',
    content: 'זכרו לבצע Check-in היום!',
    type: 'קבוצה ספציפית',
    recipients: 89,
    clicks: 67,
    sentAt: '2024-01-14 08:00',
    status: 'נשלח'
  }
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('send');
  const [notificationType, setNotificationType] = useState('general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [targetGroup, setTargetGroup] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [usersData, groupsData] = await Promise.all([
        getAllUsers(),
        getAllGroups()
      ]);
      console.log('📊 Loaded users:', usersData.length);
      console.log('📊 Users with pushToken:', usersData.filter((u: any) => u.pushToken).length);
      console.log('📊 Loaded groups:', groupsData.length);
      setUsers(usersData);
      setGroups(groupsData);
    }
    loadData();
  }, []);

  const handleSendNotification = async () => {
    if (!title.trim() || !content.trim()) {
      alert('נא למלא כותרת ותוכן');
      return;
    }

    if (isScheduled && !scheduledTime) {
      alert('נא לבחור תאריך ושעה לתזמון');
      return;
    }

    setLoading(true);
    try {
      let targetData: any = { type: notificationType };

      if (notificationType === 'group' && targetGroup) {
        targetData.groupId = targetGroup;
      } else if (notificationType === 'user' && targetUser) {
        targetData.userId = targetUser;
      }

      if (isScheduled) {
        // Save scheduled notification
        const response = await fetch('/api/schedule-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            body: content,
            link: link || '',
            scheduledTime: new Date(scheduledTime).getTime(),
            target: targetData
          })
        });

        if (!response.ok) throw new Error('Failed to schedule');
        alert('ההתראה תוזמנה בהצלחה!');
      } else {
        // Send immediately
        let tokens: string[] = [];

        if (notificationType === 'general') {
          tokens = users.map((u: any) => u.pushToken).filter((t: any) => t);
        } else if (notificationType === 'group' && targetGroup) {
          const group = groups.find(g => g.id === targetGroup);
          if (group) {
            tokens = users
              .filter((u: any) => group.memberIds?.includes(u.id))
              .map((u: any) => u.pushToken)
              .filter((t: any) => t);
          }
        } else if (notificationType === 'user' && targetUser) {
          const user = users.find(u => u.id === targetUser);
          if (user?.pushToken) {
            tokens = [user.pushToken];
          }
        }

        if (tokens.length === 0) {
          alert('לא נמצאו משתמשים עם push tokens');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/send-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokens,
            title,
            body: content,
            data: { link: link || '' }
          })
        });

        if (!response.ok) throw new Error('Failed to send');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        setTitle('');
        setContent('');
        setLink('');
        setScheduledTime('');
        setTargetGroup('');
        setTargetUser('');
      }, 1500);
    } catch (error) {
      alert('שגיאה בשליחת ההתראה');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">ניהול התראות</h1>
        <p className="text-gray-400 mt-2">שליחת התראות והודעות למשתמשים</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <Send className="w-4 h-4 inline ml-2" />
              שליחת התראה
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <History className="w-4 h-4 inline ml-2" />
              היסטוריית התראות
            </button>
          </nav>
        </div>

        {activeTab === 'send' && (
          <div className="p-6">
            <div className="max-w-2xl">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  סוג התראה
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setNotificationType('general')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center ${
                      notificationType === 'general'
                        ? 'border-blue-500 bg-blue-900 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 text-gray-400'
                    }`}
                  >
                    <Users className="w-6 h-6 mb-1" />
                    <span className="text-sm">כללי</span>
                  </button>
                  <button
                    onClick={() => setNotificationType('group')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center ${
                      notificationType === 'group'
                        ? 'border-blue-500 bg-blue-900 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 text-gray-400'
                    }`}
                  >
                    <Target className="w-6 h-6 mb-1" />
                    <span className="text-sm">קבוצה</span>
                  </button>
                  <button
                    onClick={() => setNotificationType('user')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center ${
                      notificationType === 'user'
                        ? 'border-blue-500 bg-blue-900 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 text-gray-400'
                    }`}
                  >
                    <User className="w-6 h-6 mb-1" />
                    <span className="text-sm">משתמש</span>
                  </button>
                  <button
                    onClick={() => setNotificationType('criteria')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center ${
                      notificationType === 'criteria'
                        ? 'border-blue-500 bg-blue-900 text-blue-300'
                        : 'border-gray-600 hover:border-gray-500 text-gray-400'
                    }`}
                  >
                    <Target className="w-6 h-6 mb-1" />
                    <span className="text-sm">קריטריונים</span>
                  </button>
                </div>
              </div>

              {notificationType === 'group' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    בחר קבוצה
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">בחר קבוצה...</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.description || g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {notificationType === 'user' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    בחר משתמש
                  </label>
                  <select
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">בחר משתמש...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  כותרת
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="כותרת ההתראה..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  תוכן
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="תוכן ההתראה..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  קישור (אופציונלי)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  תזמון
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center text-gray-300">
                    <input
                      type="radio"
                      name="timing"
                      checked={!isScheduled}
                      onChange={() => setIsScheduled(false)}
                      className="ml-2"
                    />
                    שליחה מיידית
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input
                      type="radio"
                      name="timing"
                      checked={isScheduled}
                      onChange={() => setIsScheduled(true)}
                      className="ml-2"
                    />
                    תזמון
                  </label>
                </div>
                {isScheduled && (
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>

              <div className="relative">
                {loading && !success && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {success && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleSendNotification}
                  disabled={loading || success}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {isScheduled ? 'תזמן התראה' : 'שלח התראה'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">התראה</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">סוג</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">נמענים</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">לחיצות</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">תאריך שליחה</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {notificationHistory.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {notification.content.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {notification.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {notification.recipients.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {notification.clicks} ({Math.round((notification.clicks / notification.recipients) * 100)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {notification.sentAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-900 text-green-300">
                          {notification.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
