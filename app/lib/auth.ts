import { collection, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const authUser = userCredential.user;
    
    const usersRef = collection(db, 'users');
    let q = query(usersRef, where('authId', '==', authUser.uid));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      q = query(usersRef, where('email', '==', email));
      snapshot = await getDocs(q);
    }
    
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
      authId: authUser.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    
    setCurrentUser(user);
    return user;
  } catch (error) {
    throw error;
  }
};