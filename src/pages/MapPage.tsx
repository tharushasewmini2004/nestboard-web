import { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { api } from '@/lib/api';
import type { Property } from '@/types';

const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612]; // Colombo, Sri Lanka
const DEFAULT_ZOOM = 8;

function getLocation(timeoutMs = 4000): Promise<[number, number]> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_CENTER);
      return;
    }

    const timer = setTimeout(() => resolve(DEFAULT_CENTER), timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        clearTimeout(timer);
        resolve(DEFAULT_CENTER);
      },
      { timeout: timeoutMs, maximumAge: 60000 }
    );
  });
}

export function MapPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [lat, lng] = await getLocation();
        if (cancelled) return;
        setCenter([lat, lng]);

        let items: Property[] = [];
        try {
          items = await api.properties.map(lat, lng, 150000);
        } catch {
          // API unavailable — try again with list endpoint below
        }

        // Fallback: load all properties if nearby search is empty or API down
        if (items.length === 0) {
          try {
            const page = await api.properties.list({ limit: 50 });
            items = page.items;
            // Keep map centered on Sri Lanka unless user location is in SL
            if (items.length > 0 && lat > 5 && lat < 10 && lng > 79 && lng < 82) {
              setCenter([lat, lng]);
            } else {
              setCenter(DEFAULT_CENTER);
            }
          } catch (e) {
            throw e;
          }
        }

        if (!cancelled) setProperties(items);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load properties');
          setProperties([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold dark:text-stone-100">Map view</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">Explore co-living properties near you.</p>

      {error && (
        <div className="alert-warning mt-4">
          {error} — map is still shown below.
        </div>
      )}

      <div className="relative mt-6">
        <MapView properties={properties} center={center} zoom={properties.length ? DEFAULT_ZOOM : DEFAULT_ZOOM - 1} />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm dark:bg-stone-950/60">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-nest-200 border-t-nest-600" />
          </div>
        )}
      </div>

      <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
        {loading ? 'Loading properties…' : `${properties.length} properties on map`}
      </p>
    </div>
  );
}
