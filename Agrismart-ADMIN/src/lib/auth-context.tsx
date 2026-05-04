'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ SIGNUP (PENDING USER)
  const signup = async (email: string, password: string, fullName: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      email,
      fullName,
      role: 'pending',
      createdAt: new Date(),
    });
  };

  // LOGIN
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true);

      if (!u) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setUser(u);

      const userDoc = await getDoc(doc(db, 'users', u.uid));
      const role = userDoc.data()?.role;

      if (role === 'pending') {
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        router.push('/login?status=pending');
        return;
      }

      if (role === 'admin') {
        setIsAdmin(true);
      } else {
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
        router.push('/login');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
