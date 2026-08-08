import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types/waterDistribution';

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'cced_water_admin_session';

const INITIAL_ADMIN: AdminUser = {
  uid: 'admin-sce-ww',
  username: 'SCE WW',
  name: 'Senior Chief Engineer - Water Works (SCE WW)',
  role: 'Chief Water Engineer',
  badgeNumber: 'SLN-CCED-WW-01'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return INITIAL_ADMIN; // Default logged in for immediate turnkey presentation
  });

  const [authError, setAuthError] = useState<string | null>(null);

  const login = async (username: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    const cleanUser = username.trim();
    const cleanPass = pass.trim();

    // Check verbatim credentials: SCE WW / SCE Waterworks
    if (
      (cleanUser.toLowerCase() === 'sce ww' || cleanUser.toLowerCase() === 'sceww' || cleanUser.toLowerCase() === 'sce.ww@dockyard.navy') &&
      cleanPass === 'SCE Waterworks'
    ) {
      setUser(INITIAL_ADMIN);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN));
      return true;
    }

    setAuthError('Invalid credentials. Expected Username: SCE WW | Password: SCE Waterworks');
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        authError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
