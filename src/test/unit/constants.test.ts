import { describe, it, expect } from 'vitest';
import {
  ROUTES,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_STATUS_COLORS,
  REFUND_STATUS_LABELS,
} from '@/constants';
import type { BookingStatus, EquipmentStatus } from '@/types';

describe('ROUTES', () => {
  it('has unique path values', () => {
    const paths = Object.values(ROUTES);
    const unique = new Set(paths);
    expect(unique.size).toBe(paths.length);
  });

  it('all paths start with /', () => {
    Object.values(ROUTES).forEach((path) => {
      expect(path.startsWith('/')).toBe(true);
    });
  });

  it('includes all required admin routes', () => {
    expect(ROUTES.ADMIN_DASHBOARD).toBeDefined();
    expect(ROUTES.ADMIN_LISTING_APPROVAL).toBeDefined();
    expect(ROUTES.ADMIN_NON_RETURN_REPORTS).toBeDefined();
    expect(ROUTES.ADMIN_PAYOUTS).toBeDefined();
  });

  it('includes terms and privacy routes', () => {
    expect(ROUTES.TERMS).toBe('/terms');
    expect(ROUTES.PRIVACY).toBe('/privacy');
  });
});

describe('BOOKING_STATUS_LABELS', () => {
  const statuses: BookingStatus[] = ['requested', 'pending', 'confirmed', 'completed', 'cancelled', 'declined', 'expired', 'failed'];

  it('has a label for every booking status', () => {
    statuses.forEach((s) => {
      expect(BOOKING_STATUS_LABELS[s]).toBeTruthy();
    });
  });

  it('requested maps to "Awaiting Approval"', () => {
    expect(BOOKING_STATUS_LABELS.requested).toBe('Awaiting Approval');
  });

  it('completed maps to "Completed"', () => {
    expect(BOOKING_STATUS_LABELS.completed).toBe('Completed');
  });
});

describe('BOOKING_STATUS_COLORS', () => {
  it('has a colour class for every booking status', () => {
    const statuses: BookingStatus[] = ['requested', 'pending', 'confirmed', 'completed', 'cancelled', 'declined', 'expired', 'failed'];
    statuses.forEach((s) => {
      expect(BOOKING_STATUS_COLORS[s]).toContain('bg-');
    });
  });
});

describe('EQUIPMENT_STATUS_LABELS', () => {
  const statuses: EquipmentStatus[] = ['pending_review', 'approved', 'rejected'];

  it('has a label for every equipment status', () => {
    statuses.forEach((s) => {
      expect(EQUIPMENT_STATUS_LABELS[s]).toBeTruthy();
    });
  });

  it('pending_review maps to "Pending Review"', () => {
    expect(EQUIPMENT_STATUS_LABELS.pending_review).toBe('Pending Review');
  });
});

describe('EQUIPMENT_STATUS_COLORS', () => {
  it('approved uses emerald colour', () => {
    expect(EQUIPMENT_STATUS_COLORS.approved).toContain('emerald');
  });

  it('rejected uses red colour', () => {
    expect(EQUIPMENT_STATUS_COLORS.rejected).toContain('red');
  });
});

describe('REFUND_STATUS_LABELS', () => {
  it('covers all refund statuses', () => {
    ['pending', 'approved', 'rejected', 'processed'].forEach((s) => {
      expect(REFUND_STATUS_LABELS[s as keyof typeof REFUND_STATUS_LABELS]).toBeTruthy();
    });
  });
});
