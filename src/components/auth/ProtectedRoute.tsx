import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin, subscribeToAuth } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  renterOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  renterOnly = false,
}) => {
  const location = useLocation();
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);
  
  // Subscribe to auth changes to trigger re-render
  React.useEffect(() => {
    return subscribeToAuth(forceUpdate);
  }, []);
  
  const authenticated = isAuthenticated();
  const adminUser = isAdmin();

  if (!authenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requireAdmin && !adminUser) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Redirect admins away from renter-only pages (like booking, renter dashboard)
  if (renterOnly && adminUser) {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  return <>{children}</>;
};
