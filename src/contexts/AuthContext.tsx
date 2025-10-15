import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, isAdmin: boolean) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          await loadUserData(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData(session.user.id, session.user.email || '');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId: string, email: string) => {
    try {
      // ✅ Check if admin
      const { data: adminData } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (adminData) {
        setUser({
          id: adminData.id || 'admin',
          email: adminData.email,
          name: adminData.name || 'Admin',
          studentId: 'ADMIN',
          role: 'admin',
        });
        return;
      }

      // 🧑‍🎓 Check if student
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          studentId: userData.id,
          role: userData.role || 'student',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // ✅ Login logic (admin bypasses Supabase Auth)
  const login = async (email: string, password: string, isAdmin: boolean): Promise<boolean> => {
    try {
      if (isAdmin) {
        // 🔐 Check directly in admin table
        const { data: adminData, error: adminError } = await supabase
          .from('admin')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();

        if (adminError) {
          console.error('Admin DB error:', adminError);
          return false;
        }

        if (!adminData) {
          console.warn('Invalid admin credentials');
          return false;
        }

        // ✅ Set admin user manually
        setUser({
          id: adminData.id || 'admin',
          email: adminData.email,
          name: adminData.name || 'Admin',
          studentId: 'ADMIN',
          role: 'admin',
        });

        return true;
      }

      // 🧑‍🎓 Regular student login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        await loadUserData(data.user.id, email);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // ✅ Signup for students only
  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Check if already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        console.warn('Email already registered');
        return false;
      }

      // Create in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        console.error('Signup error:', authError);
        return false;
      }

      // Insert into users table
      const { error: insertError } = await supabase.from('users').insert({
        id: authData.user.id,
        name,
        email,
        role: 'student',
      });

      if (insertError) {
        console.error('Error inserting user:', insertError);
        return false;
      }

      await loadUserData(authData.user.id, email);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
