import { Routes, Route, useLocation } from 'react-router-dom';
import * as React from 'react';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ROUTES } from './constants';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { EquipmentCatalog } from './pages/EquipmentCatalog';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { BookingPage } from './pages/BookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { BookingSuccess } from './pages/BookingSuccess';
import { Dashboard } from './pages/Dashboard';
import { MyListings } from './pages/MyListings';
import { LendingRequests } from './pages/LendingRequests';
import { MyRefunds } from './pages/MyRefunds';
import { MyWishlist } from './pages/MyWishlist';
import { Profile } from './pages/Profile';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { ListingModeration } from './pages/admin/ListingModeration';
import { ListingApproval } from './pages/admin/ListingApproval';
import { BookingManagement } from './pages/admin/BookingManagement';
import { RefundManagement } from './pages/admin/RefundManagement';
import { NonReturnReports } from './pages/admin/NonReturnReports';
import { Payouts } from './pages/admin/Payouts';

export const AppRoutes = () => {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
      <Route path={ROUTES.EQUIPMENT} element={<EquipmentCatalog />} />
      <Route path={ROUTES.EQUIPMENT_DETAIL} element={<EquipmentDetail />} />
      <Route path={ROUTES.TERMS} element={<TermsOfService />} />
      <Route path={ROUTES.PRIVACY} element={<PrivacyPolicy />} />

      <Route
        path={ROUTES.EQUIPMENT_BOOK}
        element={
          <ProtectedRoute userOnly>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.BOOKING_PAYMENT}
        element={
          <ProtectedRoute userOnly>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.BOOKING_SUCCESS}
        element={
          <ProtectedRoute userOnly>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute userOnly>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_LISTINGS}
        element={
          <ProtectedRoute userOnly>
            <MyListings />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LENDING_REQUESTS}
        element={
          <ProtectedRoute userOnly>
            <LendingRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_REFUNDS}
        element={
          <ProtectedRoute userOnly>
            <MyRefunds />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_WISHLIST}
        element={
          <ProtectedRoute userOnly>
            <MyWishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <ProtectedRoute requireAdmin>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_LISTINGS}
        element={
          <ProtectedRoute requireAdmin>
            <ListingModeration />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_LISTING_APPROVAL}
        element={
          <ProtectedRoute requireAdmin>
            <ListingApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_BOOKINGS}
        element={
          <ProtectedRoute requireAdmin>
            <BookingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_REFUNDS}
        element={
          <ProtectedRoute requireAdmin>
            <RefundManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_NON_RETURN_REPORTS}
        element={
          <ProtectedRoute requireAdmin>
            <NonReturnReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_PAYOUTS}
        element={
          <ProtectedRoute requireAdmin>
            <Payouts />
          </ProtectedRoute>
        }
      />
    </Routes>
    </>
  );
};
