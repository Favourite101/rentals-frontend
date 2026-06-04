import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loader';
import { equipmentApi } from '@/lib/api/equipment';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { formatCurrency, calculateDays, calculateTotalPrice } from '@/lib/utils/formatters';
import {
  Package, ChevronRight, MapPin, BadgeCheck,
  Calendar, ArrowLeft, Shield, MessageCircle,
} from 'lucide-react';
import { isAuthenticated, isAdmin, getCurrentUser } from '@/lib/hooks/useAuth';
import { isProfileComplete } from '@/lib/utils/profile';
import { showToast } from '@/lib/hooks/useToast';

export const EquipmentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const adminUser = isAdmin();
  const currentUser = getCurrentUser();
  const [activeImage, setActiveImage] = React.useState(0);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const { data: equipment, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT, slug],
    queryFn: () => equipmentApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const isOwner = !!currentUser && !!equipment && currentUser.id === equipment.owner_id;

  // Compute minimum bookable date from min_notice_hours
  const minDate = React.useMemo(() => {
    const base = new Date();
    if (equipment?.min_notice_hours) {
      base.setHours(base.getHours() + equipment.min_notice_hours);
    } else {
      base.setDate(base.getDate() + 1);
    }
    return base.toISOString().split('T')[0];
  }, [equipment?.min_notice_hours]);

  // Build the full image list: gallery images first, fall back to image_url
  const allImages = React.useMemo(() => {
    if (!equipment) return [];
    if (equipment.images && equipment.images.length > 0) {
      return equipment.images.map((img) => img.url);
    }
    if (equipment.image_url) return [equipment.image_url];
    return [];
  }, [equipment]);

  const handleBook = () => {
    if (!authenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: ROUTES.EQUIPMENT_BOOK.replace(':slug', slug!) } } });
      return;
    }
    if (isOwner) {
      showToast('You cannot book your own item.', 'error');
      return;
    }
    if (!isProfileComplete(currentUser)) {
      showToast('Complete your profile (verify email, add WhatsApp number and bank account) before booking.', 'error');
      navigate(ROUTES.PROFILE);
      return;
    }
    navigate(ROUTES.EQUIPMENT_BOOK.replace(':slug', slug!), {
      state: startDate && endDate ? { startDate, endDate } : undefined,
    });
  };

  const handleWhatsApp = () => {
    const number = equipment?.owner?.whatsapp_number;
    if (!number) return;
    // Strip non-digits, then open wa.me
    const clean = number.replace(/\D/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  if (isLoading) return <Layout><PageLoader /></Layout>;

  if (!equipment) {
    return (
      <Layout>
        <div className="container-custom py-16 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Link to={ROUTES.EQUIPMENT}><Button>Browse items</Button></Link>
        </div>
      </Layout>
    );
  }

  const deposit = equipment.security_deposit ?? 0;
  const days = startDate && endDate ? calculateDays(startDate, endDate) : 1;
  const rentalFee = days > 0 ? calculateTotalPrice(equipment.daily_rate, startDate || minDate, endDate || minDate) : equipment.daily_rate;
  const serviceFee = Math.round(rentalFee * 0.05);
  const totalPerDay = equipment.daily_rate + Math.round(equipment.daily_rate * 0.05);
  const ownerHasWhatsApp = !!equipment.owner?.whatsapp_number;

  return (
    <Layout>
      <div className="bg-white">
        <div className="container-custom py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
            <Link to={ROUTES.HOME} className="hover:text-gray-600 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            {equipment.category && (
              <>
                <Link to={ROUTES.EQUIPMENT} className="hover:text-gray-600 transition-colors">{equipment.category.name}</Link>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
            <span className="text-gray-700 font-medium">{equipment.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_340px] gap-10">

            {/* ── Left column ─────────────────────────────── */}
            <div>
              {/* Main image */}
              <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3] mb-3">
                {allImages[activeImage]
                  ? <img src={allImages[activeImage]} alt={equipment.name} className="w-full h-full object-cover" />
                  : <div className="flex items-center justify-center h-full"><Package className="h-24 w-24 text-gray-200" /></div>
                }
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mb-6">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-20 rounded-xl overflow-hidden bg-gray-100 border-2 flex-shrink-0 transition-colors ${i === activeImage ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Availability badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${equipment.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${equipment.is_available ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  {equipment.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                {equipment.name}
                <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-5">
                {equipment.category && <span>{equipment.category.name}</span>}
                {equipment.location && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {equipment.location}
                    </div>
                  </>
                )}
                {equipment.condition && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="capitalize">{equipment.condition}</span>
                  </>
                )}
              </div>

              {/* Description */}
              {equipment.description && (
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed text-sm">{equipment.description}</p>
                </div>
              )}

              {/* Specs strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl mb-6">
                <SpecItem icon={<Calendar className="h-4 w-4" />} label="Min. rental" value="1 day" />
                <SpecItem icon={<Shield className="h-4 w-4" />} label="Security deposit" value={deposit > 0 ? formatCurrency(deposit) : 'None'} />
                <SpecItem icon={<MapPin className="h-4 w-4" />} label="Pickup only" value={equipment.location || 'See description'} />
              </div>

              {/* Owner */}
              {equipment.owner && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  {equipment.owner.avatar_url ? (
                    <img src={equipment.owner.avatar_url} alt={equipment.owner.name} className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {equipment.owner.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-gray-900">{equipment.owner.name}</p>
                      {equipment.owner.email_verified && equipment.owner.whatsapp_number && equipment.owner.account_number && (
                        <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-label="Verified member" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Item owner</p>
                  </div>
                  {ownerHasWhatsApp && !adminUser && (
                    <button
                      onClick={handleWhatsApp}
                      className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: Booking panel ─────────────────────── */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
                {/* Price */}
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(equipment.daily_rate)}</span>
                    <span className="text-sm text-gray-400 ml-1">/ day</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Pickup only</span>
                </div>

                {/* Date pickers */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="border border-gray-200 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Pick-up date</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <input
                        type="date"
                        value={startDate}
                        min={minDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (endDate && e.target.value > endDate) setEndDate('');
                        }}
                        className="flex-1 text-sm text-gray-700 bg-transparent outline-none cursor-pointer min-w-0"
                      />
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Return date</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <input
                        type="date"
                        value={endDate}
                        min={startDate || minDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="flex-1 text-sm text-gray-700 bg-transparent outline-none cursor-pointer min-w-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 mb-4 pt-4 border-t border-gray-100">
                  {startDate && endDate && days > 0 ? (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatCurrency(equipment.daily_rate)} × {days} day{days !== 1 ? 's' : ''}</span>
                        <span>{formatCurrency(rentalFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Service fee (5%)</span>
                        <span>{formatCurrency(serviceFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span>{formatCurrency(rentalFee + serviceFee)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatCurrency(equipment.daily_rate)} × 1 day</span>
                        <span>{formatCurrency(equipment.daily_rate)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Service fee (5%)</span>
                        <span>{formatCurrency(Math.round(equipment.daily_rate * 0.1))}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Per day</span>
                        <span>{formatCurrency(totalPerDay)}</span>
                      </div>
                    </>
                  )}
                  {deposit > 0 && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Security deposit (refundable)</span>
                      <span>{formatCurrency(deposit)}</span>
                    </div>
                  )}
                </div>

                {/* Deposit note */}
                {deposit > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl mb-3">
                    <Shield className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">A refundable security deposit of <strong>{formatCurrency(deposit)}</strong> will be charged and returned in full when the item is returned in good condition.</p>
                  </div>
                )}

                {/* Pickup note */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl mb-4">
                  <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700">Pickup only</p>
                    <p className="text-xs text-blue-500">Arrange collection with the owner after booking.</p>
                  </div>
                </div>

                {/* Fee transparency note */}
                <div className="text-xs text-gray-400 border-t pt-3">
                  <p>A <strong>5% service fee</strong> is added to your total at checkout to cover platform and payment processing costs.</p>
                </div>

                {/* CTA */}
                {isOwner ? (
                  <p className="text-center text-sm text-gray-400 py-2">This is your listing</p>
                ) : adminUser ? (
                  <Button onClick={() => navigate(-1)} variant="outline" className="w-full rounded-xl">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Go back
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleBook}
                      disabled={!equipment.is_available}
                      className="w-full rounded-xl h-11 font-semibold mb-2"
                    >
                      {equipment.is_available ? 'Send rental request' : 'Currently unavailable'}
                    </Button>
                    {ownerHasWhatsApp && (
                      <Button
                        variant="outline"
                        onClick={handleWhatsApp}
                        className="w-full rounded-xl h-11 font-medium flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message on WhatsApp
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

const SpecItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center text-center gap-1">
    <div className="text-gray-400">{icon}</div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="text-xs font-semibold text-gray-700 truncate max-w-full">{value}</p>
  </div>
);
