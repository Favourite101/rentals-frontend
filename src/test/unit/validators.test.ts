import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, equipmentSchema, bookingSchema, categorySchema } from '@/lib/utils/validators';

describe('loginSchema', () => {
  it('passes with valid credentials', () => {
    expect(loginSchema.safeParse({ username: 'alice', password: 'secret' }).success).toBe(true);
  });

  it('fails when username is empty', () => {
    const result = loginSchema.safeParse({ username: '', password: 'secret' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.username).toBeDefined();
    }
  });

  it('fails when password is empty', () => {
    const result = loginSchema.safeParse({ username: 'alice', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'Alice Smith',
    username: 'alice123',
    email: 'alice@example.com',
    location: 'Lagos',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('passes with all valid fields', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects name shorter than 2 chars', () => {
    const r = registerSchema.safeParse({ ...valid, name: 'A' });
    expect(r.success).toBe(false);
  });

  it('rejects username shorter than 3 chars', () => {
    const r = registerSchema.safeParse({ ...valid, username: 'ab' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const r = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const r = registerSchema.safeParse({ ...valid, password: 'Abc1', confirmPassword: 'Abc1' });
    expect(r.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const r = registerSchema.safeParse({ ...valid, password: 'password1', confirmPassword: 'password1' });
    expect(r.success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    const r = registerSchema.safeParse({ ...valid, password: 'PASSWORD1', confirmPassword: 'PASSWORD1' });
    expect(r.success).toBe(false);
  });

  it('rejects password without number', () => {
    const r = registerSchema.safeParse({ ...valid, password: 'PasswordA', confirmPassword: 'PasswordA' });
    expect(r.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const r = registerSchema.safeParse({ ...valid, confirmPassword: 'Different1' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.confirmPassword).toBeDefined();
    }
  });
});

describe('equipmentSchema', () => {
  const valid = {
    name: 'Sony Camera',
    description: 'Professional camera for video shoots',
    category_id: 1,
    daily_rate: 50,
    image_url: '',
    is_available: true,
  };

  it('passes with valid data', () => {
    expect(equipmentSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects empty name', () => {
    const r = equipmentSchema.safeParse({ ...valid, name: '' });
    expect(r.success).toBe(false);
  });

  it('rejects description under 10 chars', () => {
    const r = equipmentSchema.safeParse({ ...valid, description: 'Short' });
    expect(r.success).toBe(false);
  });

  it('rejects category_id of 0', () => {
    const r = equipmentSchema.safeParse({ ...valid, category_id: 0 });
    expect(r.success).toBe(false);
  });

  it('rejects daily_rate of 0', () => {
    const r = equipmentSchema.safeParse({ ...valid, daily_rate: 0 });
    expect(r.success).toBe(false);
  });

  it('accepts empty image_url (literal empty string)', () => {
    expect(equipmentSchema.safeParse({ ...valid, image_url: '' }).success).toBe(true);
  });

  it('rejects non-URL image_url', () => {
    const r = equipmentSchema.safeParse({ ...valid, image_url: 'not-a-url' });
    expect(r.success).toBe(false);
  });

  it('accepts a valid image URL', () => {
    expect(equipmentSchema.safeParse({ ...valid, image_url: 'https://cdn.example.com/img.jpg' }).success).toBe(true);
  });
});

describe('bookingSchema', () => {
  const valid = {
    start_date: '2025-06-20',
    end_date: '2025-06-25',
    terms: true,
  };

  it('passes with valid data', () => {
    expect(bookingSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when terms not accepted', () => {
    const r = bookingSchema.safeParse({ ...valid, terms: false });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.terms).toBeDefined();
    }
  });

  it('fails when start_date is empty', () => {
    const r = bookingSchema.safeParse({ ...valid, start_date: '' });
    expect(r.success).toBe(false);
  });

  it('fails when end_date is before start_date', () => {
    const r = bookingSchema.safeParse({ ...valid, start_date: '2025-06-25', end_date: '2025-06-20' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.end_date).toBeDefined();
    }
  });

  it('passes same-day booking (start equals end)', () => {
    expect(bookingSchema.safeParse({ ...valid, end_date: '2025-06-20' }).success).toBe(true);
  });
});

describe('categorySchema', () => {
  it('passes with a non-empty name', () => {
    expect(categorySchema.safeParse({ name: 'Audio' }).success).toBe(true);
  });

  it('fails with an empty name', () => {
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false);
  });
});
