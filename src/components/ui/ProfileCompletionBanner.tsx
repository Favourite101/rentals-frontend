import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getCurrentUser } from '@/lib/hooks/useAuth';
import { isProfileComplete, profileMissingFields } from '@/lib/utils/profile';
import { ROUTES } from '@/constants';

export const ProfileCompletionBanner: React.FC = () => {
  const user = getCurrentUser();
  if (!user || isProfileComplete(user)) return null;

  const missing = profileMissingFields(user);

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-800">Complete your profile to borrow or lend</p>
        <p className="text-sm text-amber-700 mt-0.5">
          Still needed: {missing.join(', ')}.
        </p>
      </div>
      <Link
        to={ROUTES.PROFILE}
        className="flex-shrink-0 text-sm font-semibold text-amber-800 underline hover:text-amber-900"
      >
        Complete now →
      </Link>
    </div>
  );
};
