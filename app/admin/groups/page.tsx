'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Users, Eye, Plus, Minus, PlusCircle } from 'lucide-react';
import { getAllGroups, deleteGroup } from '../../lib/firestore';
import GroupDetailsModal from '../../components/GroupDetailsModal';
import EditGroupModal from '../../components/EditGroupModal';
import CreateGroupModal from '../../components/CreateGroupModal';

const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

const categories = ['כל הקטגוריות', 'ספורט', 'לימוד', 'תפילה', 'חברתי', 'בריאות'];
const statuses = ['כל הסטטוסים', 'פעילה', 'מלאה', 'ארכיון'];

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('כל הקטגוריות');
  const [selectedStatus, setSelectedStatus] = useState('כל הסטטוסים');
  const [detailsGroup, setDetailsGroup] = useState<any>(null);
  const [editGroup, setEditGroup] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await getAllGroups();
      const formattedGroups = data.map(group => {
        const members = group.memberIds?.length || 0;
        const maxMembers = group.maxMembers || 6;
        return {
          id: group.id,
          name: group.description || 'ללא שם',
          category: group.category || 'כללי',
          creator: group.createdBy || 'לא ידוע',
          members,
          maxMembers,
          createdAt: group.createdAt ? new Date(group.createdAt).toISOString().split('T')[0] : '',
          commitmentTime: '08:00',
          activeDays: group.activeDays?.map((d: number) => dayNames[d]) || [],
          ageRange: `${group.minAge || 18}-${group.maxAge || 99}`,
          status: members >= maxMembers ? 'מלאה' : 'פעילה'
        };
      });
      setGroups(formattedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.includes(searchTerm) || group.creator.includes(searchTerm);
    const matchesCategory = selectedCategory === 'כל הקטגוריות' || group.category === selectedCategory;
    const matchesStatus = selectedStatus === 'כל הסטטוסים' || group.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'פעילה': return 'bg-green-900 text-green-300';
      case 'מלאה': return 'bg-yellow-900 text-yellow-300';
      case 'ארכיון': return 'bg-gray-700 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) {
    return <div className="text-white">טוען קבוצות...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">ניהול קבוצות</h1>
          <p className="text-gray-400 mt-2">ניהול וצפייה בכל הקבוצות במערכת</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          קבוצה חדשה
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="חיפוש לפי שם קבוצה או יוצר..."
              className="w-full pr-10 pl-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              סינון
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">קבוצה</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">יוצר</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">חברים</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">זמן מחויבות</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">ימים</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">סטטוס</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">פעולות</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{group.name}</div>
                      <div className="text-sm text-gray-400">{group.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{group.creator}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 ml-1" />
                      {group.members}/{group.maxMembers}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{group.commitmentTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex gap-1">
                      {group.activeDays.map(day => (
                        <span key={day} className="px-1 py-0.5 bg-blue-900 text-blue-300 text-xs rounded">{day}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(group.status)}`}>
                      {group.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setDetailsGroup(group)}
                        className="text-blue-400 hover:text-blue-300"
                        title="צפייה בפרטים"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setEditGroup(group)}
                        className="text-green-400 hover:text-green-300"
                        title="עריכה"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm(`האם למחוק את הקבוצה ${group.name}?`)) {
                            await deleteGroup(group.id);
                            loadGroups();
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="מחיקה"
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

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-white">{groups.length}</div>
          <div className="text-sm text-gray-400">סה"כ קבוצות</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-400">{groups.filter(g => g.status === 'פעילה').length}</div>
          <div className="text-sm text-gray-400">קבוצות פעילות</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-400">{groups.filter(g => g.status === 'מלאה').length}</div>
          <div className="text-sm text-gray-400">קבוצות מלאות</div>
        </div>
        <div className="bg-gray-800 rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-400">{groups.length > 0 ? Math.round(groups.reduce((acc, g) => acc + g.members, 0) / groups.length * 10) / 10 : 0}</div>
          <div className="text-sm text-gray-400">ממוצע חברים</div>
        </div>
      </div>

      {detailsGroup && (
        <GroupDetailsModal
          group={detailsGroup}
          onClose={() => setDetailsGroup(null)}
        />
      )}

      {editGroup && (
        <EditGroupModal
          group={editGroup}
          onClose={() => setEditGroup(null)}
          onSuccess={loadGroups}
        />
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadGroups}
        />
      )}
    </div>
  );
}