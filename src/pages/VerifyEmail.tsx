import * as React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { updateUserData } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/constants';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { isLoading, isSuccess, isError, data } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => authApi.verifyEmail(token),
    enabled: !!token,
    retry: false,
  });

  // Persist the updated user (email_verified = true) into local auth state
  React.useEffect(() => {
    if (isSuccess && data) updateUserData(data);
  }, [isSuccess, data]);

  return (
    <Layout>
      <div className="container-custom py-20 max-w-md mx-auto text-center">
        {!token && (
          <>
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
            <p className="text-gray-500 mb-6">No verification token was found in this link.</p>
            <Link to={ROUTES.HOME}><Button>Go home</Button></Link>
          </>
        )}

        {token && isLoading && (
          <>
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Verifying your email…</h1>
          </>
        )}

        {isSuccess && (
          <>
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Email verified!</h1>
            <p className="text-gray-500 mb-6">Your email address has been confirmed. You can now borrow and lend on atlo.</p>
            <Link to={ROUTES.HOME}><Button>Start browsing</Button></Link>
          </>
        )}

        {isError && (
          <>
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Link expired or invalid</h1>
            <p className="text-gray-500 mb-6">This verification link has expired or was already used. Request a new one from your profile.</p>
            <Link to={ROUTES.PROFILE}><Button>Go to profile</Button></Link>
          </>
        )}
      </div>
    </Layout>
  );
};
