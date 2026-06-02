import type { User } from '@/types';

export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  return !!(user.email_verified && user.whatsapp_number && user.account_number);
};

export const profileMissingFields = (user: User | null): string[] => {
  if (!user) return [];
  const missing: string[] = [];
  if (!user.email_verified) missing.push('email verification');
  if (!user.whatsapp_number) missing.push('WhatsApp number');
  if (!user.account_number) missing.push('bank account');
  return missing;
};
