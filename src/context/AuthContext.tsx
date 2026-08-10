import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, UserRole } from '../types/waterDistribution';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isMasterAdmin: boolean;
  isViewer: boolean;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  usersList: AdminUser[];
  createUser: (newUser: Omit<AdminUser, 'uid'>) => boolean;
  updateUserRole: (username: string, newRole: UserRole) => void;
  deleteUser: (username: string) => void;
}

const INITIAL_USERS: AdminUser[] = [
  {
    uid: 'master-01',
    username: 'SCE WW',
    name: 'Chief Water Engineer (SCE WW)',
    role: 'Master Admin',
    badgeNumber: 'NAV-CWE-01',
    password: 'SCE Waterworks'
  },
  {
    uid: 'admin-02',
    username: 'Admin Officer',
    name: 'Duty Admin Officer',
    role: 'Admin',
    badgeNumber: 'NAV-ADM-02',
    password: 'admin123'
  },
  {
    uid: 'viewer-03',
    username: 'Dockyard Viewer',
    name: 'Dockyard Operations Monitor',
    role: 'Viewer',
    badgeNumber: 'NAV-VIE-03',
    password: 'viewer123'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<AdminUser[]>(() => {
    const stored = localStorage.getItem('cced_users_registry');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse users registry', e);
      }
    }
    return INITIAL_USERS;
  });

  const [user, setUser] = useState<AdminUser | null>(() => {
    const savedUser = localStorage.getItem('cced_auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse auth user', e);
      }
    }
    return INITIAL_USERS[0]; // Default to SCE WW Master Admin for smooth demo
  });

  useEffect(() => {
    localStorage.setItem('cced_users_registry', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cced_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cced_auth_user');
    }
  }, [user]);

  const login = (username: string, password?: string): boolean => {
    const found = usersList.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (found) {
      if (found.password && password && found.password !== password) {
        return false;
      }
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const createUser = (newUser: Omit<AdminUser, 'uid'>): boolean => {
    const exists = usersList.some(
      u => u.username.toLowerCase() === newUser.username.trim().toLowerCase()
    );
    if (exists) return false;

    const userWithUid: AdminUser = {
      ...newUser,
      uid: `usr-${Date.now()}`
    };

    setUsersList(prev => [...prev, userWithUid]);
    return true;
  };

  const updateUserRole = (username: string, newRole: UserRole) => {
    setUsersList(prev =>
      prev.map(u => (u.username === username ? { ...u, role: newRole } : u))
    );
    if (user && user.username === username) {
      setUser(prev => (prev ? { ...prev, role: newRole } : null));
    }
  };

  const deleteUser = (username: string) => {
    if (username === 'SCE WW') return; // Cannot delete Master Admin
    setUsersList(prev => prev.filter(u => u.username !== username));
  };

  const isMasterAdmin = user?.role === 'Master Admin' || user?.username === 'SCE WW';
  const isViewer = user?.role === 'Viewer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isMasterAdmin,
        isViewer,
        login,
        logout,
        usersList,
        createUser,
        updateUserRole,
        deleteUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
