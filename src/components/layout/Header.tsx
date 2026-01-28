import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, clearAuthData, isAuthenticated, isAdmin } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/constants';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const adminUser = isAdmin();

  const handleLogout = () => {
    clearAuthData();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ChurchRent
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to={ROUTES.EQUIPMENT}
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Browse Equipment
            </Link>
            {authenticated ? (
              <>
                <Link
                  to={adminUser ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD}
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border py-1">
                      <Link
                        to={ROUTES.PROFILE}
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to={adminUser ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD}
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-lg p-2 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            <Link
              to={ROUTES.EQUIPMENT}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Equipment
            </Link>
            {authenticated ? (
              <>
                <Link
                  to={adminUser ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD}
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
