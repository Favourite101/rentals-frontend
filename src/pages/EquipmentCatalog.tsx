import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { equipmentApi, EquipmentSort } from '@/lib/api/equipment';
import { QUERY_KEYS } from '@/constants';
import { Search, SlidersHorizontal, Package, X, ChevronDown, MapPin } from 'lucide-react';
import { debounce } from '@/lib/utils/helpers';

type SortOption = { value: EquipmentSort | ''; label: string };

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
];

export const EquipmentCatalog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [inputValue, setInputValue] = React.useState(initialQuery);
  const [locationValue, setLocationValue] = React.useState('');
  const [locationQuery, setLocationQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = React.useState(false);
  const [sort, setSort] = React.useState<EquipmentSort>('newest');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

  const { data: categories = [] } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: equipmentApi.getAllCategories,
  });

  const { data: equipmentData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.EQUIPMENT_LIST],
    queryFn: () => equipmentApi.getAll(undefined, undefined, 0, 200),
  });
  const equipment = equipmentData?.items ?? [];

  const filteredEquipment = React.useMemo(() => {
    let filtered = equipment;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (locationQuery) {
      filtered = filtered.filter((item) =>
        item.location?.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category_id === selectedCategory);
    }
    if (showAvailableOnly) {
      filtered = filtered.filter((item) => item.is_available);
    }
    if (minPrice !== '') {
      filtered = filtered.filter((item) => item.daily_rate >= Number(minPrice));
    }
    if (maxPrice !== '') {
      filtered = filtered.filter((item) => item.daily_rate <= Number(maxPrice));
    }

    // Client-side sort
    return [...filtered].sort((a, b) => {
      if (sort === 'price_asc') return a.daily_rate - b.daily_rate;
      if (sort === 'price_desc') return b.daily_rate - a.daily_rate;
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // newest
    });
  }, [equipment, searchQuery, locationQuery, selectedCategory, showAvailableOnly, sort, minPrice, maxPrice]);

  const handleSearchChange = React.useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  const handleLocationChange = React.useMemo(
    () => debounce((value: string) => setLocationQuery(value), 300),
    []
  );

  const clearAll = () => {
    setSearchQuery(''); setInputValue('');
    setLocationQuery(''); setLocationValue('');
    setSelectedCategory(null);
    setShowAvailableOnly(false);
    setSort('newest');
    setMinPrice(''); setMaxPrice('');
  };

  const hasActiveFilters = searchQuery || locationQuery || selectedCategory || showAvailableOnly || minPrice !== '' || maxPrice !== '';

  if (isLoading) {
    return <Layout><PageLoader /></Layout>;
  }

  return (
    <Layout>
      {/* ── Top search bar ───────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white sticky top-28 z-30">
        <div className="container-custom py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleSearchChange(e.target.value);
                }}
                placeholder="What would you like to rent?"
                className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
              />
              {inputValue && (
                <button onClick={() => { setInputValue(''); setSearchQuery(''); }} className="text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2 bg-white cursor-pointer hover:border-gray-300 transition-colors min-w-[150px]">
              <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <select
                className="flex-1 text-sm text-gray-600 bg-transparent outline-none cursor-pointer appearance-none"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            </div>

            <Button className="rounded-xl px-5 h-10 text-sm font-medium flex-shrink-0">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container-custom py-6">
          <div className="flex gap-6">

            {/* ── Sidebar ─────────────────────────────────── */}
            {sidebarOpen && (
              <aside className="hidden md:block w-56 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-36">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                      <button onClick={clearAll} className="text-xs text-primary font-medium hover:text-primary/80">
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Location */}
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location
                    </h4>
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5 focus-within:border-primary/50">
                      <input
                        type="text"
                        value={locationValue}
                        onChange={(e) => {
                          setLocationValue(e.target.value);
                          handleLocationChange(e.target.value);
                        }}
                        placeholder="City or area..."
                        className="flex-1 text-xs text-gray-700 placeholder:text-gray-400 bg-transparent outline-none"
                      />
                      {locationValue && (
                        <button onClick={() => { setLocationValue(''); setLocationQuery(''); }}>
                          <X className="h-3 w-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center justify-between">
                      Categories
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </h4>
                    <ul className="space-y-0.5">
                      <li>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!selectedCategory ? 'text-primary bg-primary/5 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          All categories
                        </button>
                      </li>
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <button
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${selectedCategory === cat.id ? 'text-primary bg-primary/5 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price range */}
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2.5">Price per day (₦)</h4>
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
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div
                        onClick={() => setShowAvailableOnly(v => !v)}
                        className={`relative h-4 w-4 rounded border-2 flex-shrink-0 transition-colors cursor-pointer ${showAvailableOnly ? 'bg-primary border-primary' : 'border-gray-300 group-hover:border-gray-400'}`}
                      >
                        {showAvailableOnly && (
                          <svg className="absolute inset-0 h-full w-full text-white p-0.5" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span onClick={() => setShowAvailableOnly(v => !v)} className="text-sm text-gray-600 cursor-pointer">
                        Available only
                      </span>
                    </label>
                  </div>
                </div>
              </aside>
            )}

            {/* ── Results ─────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(v => !v)}
                    className="md:hidden text-sm text-gray-600 flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                  </button>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{filteredEquipment.length}</span> items
                  </p>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="hidden sm:inline text-xs">Sort by:</span>
                  <select
                    className="text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-gray-300"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as EquipmentSort)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active filter pills */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      "{searchQuery}"
                      <button onClick={() => { setSearchQuery(''); setInputValue(''); }}><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {locationQuery && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      <MapPin className="h-3 w-3" />{locationQuery}
                      <button onClick={() => { setLocationQuery(''); setLocationValue(''); }}><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      {categories.find((c) => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory(null)}><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {showAvailableOnly && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      Available only
                      <button onClick={() => setShowAvailableOnly(false)}><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {(minPrice !== '' || maxPrice !== '') && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                      ₦{minPrice || '0'} – {maxPrice ? `₦${maxPrice}` : 'any'}
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X className="h-3 w-3" /></button>
                    </span>
                  )}
                </div>
              )}

              {/* Grid */}
              {filteredEquipment.length > 0 ? (
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredEquipment.map((item) => (
                    <EquipmentCard key={item.id} equipment={item} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No items found"
                  description="Try adjusting your filters or search query."
                  action={<Button onClick={clearAll} variant="outline">Clear filters</Button>}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
