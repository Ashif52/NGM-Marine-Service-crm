import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from "../firebase";
import { userApi, UserResponse } from "../services/api";

type Role = "master" | "staff" | "crew";

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  ship_id?: string;
  ship_name?: string;
  phone?: string;
  position?: string;
  active: boolean;
}

interface AuthContextType {
  firebaseUser: User | null;
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserFromBackend = async (fbUser: User) => {
    try {
      const response = await userApi.getCurrentUser();
      if (response.data) {
        const userData = response.data;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          ship_id: userData.ship_id,
          ship_name: userData.ship_name,
          phone: userData.phone,
          position: userData.position,
          active: userData.active,
        });
      } else {
        console.error('Failed to fetch user data from backend:', response.error);
        // Fallback to basic user info from Firebase
        setUser({
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          role: 'crew', // Default role
          active: true,
        });
      }
    } catch (error) {
      console.error('Error fetching user from backend:', error);
      // Fallback to basic user info
      setUser({
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        role: 'crew', // Default role
        active: true,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setLoading(true);

      if (fbUser) {
        await fetchUserFromBackend(fbUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User data will be fetched in the onAuthStateChanged callback
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      await fetchUserFromBackend(firebaseUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      firebaseUser, 
      user, 
      loading, 
      login, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
