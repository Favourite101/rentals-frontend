import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Bell, User, LogOut, LayoutDashboard, List, Receipt, Menu, X, CheckCheck, Heart } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, clearAuthData, isAuthenticated, isAdmin } from '@/lib/hooks/useAuth';
import { notificationsApi } from '@/lib/api/notifications';
import { ROUTES, QUERY_KEYS } from '@/constants';
import { formatDate } from '@/lib/utils/formatters';
import type { Notification } from '@/types';

const AtloMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="28" height="34" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M0 22L9 0l9 22H0z" fill="currentColor" />
    <path d="M5 22l4-9 4 9H5z" fill="white" fillOpacity="0.35" />
  </svg>
);

export const Header: React.FC = () => {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  const authenticated = isAuthenticated();
  const adminUser = isAdmin();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: notificationsApi.getMyNotifications,
    enabled: authenticated,
    refetchInterval: 60_000,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD],
    queryFn: notificationsApi.getUnreadCount,
    enabled: authenticated,
    refetchInterval: 60_000,
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS_UNREAD] });
    },
  });

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

  React.useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuthData();
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-300">
      <div className="container-custom">
        <div className="flex h-28 items-center justify-between gap-4">

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 flex-shrink-0 text-primary">
            <AtloMark />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">atlo</span>
          </Link>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-5">
            {/* Location pill */}
            <button className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-900 transition-colors">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="font-medium">
                {authenticated && user?.location ? `${user.location}, Lagos` : 'Lagos, Nigeria'}
              </span>
            </button>

            {authenticated ? (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(v => !v)}
                    className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                  >
                    <Bell style={{ width: '24px', height: '24px' }} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary border-2 border-white text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-gray-100 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">Notifications</p>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllMutation.mutate()}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 20).map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                            >
                              <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2.5 rounded-full p-1 pl-4 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <span className="text-base font-medium text-gray-700">{user?.name.split(' ')[0]}</span>
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-gray-100 py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                      </div>

                      {adminUser ? (
                        <DropdownItem to={ROUTES.ADMIN_DASHBOARD} icon={<LayoutDashboard className="h-4 w-4" />} label="Admin panel" />
                      ) : (
                        <>
                          <DropdownItem to={ROUTES.DASHBOARD} icon={<LayoutDashboard className="h-4 w-4" />} label="My bookings" />
                          <DropdownItem to={ROUTES.MY_LISTINGS} icon={<List className="h-4 w-4" />} label="My listings" />
                          <DropdownItem to={ROUTES.LENDING_REQUESTS} icon={<Bell className="h-4 w-4" />} label="Rental requests" />
                          <DropdownItem to={ROUTES.MY_WISHLIST} icon={<Heart className="h-4 w-4" />} label="Wishlist" />
                          <DropdownItem to={ROUTES.MY_REFUNDS} icon={<Receipt className="h-4 w-4" />} label="Refunds" />
                        </>
                      )}
                      <DropdownItem to={ROUTES.PROFILE} icon={<User className="h-4 w-4" />} label="Profile" />

                      <div className="border-t border-gray-100 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" className="font-medium text-gray-700 text-base px-5">Log in</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button className="font-medium rounded-xl text-base px-5">Get started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {authenticated ? (
              <>
                <MobileLink to={ROUTES.DASHBOARD} label="My bookings" />
                <MobileLink to={ROUTES.MY_LISTINGS} label="My listings" />
                <MobileLink to={ROUTES.LENDING_REQUESTS} label="Rental requests" />
                <MobileLink to={ROUTES.MY_WISHLIST} label="Wishlist" />
                <MobileLink to={ROUTES.MY_REFUNDS} label="Refunds" />
                <MobileLink to={ROUTES.PROFILE} label="Profile" />
                {adminUser && <MobileLink to={ROUTES.ADMIN_DASHBOARD} label="Admin panel" />}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to={ROUTES.LOGIN}><Button variant="outline" className="w-full">Log in</Button></Link>
                <Link to={ROUTES.REGISTER}><Button className="w-full">Get started</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const DropdownItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
    <span className="text-gray-400">{icon}</span>
    {label}
  </Link>
);

const MobileLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link to={to} className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
    {label}
  </Link>
);
