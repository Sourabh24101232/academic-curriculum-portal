import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages faculty admin authentication state, initial session cookie verification,
 * login lifecycle, and logout routines.
 */
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verify existing session cookie with backend on mount
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        setLoading(true);
        const data = await authApi.getMe();
        if (isMounted) {
          if (data && data.authenticated && data.admin) {
            setAdmin(data.admin);
            setIsAuthenticated(true);
          } else {
            setAdmin(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Faculty Login handler
   * Supports both positional args: login(email, password, rememberMe)
   * and object args: login({ email, password, rememberMe })
   */
  const login = useCallback(async (emailOrCredentials, maybePassword, maybeRememberMe = false) => {
    let credentials;
    if (typeof emailOrCredentials === 'object' && emailOrCredentials !== null) {
      credentials = emailOrCredentials;
    } else {
      credentials = {
        email: emailOrCredentials,
        password: maybePassword,
        rememberMe: maybeRememberMe
      };
    }

    try {
      const data = await authApi.login(credentials);
      if (data && data.admin) {
        setAdmin(data.admin);
        setIsAuthenticated(true);
      }
      return data;
    } catch (err) {
      setAdmin(null);
      setIsAuthenticated(false);
      throw err;
    }
  }, []);

  /**
   * Faculty Logout handler
   * Invalidates server session and clears client state
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAdmin(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = {
    admin,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Custom Hook
 * Provides convenient access to authentication state and actions.
 * Enforces usage inside AuthProvider tree.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
