import * as React from 'react';
import type { User } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// Auth state and listeners for reactive updates
let authState: { user: User | null; token: string | null } = {
  user: null,
  token: null,
};

let authListeners: (() => void)[] = [];

const notifyListeners = () => {
  authListeners.forEach((listener) => listener());
};

export const subscribeToAuth = (listener: () => void) => {
  authListeners.push(listener);
  return () => {
    authListeners = authListeners.filter((l) => l !== listener);
  };
};

export const setAuthData = (user: User, token: string) => {
  authState = { user, token };
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  notifyListeners();
};

export const clearAuthData = () => {
  authState = { user: null, token: null };
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  notifyListeners();
};

export const getAuthData = (): { user: User | null; token: string | null } => {
  if (authState.user && authState.token) {
    return authState;
  }
  
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData) as User;
      authState = { user, token };
      return { user, token };
    } catch {
      clearAuthData();
    }
  }
  
  return { user: null, token: null };
};

export const isAuthenticated = (): boolean => {
  const { token } = getAuthData();
  return !!token;
};

export const getCurrentUser = (): User | null => {
  const { user } = getAuthData();
  return user;
};

export const updateUserData = (user: User) => {
  const { token } = getAuthData();
  if (token) {
    authState = { ...authState, user };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    notifyListeners();
  }
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// Reactive hook — re-renders the component when auth state changes (same tab or cross-tab)
export const useCurrentUser = (): User | null => {
  const [, rerender] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    // Same-tab updates (notifyListeners fires on setAuthData / updateUserData / clearAuthData)
    const unsubscribe = subscribeToAuth(rerender);

    // Cross-tab updates (email link opens in a different browser tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER_DATA) {
        try {
          const updated = e.newValue ? (JSON.parse(e.newValue) as User) : null;
          if (updated) {
            authState = { ...authState, user: updated };
          } else {
            authState = { user: null, token: null };
          }
        } catch {}
        rerender();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return getCurrentUser();
};
