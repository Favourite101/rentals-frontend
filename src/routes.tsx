import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ROUTES } from './constants';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { EquipmentCatalog } from './pages/EquipmentCatalog';
import { EquipmentDetail } from './pages/EquipmentDetail';
import { BookingPage } from './pages/BookingPage';
import { PaymentPage } from './pages/PaymentPage';
import { BookingSuccess } from './pages/BookingSuccess';
import { Dashboard } from './pages/Dashboard';
import { MyRefunds } from './pages/MyRefunds';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EquipmentManagement } from './pages/admin/EquipmentManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { BookingManagement } from './pages/admin/BookingManagement';
import { RefundManagement } from './pages/admin/RefundManagement';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      <Route path={ROUTES.EQUIPMENT} element={<EquipmentCatalog />} />
      <Route path={ROUTES.EQUIPMENT_DETAIL} element={<EquipmentDetail />} />
      
      <Route
        path={ROUTES.EQUIPMENT_BOOK}
        element={
          <ProtectedRoute renterOnly>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.BOOKING_PAYMENT}
        element={
          <ProtectedRoute renterOnly>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.BOOKING_SUCCESS}
        element={
          <ProtectedRoute renterOnly>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute renterOnly>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MY_REFUNDS}
        element={
          <ProtectedRoute renterOnly>
            <MyRefunds />
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
        path={ROUTES.ADMIN_EQUIPMENT}
        element={
          <ProtectedRoute requireAdmin>
            <EquipmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CATEGORIES}
        element={
          <ProtectedRoute requireAdmin>
            <CategoryManagement />
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
    </Routes>
  );
};
