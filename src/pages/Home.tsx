import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { EquipmentCardSkeleton } from '@/components/ui/Skeleton';
import { equipmentApi } from '@/lib/api/equipment';
import { ROUTES, QUERY_KEYS } from '@/constants';
import {
  Search, MapPin, SlidersHorizontal, ChevronDown,
  ChevronRight, Shield, CreditCard, MessageSquare, Users,
  Flame,
} from 'lucide-react';

const TRENDING_TAGS = ['Cameras', 'Projectors', 'PS5', 'Speakers', 'Dresses', 'Camping Gear'];

const CATEGORY_TILES = [
  { label: 'Cameras & Gear', count: '124+ items', from: 'From ₦5,000/day', color: 'bg-gray-800' },
  { label: 'Event Equipment', count: '82+ items', from: 'From ₦3,000/day', color: 'bg-indigo-900' },
  { label: 'Gaming Consoles', count: '45+ items', from: 'From ₦7,000/day', color: 'bg-slate-900' },
  { label: 'Fashion & Style', count: '68+ items', from: 'From ₦2,500/day', color: 'bg-purple-900' },
  { label: 'Work From Home', count: '73+ items', from: 'From ₦1,500/day', color: 'bg-zinc-800' },
];

const TRUST_ITEMS = [
  { icon: Users, label: 'Verified users', sub: 'All hosts are ID verified' },
  { icon: CreditCard, label: 'Secure payments', sub: 'Payments held safely' },
  { icon: Shield, label: 'Damage protection', sub: 'Up to ₦1M coverage' },
  { icon: MessageSquare, label: 'In-app chat', sub: 'Chat before you rent' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = React.useState(false);
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

  const { data: categories = [] } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: equipmentApi.getAllCategories,
  });

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT_AVAILABLE],
    queryFn: () => equipmentApi.getAvailable(),
  });

  const filteredItems = React.useMemo(() => {
    let items = equipment;
    if (searchInput) items = items.filter(i => i.name.toLowerCase().includes(searchInput.toLowerCase()));
    if (selectedCategory) items = items.filter(i => i.category_id === selectedCategory);
    if (showAvailableOnly) items = items.filter(i => i.is_available);
    if (minPrice !== '') items = items.filter(i => i.daily_rate >= Number(minPrice));
    if (maxPrice !== '') items = items.filter(i => i.daily_rate <= Number(maxPrice));
    return items;
  }, [equipment, searchInput, selectedCategory, showAvailableOnly, minPrice, maxPrice]);

  const recentItems = equipment.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchInput.trim()
      ? `${ROUTES.EQUIPMENT}?q=${encodeURIComponent(searchInput.trim())}`
      : ROUTES.EQUIPMENT
    );
  };

  return (
    <Layout>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background image — right ¾, fades left & bottom */}
        <div className="absolute inset-y-0 right-0 w-3/4 hidden lg:block pointer-events-none select-none">
          <img
            src="https://images.unsplash.com/photo-1486257293255-8810a92c541f?w=1400&q=80&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Left fade → into text */}
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-gray-50 to-transparent" />
          {/* Bottom fade → towards trending searches */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        <div className="container-custom pt-10 pb-6 relative z-10">
          {/* Headline */}
          <div className="mb-6 lg:w-1/2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight whitespace-nowrap">
              Rent what you need,
            </h1>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight mb-3 whitespace-nowrap">
              from people near you.
            </h1>
            <p className="text-gray-500 text-sm font-bold">The trusted community marketplace for Lagos.</p>
          </div>

          {/* Search + trending card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 relative z-10">
            {/* Search row */}
            <form onSubmit={handleSearch} className="flex items-stretch overflow-hidden rounded-xl border border-gray-100 mb-3">
              <div className="flex items-center gap-2 flex-1 px-4 py-3 border-r border-gray-100 min-w-0">
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="What would you like to rent?"
                  className="flex-1 min-w-0 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
                />
              </div>

              <div className="hidden md:flex items-center gap-2 px-4 py-3 border-r border-gray-100 w-40 flex-shrink-0">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 font-medium truncate">Lagos, Nigeria</span>
              </div>

              <button
                type="submit"
                className="bg-primary text-white font-semibold text-sm px-5 py-3 hover:bg-primary/90 transition-colors flex-shrink-0 rounded-r-xl"
              >
                <span className="hidden sm:inline">Search</span>
                <Search className="h-4 w-4 sm:hidden" />
              </button>
            </form>

            {/* Trending tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Trending:</span>
              {TRENDING_TAGS.map(tag => (
                <Link
                  key={tag}
                  to={`${ROUTES.EQUIPMENT}?q=${encodeURIComponent(tag)}`}
                  className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Items section with sidebar ─────────────────────────── */}
      <div className="container-custom py-6">
          <div className="flex gap-6">

            {/* Sidebar */}
            <aside className="hidden lg:block w-52 flex-shrink-0 -mt-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-20 md:top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                  {(selectedCategory || showAvailableOnly) && (
                    <button
                      onClick={() => { setSelectedCategory(null); setShowAvailableOnly(false); }}
                      className="text-xs text-primary font-medium"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-700">Categories</h4>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${!selectedCategory ? 'text-primary font-semibold bg-primary/5' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <SlidersHorizontal className="h-3 w-3 flex-shrink-0" />
                        All categories
                      </button>
                    </li>
                    {categories.map(cat => (
                      <li key={cat.id}>
                        <button
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${selectedCategory === cat.id ? 'text-primary font-semibold bg-primary/5' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price range */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Price per day (₦)</h4>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary/50 bg-transparent"
                    />
                    <span className="text-gray-300 flex-shrink-0">–</span>
                    <input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary/50 bg-transparent"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2.5">Availability</h4>
                  <label className="flex items-center gap-2 cursor-pointer" onClick={() => setShowAvailableOnly(v => !v)}>
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${showAvailableOnly ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                      {showAvailableOnly && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">Available only</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Items grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">
                  {filteredItems.length} items available
                </p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  Sort by:
                  <select className="font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none cursor-pointer text-xs">
                    <option>Recommended</option>
                    <option>Price: Low to high</option>
                    <option>Price: High to low</option>
                  </select>
                </div>
              </div>

              {equipmentLoading ? (
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => <EquipmentCardSkeleton key={i} />)}
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {filteredItems.slice(0, 8).map(item => (
                    <EquipmentCard key={item.id} equipment={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <p className="font-medium">No items found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                  <button
                    className="mt-3 text-sm text-primary font-medium"
                    onClick={() => { setSelectedCategory(null); setShowAvailableOnly(false); setSearchInput(''); }}
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {filteredItems.length > 0 && (
                <div className="mt-6 text-center">
                  <Link to={ROUTES.EQUIPMENT}>
                    <Button variant="outline" className="rounded-xl">
                      View all items <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* ── Trending rentals ───────────────────────────────────── */}
      <section className="bg-white py-10">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Trending rentals <Flame className="h-4 w-4 text-orange-500" />
            </h2>
            <Link to={ROUTES.EQUIPMENT} className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CATEGORY_TILES.map(cat => (
              <Link
                key={cat.label}
                to={ROUTES.EQUIPMENT}
                className={`relative rounded-2xl overflow-hidden aspect-square ${cat.color} group`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 p-3 flex flex-col justify-end">
                  <p className="text-white font-semibold text-sm leading-tight">{cat.label}</p>
                  <p className="text-white/60 text-xs mt-0.5">{cat.count}</p>
                  <p className="text-white/60 text-xs">{cat.from}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently added ─────────────────────────────────────── */}
      {recentItems.length > 0 && (
        <section className="bg-gray-50 py-10">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recently added</h2>
                <p className="text-xs text-gray-400 mt-0.5">New items from our community</p>
              </div>
              <Link to={ROUTES.EQUIPMENT} className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {recentItems.map(item => (
                <EquipmentCard key={item.id} equipment={item} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trust strip ────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-7">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="bg-indigo-900">
        <div className="container-custom py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-2">
                Give your items a second life.
              </h2>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Earn from what you already own while helping others access what they need.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link to={ROUTES.EQUIPMENT}>
                <Button variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-medium px-6 rounded-xl">
                  Start renting
                </Button>
              </Link>
              <Link to={ROUTES.MY_LISTINGS}>
                <Button className="bg-white text-indigo-900 hover:bg-white/90 font-semibold px-6 rounded-xl">
                  Become a host
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
};
