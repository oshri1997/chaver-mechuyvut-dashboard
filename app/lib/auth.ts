import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

let currentUser: any = null;

export const setCurrentUser = (user: any) => {
  currentUser = user;
};

export const isAuthenticated = () => !!currentUser;

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return currentUser || {
    id: '9vDpKKx3nMPaXitPnNBnbX2YbRy1',
    authId: '9vDpKKx3nMPaXitPnNBnbX2YbRy1',
    name: 'אושרי',
    email: 'oshri19970@gmail.com',
    role: 'admin'
  };
};

export const loginAdmin = async (email: string, password: string) => {
  try {
    // Check hardcoded credentials
    if (email === 'oshri19970@gmail.com' && password === '123456') {
      // Verify user exists in Firestore and is admin
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      if (userData.role !== 'admin') {
        return null;
      }
      
      const user = {
        id: userDoc.id,
        authId: userData.authId || userDoc.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      };
      
      setCurrentUser(user);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};