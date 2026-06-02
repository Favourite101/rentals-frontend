import { describe, it, expect, beforeEach } from 'vitest';
import {
  setAuthData,
  clearAuthData,
  getAuthData,
  isAuthenticated,
  getCurrentUser,
  isAdmin,
  updateUserData,
  subscribeToAuth,
} from '@/lib/hooks/useAuth';
import { makeUser, makeAdmin } from '@/test/factories';

beforeEach(() => {
  clearAuthData();
});

describe('setAuthData / getAuthData', () => {
  it('stores user and token in memory and localStorage', () => {
    const user = makeUser();
    setAuthData(user, 'tok123');

    const { user: storedUser, token } = getAuthData();
    expect(token).toBe('tok123');
    expect(storedUser?.email).toBe(user.email);
    expect(localStorage.getItem('auth_token')).toBe('tok123');
  });

  it('rehydrates from localStorage when in-memory state is absent', () => {
    const user = makeUser();
    localStorage.setItem('auth_token', 'persisted-token');
    localStorage.setItem('user_data', JSON.stringify(user));

    // Clear in-memory state without touching localStorage
    const { user: u, token } = getAuthData();
    expect(token).toBe('persisted-token');
    expect(u?.username).toBe(user.username);
  });
});

describe('clearAuthData', () => {
  it('removes token and user from localStorage', () => {
    setAuthData(makeUser(), 'tok');
    clearAuthData();

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('user_data')).toBeNull();
  });

  it('makes getAuthData return nulls after clearing', () => {
    setAuthData(makeUser(), 'tok');
    clearAuthData();
    const { user, token } = getAuthData();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });
});

describe('isAuthenticated', () => {
  it('returns false when no token', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('returns true when token is set', () => {
    setAuthData(makeUser(), 'tok');
    expect(isAuthenticated()).toBe(true);
  });
});

describe('getCurrentUser', () => {
  it('returns null when not logged in', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('returns the user when logged in', () => {
    const user = makeUser({ name: 'Jane' });
    setAuthData(user, 'tok');
    expect(getCurrentUser()?.name).toBe('Jane');
  });
});

describe('isAdmin', () => {
  it('returns false for regular users', () => {
    setAuthData(makeUser(), 'tok');
    expect(isAdmin()).toBe(false);
  });

  it('returns true for admin users', () => {
    setAuthData(makeAdmin(), 'tok');
    expect(isAdmin()).toBe(true);
  });

  it('returns false when not authenticated', () => {
    expect(isAdmin()).toBe(false);
  });
});

describe('updateUserData', () => {
  it('updates in-memory and localStorage user without changing token', () => {
    setAuthData(makeUser({ name: 'Old Name' }), 'tok');
    updateUserData(makeUser({ name: 'New Name' }));
    expect(getCurrentUser()?.name).toBe('New Name');
    expect(localStorage.getItem('auth_token')).toBe('tok');
  });

  it('is a no-op when not authenticated', () => {
    updateUserData(makeUser({ name: 'Ghost' }));
    expect(getCurrentUser()).toBeNull();
  });
});

describe('subscribeToAuth', () => {
  it('notifies listener when auth state changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAuth(listener);
    setAuthData(makeUser(), 'tok');
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAuth(listener);
    unsubscribe();
    setAuthData(makeUser(), 'tok2');
    expect(listener).not.toHaveBeenCalled();
  });
});
