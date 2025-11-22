import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

interface User {
  id: string;
  name?: string;
  groupIds?: string[];
  createdAt?: number;
  birthDate?: string;
  [key: string]: any;
}

interface Group {
  id: string;
  memberIds?: string[];
  createdAt?: number;
  category?: string;
  description?: string;
  [key: string]: any;
}

interface CheckIn {
  id: string;
  completed?: boolean;
  date?: string;
  groupId?: string;
  [key: string]: any;
}

// Users
export async function getAllUsers(): Promise<User[]> {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as User[];
}

// Groups
export async function getAllGroups(): Promise<Group[]> {
  const groupsRef = collection(db, 'groups');
  const snapshot = await getDocs(groupsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Group[];
}

// Group Members
export async function getGroupMembers(groupId: string) {
  const membersRef = collection(db, 'group_members');
  const q = query(membersRef, where('groupId', '==', groupId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Daily Check-ins
export async function getDailyCheckIns(date?: string): Promise<CheckIn[]> {
  const checkinsRef = collection(db, 'daily_checkins');
  let q = query(checkinsRef);
  
  if (date) {
    q = query(checkinsRef, where('date', '==', date));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CheckIn[];
}

// User Group Stats
export async function getUserGroupStats(userId: string) {
  const statsRef = collection(db, 'user_group_stats');
  const q = query(statsRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Recent Activity
export async function getRecentActivity(limitCount = 10) {
  const activityRef = collection(db, 'activity_log');
  const q = query(activityRef, orderBy('timestamp', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Popular Groups
export async function getPopularGroups(limitCount = 5) {
  const groups = await getAllGroups();
  return groups
    .sort((a, b) => (b.memberIds?.length || 0) - (a.memberIds?.length || 0))
    .slice(0, limitCount);
}

// Dashboard Stats with percentages
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);

  const [users, groups, todayCheckins] = await Promise.all([
    getAllUsers(),
    getAllGroups(),
    getDailyCheckIns(today)
  ]);

  const activeUsers = users.filter(u => u.groupIds && u.groupIds.length > 0);
  
  // Calculate weekly changes
  const newUsersThisWeek = users.filter(u => u.createdAt && u.createdAt >= weekAgo).length;
  const newUsersLastWeek = users.filter(u => u.createdAt && u.createdAt >= twoWeeksAgo && u.createdAt < weekAgo).length;
  const usersDiff = newUsersThisWeek - newUsersLastWeek;
  const usersChangePercent = newUsersLastWeek > 0 ? ((usersDiff / newUsersLastWeek) * 100).toFixed(0) : '0';

  const newGroupsThisWeek = groups.filter(g => g.createdAt && g.createdAt >= weekAgo).length;
  const newGroupsLastWeek = groups.filter(g => g.createdAt && g.createdAt >= twoWeeksAgo && g.createdAt < weekAgo).length;
  const groupsDiff = newGroupsThisWeek - newGroupsLastWeek;
  const groupsChangePercent = newGroupsLastWeek > 0 ? ((groupsDiff / newGroupsLastWeek) * 100).toFixed(0) : '0';
  
  const result = {
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    totalGroups: groups.length,
    todayCheckIns: todayCheckins.filter(c => c.completed).length,
    usersChange: `${Number(usersChangePercent) >= 0 ? '+' : ''}${usersChangePercent}%`,
    groupsChange: `${Number(groupsChangePercent) >= 0 ? '+' : ''}${groupsChangePercent}%`,
    usersDiff,
    groupsDiff
  };
  
  return result;
}

// User Management
export async function updateUser(userId: string, data: any) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
}

export async function deleteUser(userId: string) {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
}

export async function updateUserRole(userId: string, role: string) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role });
}

export async function blockUser(userId: string, blocked: boolean) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { isBlocked: blocked });
}

export async function sendNotificationToUser(userId: string, title: string, message: string) {
  // This would integrate with your notification system
  console.log('Sending notification to user:', userId, title, message);
  // Add to notifications collection if needed
}

// Group Management
export async function updateGroup(groupId: string, data: any) {
  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, data);
}

export async function deleteGroup(groupId: string) {
  const groupRef = doc(db, 'groups', groupId);
  await deleteDoc(groupRef);
}

export async function createGroup(groupData: any, adminUserId: string) {
  const groupsRef = collection(db, 'groups');
  
  // Add admin to memberIds
  const groupWithAdmin = {
    ...groupData,
    memberIds: [adminUserId]
  };
  
  const docRef = await addDoc(groupsRef, groupWithAdmin);
  const groupId = docRef.id;
  
  // Update admin user's groupIds
  const userRef = doc(db, 'users', adminUserId);
  const userDoc = await getDocs(query(collection(db, 'users'), where('authId', '==', adminUserId)));
  if (userDoc.docs.length > 0) {
    const userData = userDoc.docs[0].data();
    const userDocId = userDoc.docs[0].id;
    const groupIds = userData.groupIds || [];
    await updateDoc(doc(db, 'users', userDocId), {
      groupIds: [...groupIds, groupId]
    });
  }
  
  return groupId;
}

export async function addMemberToGroup(groupId: string, userId: string) {
  const groupRef = doc(db, 'groups', groupId);
  const group = await getDocs(query(collection(db, 'groups'), where('__name__', '==', groupId)));
  const groupData = group.docs[0]?.data();
  if (groupData) {
    const memberIds = groupData.memberIds || [];
    if (!memberIds.includes(userId)) {
      await updateDoc(groupRef, { memberIds: [...memberIds, userId] });
    }
  }
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const groupRef = doc(db, 'groups', groupId);
  const group = await getDocs(query(collection(db, 'groups'), where('__name__', '==', groupId)));
  const groupData = group.docs[0]?.data();
  if (groupData) {
    const memberIds = groupData.memberIds || [];
    await updateDoc(groupRef, { memberIds: memberIds.filter((id: string) => id !== userId) });
  }
}

// Statistics
export async function getStatistics() {
  const [users, groups, allCheckins, userStats] = await Promise.all([
    getAllUsers(),
    getAllGroups(),
    getDocs(collection(db, 'daily_checkins')),
    getDocs(collection(db, 'user_group_stats'))
  ]);

  // User growth by month (last 6 months)
  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  const userGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthStart = new Date(year, month, 1).getTime();
    const monthEnd = new Date(year, month + 1, 0).getTime();
    const count = users.filter(u => u.createdAt && u.createdAt >= monthStart && u.createdAt <= monthEnd).length;
    userGrowth.push({ month: monthNames[month], users: count });
  }

  // Check-ins by day of week
  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
  const checkInsByDay = dayNames.map((day, index) => {
    const count = allCheckins.docs.filter(doc => {
      const data = doc.data();
      if (data.date) {
        const dayOfWeek = new Date(data.date).getDay();
        return dayOfWeek === index && data.completed;
      }
      return false;
    }).length;
    return { day, checkins: count };
  });

  // Categories distribution
  const categoryCounts: Record<string, number> = {};
  groups.forEach(g => {
    const cat = g.category || 'אחר';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const categoriesData = Object.entries(categoryCounts).map(([name, value], index) => ({
    name,
    value: value as number,
    color: colors[index % colors.length]
  }));

  // Age distribution
  const ageRanges = [
    { range: '13-18', min: 13, max: 18, count: 0 },
    { range: '19-25', min: 19, max: 25, count: 0 },
    { range: '26-35', min: 26, max: 35, count: 0 },
    { range: '36-45', min: 36, max: 45, count: 0 },
    { range: '46+', min: 46, max: 999, count: 0 }
  ];
  users.forEach(u => {
    if (u.birthDate) {
      const age = new Date().getFullYear() - new Date(u.birthDate).getFullYear();
      const range = ageRanges.find(r => age >= r.min && age <= r.max);
      if (range) range.count++;
    }
  });

  // Top users by streak
  const topUsers = userStats.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => (b.longestStreak || 0) - (a.longestStreak || 0))
    .slice(0, 10)
    .map((stat: any) => {
      const user = users.find(u => u.id === stat.userId);
      return {
        name: user?.name || 'לא ידוע',
        streak: stat.longestStreak || 0,
        avatar: (user?.name || 'א').charAt(0)
      };
    });

  // Top groups by activity
  const topGroups = groups
    .map(group => {
      const groupCheckins = allCheckins.docs.filter(doc => {
        const data = doc.data();
        return data.groupId === group.id && data.completed;
      }).length;
      const totalPossible = (group.memberIds?.length || 1) * 30; // Assume 30 days
      const activity = totalPossible > 0 ? Math.round((groupCheckins / totalPossible) * 100) : 0;
      return {
        name: group.description || 'ללא שם',
        activity,
        category: group.category || 'כללי'
      };
    })
    .sort((a, b) => b.activity - a.activity)
    .slice(0, 10);

  return {
    userGrowth,
    checkInsByDay,
    categoriesData,
    ageDistribution: ageRanges,
    topUsers,
    topGroups
  };
}