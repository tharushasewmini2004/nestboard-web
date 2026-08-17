import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PropertyCard } from '@/components/PropertyCard';
import { api } from '@/lib/api';
import type { Property } from '@/types';

export function FavouritesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.favourites.list()
      .then(setProperties)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-nest-200 border-t-nest-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold dark:text-stone-100">Favourites</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">Properties you&apos;ve saved for later.</p>

      {error && <div className="alert-error mt-4">{error}</div>}

      {properties.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-stone-500 dark:text-stone-400">No saved properties yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">Browse properties</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      )}
    </div>
  );
}
