import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  calculateDays,
  calculateTotalPrice,
  truncateText,
  getInitials,
} from '@/lib/utils/formatters';

describe('formatDate', () => {
  it('formats an ISO string to MMM dd, yyyy', () => {
    expect(formatDate('2025-06-15T00:00:00Z')).toMatch(/Jun 15, 2025/);
  });

  it('accepts a Date object', () => {
    const d = new Date('2025-01-01');
    expect(formatDate(d)).toMatch(/Jan 01, 2025/);
  });

  it('returns "Invalid date" for garbage input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });
});

describe('formatDateTime', () => {
  it('includes time component', () => {
    const result = formatDateTime('2025-06-15T09:30:00Z');
    expect(result).toMatch(/Jun 15, 2025/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('returns "Invalid date" for bad input', () => {
    expect(formatDateTime('bad')).toBe('Invalid date');
  });
});

describe('formatCurrency', () => {
  it('formats a positive amount in NGN', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
    expect(result).toMatch(/₦|NGN/);
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });

  it('formats fractional amounts', () => {
    expect(formatCurrency(9.99)).toMatch(/9\.99/);
  });
});

describe('calculateDays', () => {
  it('counts inclusive days (start and end)', () => {
    expect(calculateDays('2025-06-10', '2025-06-12')).toBe(3);
  });

  it('returns 1 for same-day rental', () => {
    expect(calculateDays('2025-06-10', '2025-06-10')).toBe(1);
  });

  it('returns 0 when end is before start', () => {
    expect(calculateDays('2025-06-15', '2025-06-10')).toBe(0);
  });

  it('returns 0 for invalid dates', () => {
    expect(calculateDays('bad', 'also-bad')).toBe(0);
  });
});

describe('calculateTotalPrice', () => {
  it('multiplies daily rate by number of days', () => {
    expect(calculateTotalPrice(50, '2025-06-10', '2025-06-12')).toBe(150);
  });

  it('returns 0 for invalid dates', () => {
    expect(calculateTotalPrice(50, 'bad', 'also-bad')).toBe(0);
  });
});

describe('truncateText', () => {
  it('returns text unchanged if within limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('truncates with ellipsis when over limit', () => {
    expect(truncateText('hello world', 5)).toBe('hello...');
  });

  it('handles exact-length strings without truncating', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });
});

describe('getInitials', () => {
  it('returns first two initials uppercased', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns single initial for one-word name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('caps at 2 characters for multi-word names', () => {
    expect(getInitials('John Paul George')).toBe('JP');
  });

  it('uppercases lowercase names', () => {
    expect(getInitials('jane doe')).toBe('JD');
  });
});
