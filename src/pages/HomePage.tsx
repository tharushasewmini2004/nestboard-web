import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { PropertyCard } from '@/components/PropertyCard';
import { api } from '@/lib/api';
import type { Property, PropertyFilters } from '@/types';

const PROPERTY_TYPES = ['HOUSE', 'VILLA', 'APARTMENT', 'HOTEL'] as const;
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'rating', label: 'Top rated' },
] as const;

function filtersFromParams(params: URLSearchParams): PropertyFilters {
  return {
    q: params.get('q') || undefined,
    city: params.get('city') || undefined,
    type: params.get('type') || undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    minRating: params.get('minRating') ? Number(params.get('minRating')) : undefined,
    sort: (params.get('sort') as PropertyFilters['sort']) || 'recent',
    page: 1,
    limit: 12,
  };
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [type, setType] = useState(searchParams.get('type') ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'recent');

  const hasMore = properties.length < total;

  const loadPage = useCallback(async (pageNum: number, replace: boolean) => {
    const filters = filtersFromParams(searchParams);
    filters.page = pageNum;

    if (replace) setLoading(true);
    else setLoadingMore(true);
    setError('');

    try {
      const data = await api.properties.list(filters);
      setTotal(data.total);
      setPage(data.page);
      setProperties((prev) => (replace ? data.items : [...prev, ...data.items]));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load properties');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPage(1, true);
  }, [searchParams, loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadPage(page + 1, false);
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, loadPage]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (city) next.set('city', city);
    if (type) next.set('type', type);
    if (minPrice) next.set('minPrice', minPrice);
    if (maxPrice) next.set('maxPrice', maxPrice);
    if (minRating) next.set('minRating', minRating);
    if (sort && sort !== 'recent') next.set('sort', sort);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setQ('');
    setCity('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('recent');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-nest-700 via-nest-600 to-emerald-500 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold md:text-5xl">Find your next co-living home</h1>
          <p className="mt-4 text-lg text-nest-100">
            Discover community-driven spaces with flexible stays and shared amenities.
          </p>
          <form onSubmit={applyFilters} className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                className="input-field-light pl-11"
                placeholder="Search properties…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold dark:text-stone-100">Browse properties</h2>
            {!loading && (
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{total} result{total !== 1 ? 's' : ''} found</p>
            )}
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <form onSubmit={applyFilters} className="card mt-4 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className="label-muted mb-1 block">City</span>
              <input className="input-field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Colombo" />
            </label>
            <label>
              <span className="label-muted mb-1 block">Type</span>
              <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All types</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              <span className="label-muted mb-1 block">Min price</span>
              <input type="number" className="input-field" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
            </label>
            <label>
              <span className="label-muted mb-1 block">Max price</span>
              <input type="number" className="input-field" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="50000" />
            </label>
            <label>
              <span className="label-muted mb-1 block">Min rating</span>
              <input type="number" step="0.1" min="0" max="5" className="input-field" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
            </label>
            <label>
              <span className="label-muted mb-1 block">Sort</span>
              <select className="input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <div className="flex items-end gap-2 sm:col-span-2">
              <button type="submit" className="btn-primary flex-1">
                <Filter className="h-4 w-4" /> Apply
              </button>
              <button type="button" className="btn-secondary" onClick={clearFilters}>Clear</button>
            </div>
          </form>
        )}

        {error && <div className="alert-error mt-4">{error}</div>}

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-72 animate-pulse bg-stone-100 dark:bg-stone-800" />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-12 text-center text-stone-500 dark:text-stone-400">No properties match your filters.</div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
            <div ref={sentinelRef} className="py-8 text-center">
              {loadingMore && (
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-nest-200 border-t-nest-600" />
              )}
              {!hasMore && properties.length > 0 && (
                <p className="text-sm text-stone-400 dark:text-stone-500">You&apos;ve seen all {total} properties</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
