import { describe, it, expect, afterEach } from 'vitest';
import { server } from '@/test/server';
import { http, HttpResponse } from 'msw';
import { authApi } from '@/lib/api/auth';
import { setAuthData, clearAuthData } from '@/lib/hooks/useAuth';
import { makeUser } from '@/test/factories';

const BASE = 'http://localhost:8000/api/v1';

afterEach(() => {
  server.resetHandlers();
  clearAuthData();
});

describe('authApi.login', () => {
  it('returns access_token and user on success', async () => {
    const result = await authApi.login({ username: 'testuser', password: 'Password1' });
    expect(result.access_token).toBe('test-token');
    expect(result.user).toHaveProperty('email');
  });

  it('throws on invalid credentials', async () => {
    server.use(
      http.post(`${BASE}/auth/login`, () =>
        HttpResponse.json({ detail: 'Incorrect username or password' }, { status: 401 })
      )
    );
    await expect(authApi.login({ username: 'wrong', password: 'bad' })).rejects.toThrow();
  });
});

describe('authApi.register', () => {
  it('registers and auto-logs in, returning user', async () => {
    const result = await authApi.register({
      name: 'Alice',
      username: 'alice',
      email: 'alice@example.com',
      password: 'Password1',
    });
    expect(result.access_token).toBeDefined();
    expect(result.user).toHaveProperty('username');
  });
});

describe('authApi.getCurrentUser', () => {
  it('fetches the current user', async () => {
    setAuthData(makeUser(), 'test-token');
    const user = await authApi.getCurrentUser();
    expect(user.email).toBe('test@example.com');
  });
});

describe('authApi.updateProfile', () => {
  it('updates profile and returns updated user', async () => {
    setAuthData(makeUser(), 'test-token');
    const result = await authApi.updateProfile({ name: 'Updated Name' });
    expect(result).toHaveProperty('id');
  });
});

describe('authApi.uploadAvatar', () => {
  it('uploads a file and returns user with avatar_url', async () => {
    setAuthData(makeUser(), 'test-token');
    const file = new File(['fake-image'], 'avatar.jpg', { type: 'image/jpeg' });
    const result = await authApi.uploadAvatar(file);
    expect(result.avatar_url).toContain('cdn.example.com');
  });
});

describe('authApi.verifyNin', () => {
  it('verifies NIN and returns user with nin_verified true', async () => {
    setAuthData(makeUser({ nin_verified: false }), 'test-token');
    const result = await authApi.verifyNin('12345678901', '1990-01-01');
    expect(result.nin_verified).toBe(true);
  });

  it('throws on invalid NIN', async () => {
    server.use(
      http.post(`${BASE}/auth/me/verify-nin`, () =>
        HttpResponse.json({ detail: 'NIN not found' }, { status: 422 })
      )
    );
    await expect(authApi.verifyNin('00000000000', '1990-01-01')).rejects.toThrow();
  });
});

describe('authApi.forgotPassword', () => {
  it('returns a message on success', async () => {
    const result = await authApi.forgotPassword({ email: 'test@example.com' });
    expect(result.message).toBeDefined();
  });

  it('throws when email not found', async () => {
    server.use(
      http.post(`${BASE}/auth/forgot-password`, () =>
        HttpResponse.json({ detail: 'Email not found' }, { status: 404 })
      )
    );
    await expect(authApi.forgotPassword({ email: 'ghost@example.com' })).rejects.toThrow();
  });
});

describe('authApi.resetPassword', () => {
  it('resets password successfully', async () => {
    const result = await authApi.resetPassword({ token: 'reset-tok', new_password: 'NewPassword1' });
    expect(result.message).toBeDefined();
  });
});
