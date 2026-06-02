import type { User } from '@/types';

export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;
  return !!(user.whatsapp_number && user.account_number && user.nin_verified);
};

export const profileMissingFields = (user: User | null): string[] => {
  if (!user) return [];
  const missing: string[] = [];
  if (!user.whatsapp_number) missing.push('WhatsApp number');
  if (!user.account_number) missing.push('bank account');
  if (!user.nin_verified) missing.push('NIN verification');
  return missing;
};
