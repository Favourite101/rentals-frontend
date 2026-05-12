import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, User, LogOut, LayoutDashboard, Package,
  PlusCircle, List, Bell, Receipt, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, clearAuthData, isAuthenticated, isAdmin } from '@/lib/hooks/useAuth';
import { ROUTES } from '@/constants';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const adminUser = isAdmin();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLink = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path) ? 'text-primary' : 'text-gray-700 hover:text-primary'
    }`;

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
              Avaro Share
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to={ROUTES.EQUIPMENT} className={navLink(ROUTES.EQUIPMENT)}>
              Browse Items
            </Link>

            {authenticated && !adminUser && (
              <>
                <Link to={ROUTES.DASHBOARD} className={navLink(ROUTES.DASHBOARD)}>
                  Dashboard
                </Link>
                <Link to={ROUTES.LENDING_REQUESTS} className={navLink(ROUTES.LENDING_REQUESTS)}>
                  Lending Requests
                </Link>
              </>
            )}

            {authenticated && adminUser && (
              <Link to={ROUTES.ADMIN_DASHBOARD} className={navLink(ROUTES.ADMIN_DASHBOARD)}>
                Admin Panel
              </Link>
            )}

            {authenticated ? (
              <>
                {!adminUser && (
                  <Link to={ROUTES.MY_LISTINGS}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <PlusCircle className="h-4 w-4" />
                      List an Item
                    </Button>
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center space-x-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lg border py-1 z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{user?.email}</p>
                      </div>

                      <DropdownLink to={ROUTES.PROFILE} icon={<User className="h-4 w-4" />} label="Profile" />
                      {adminUser ? (
                        <DropdownLink to={ROUTES.ADMIN_DASHBOARD} icon={<LayoutDashboard className="h-4 w-4" />} label="Admin Panel" />
                      ) : (
                        <>
                          <DropdownLink to={ROUTES.DASHBOARD} icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
                          <DropdownLink to={ROUTES.MY_LISTINGS} icon={<List className="h-4 w-4" />} label="My Listings" />
                          <DropdownLink to={ROUTES.LENDING_REQUESTS} icon={<Bell className="h-4 w-4" />} label="Lending Requests" />
                          <DropdownLink to={ROUTES.MY_REFUNDS} icon={<Receipt className="h-4 w-4" />} label="My Refunds" />
                        </>
                      )}

                      <div className="border-t mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">Login</Button>
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
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            <MobileNavLink to={ROUTES.EQUIPMENT} label="Browse Items" active={isActive(ROUTES.EQUIPMENT)} />

            {authenticated ? (
              <>
                {!adminUser && (
                  <>
                    <MobileNavLink to={ROUTES.DASHBOARD} label="Dashboard" active={isActive(ROUTES.DASHBOARD)} />
                    <MobileNavLink to={ROUTES.MY_LISTINGS} label="My Listings" active={isActive(ROUTES.MY_LISTINGS)} />
                    <MobileNavLink to={ROUTES.LENDING_REQUESTS} label="Lending Requests" active={isActive(ROUTES.LENDING_REQUESTS)} />
                    <MobileNavLink to={ROUTES.MY_REFUNDS} label="My Refunds" active={isActive(ROUTES.MY_REFUNDS)} />
                  </>
                )}
                {adminUser && (
                  <MobileNavLink to={ROUTES.ADMIN_DASHBOARD} label="Admin Panel" active={isActive(ROUTES.ADMIN_DASHBOARD)} />
                )}
                <MobileNavLink to={ROUTES.PROFILE} label="Profile" active={isActive(ROUTES.PROFILE)} />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-2 text-sm font-medium text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
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

// ── Small helpers ──────────────────────────────────────────────────────────────

const DropdownLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNavLink: React.FC<{ to: string; label: string; active: boolean }> = ({ to, label, active }) => (
  <Link
    to={to}
    className={`block py-2 px-2 text-sm font-medium rounded-lg transition-colors ${
      active ? 'text-primary bg-primary/5' : 'text-gray-700 hover:text-primary hover:bg-gray-50'
    }`}
  >
    {label}
  </Link>
);
