'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Ban, Crown, Mail, Users } from 'lucide-react';
import { getAllUsers, blockUser } from '../../lib/firestore';
import EditUserModal from '../../components/EditUserModal';
import ChangeRoleModal from '../../components/ChangeRoleModal';
import DeleteUserModal from '../../components/DeleteUserModal';
import SendNotificationModal from '../../components/SendNotificationModal';



export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [editUser, setEditUser] = useState<any>(null);
  const [roleUser, setRoleUser] = useState<any>(null);
  const [deleteUserModal, setDeleteUserModal] = useState<any>(null);
  const [notificationUser, setNotificationUser] = useState<any>(null);
  const [blockUserModal, setBlockUserModal] = useState<any>(null);
  const [viewGroupsUser, setViewGroupsUser] = useState<any>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);

  const loadUserGroups = async (user: any) => {
    const { getAllGroups } = await import('../../lib/firestore');
    const allGroups = await getAllGroups();
    const groups = allGroups.filter(g => user.groupIds?.includes(g.id));
    setUserGroups(groups);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      const formattedUsers = data.map((user: any) => ({
        id: user.id,
        authId: user.authId,
        name: user.name || 'ללא שם',
        email: user.email || '',
        age: user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : 0,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        groups: user.groupIds?.length || 0,
        status: user.isBlocked ? 'חסום' : (user.groupIds?.length > 0 ? 'פעיל' : 'לא פעיל'),
        role: user.role || 'user',
        pushToken: !!user.pushToken,
        isBlocked: user.isBlocked || false,
        groupIds: user.groupIds || []
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchTerm) || user.email.includes(searchTerm);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="text-white">טוען משתמשים...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">ניהול משתמשים</h1>
        <p className="text-gray-400 mt-2">ניהול וצפייה בכל המשתמשים במערכת</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="חיפוש לפי שם או אימייל..."
              className="w-full pr-10 pl-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="all">כל התפקידים</option>
              <option value="admin">מנהל</option>
              <option value="moderator">מנהל משנה</option>
              <option value="user">משתמש</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              סינון
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  משתמש
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  גיל
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  תאריך הצטרפות
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  קבוצות
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  תפקיד
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="mr-4">
                        <div className="text-sm font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(user.joinDate).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.groups}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'חסום'
                        ? 'bg-red-900 text-red-300'
                        : user.status === 'פעיל' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'moderator'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'מנהל' : user.role === 'moderator' ? 'מנהל משנה' : 'משתמש'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setEditUser(user)}
                        className="text-blue-400 hover:text-blue-300"
                        title="עריכת פרטים"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={async () => {
                          setViewGroupsUser(user);
                          await loadUserGroups(user);
                        }}
                        className="text-cyan-400 hover:text-cyan-300"
                        title="צפייה בקבוצות"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setNotificationUser(user)}
                        className="text-green-400 hover:text-green-300"
                        title="שליחת התראה"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setRoleUser(user)}
                        className="text-purple-400 hover:text-purple-300"
                        title="שינוי תפקיד"
                      >
                        <Crown className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setBlockUserModal(user)}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="חסימה/ביטול חסימה"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setDeleteUserModal(user)}
                        className="text-red-400 hover:text-red-300"
                        title="מחיקת משתמש"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-sm text-gray-400">סה"כ משתמשים</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-400">
            {users.filter(u => u.status === 'פעיל').length}
          </div>
          <div className="text-sm text-gray-400">משתמשים פעילים</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-400">
            {users.filter(u => u.role === 'moderator').length}
          </div>
          <div className="text-sm text-gray-400">מנהלי משנה</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-400">
            {users.filter(u => u.pushToken).length}
          </div>
          <div className="text-sm text-gray-400">עם התראות</div>
        </div>
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={loadUsers}
        />
      )}

      {roleUser && (
        <ChangeRoleModal
          user={roleUser}
          onClose={() => setRoleUser(null)}
          onSuccess={loadUsers}
        />
      )}

      {deleteUserModal && (
        <DeleteUserModal
          user={deleteUserModal}
          onClose={() => setDeleteUserModal(null)}
          onSuccess={loadUsers}
        />
      )}

      {notificationUser && (
        <SendNotificationModal
          user={notificationUser}
          onClose={() => setNotificationUser(null)}
        />
      )}

      {blockUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setBlockUserModal(null)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">
              {blockUserModal.isBlocked ? 'ביטול חסימה' : 'חסימת משתמש'}
            </h3>
            <p className="text-gray-300 mb-6">
              {blockUserModal.isBlocked 
                ? `האם אתה בטוח שברצונך לבטל את החסימה של ${blockUserModal.name}?`
                : `האם אתה בטוח שברצונך לחסום את ${blockUserModal.name}? המשתמש לא יוכל להתחבר למערכת.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await blockUser(blockUserModal.id, !blockUserModal.isBlocked);
                  setBlockUserModal(null);
                  loadUsers();
                }}
                className={`flex-1 py-2 rounded-lg ${
                  blockUserModal.isBlocked 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {blockUserModal.isBlocked ? 'בטל חסימה' : 'חסום'}
              </button>
              <button
                onClick={() => setBlockUserModal(null)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {viewGroupsUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setViewGroupsUser(null)}>
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">
              קבוצות של {viewGroupsUser.name}
            </h3>
            {userGroups.length > 0 ? (
              <div className="space-y-3">
                {userGroups.map(group => (
                  <div key={group.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{group.description || group.name}</div>
                      <div className="text-sm text-gray-400">
                        {group.category} • {group.memberIds?.length || 0} חברים
                      </div>
                    </div>
                    <span className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full">
                      {group.status || 'פעיל'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                המשתמש לא חבר בשום קבוצה
              </div>
            )}
            <button
              onClick={() => setViewGroupsUser(null)}
              className="w-full mt-6 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
            >
              סגור
            </button>
          </div>
        </div>
      )}
    </div>
  );
}