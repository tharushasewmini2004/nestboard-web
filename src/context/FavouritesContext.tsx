import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

interface FavouritesContextValue {
  favouriteIds: Set<string>;
  loading: boolean;
  isFavourite: (propertyId: string) => boolean;
  toggleFavourite: (propertyId: string) => Promise<void>;
  refreshFavourites: () => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavourites = useCallback(async () => {
    if (!user) {
      setFavouriteIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const items = await api.favourites.list();
      setFavouriteIds(new Set(items.map((p) => p.id)));
    } catch {
      setFavouriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshFavourites();
  }, [refreshFavourites]);

  const isFavourite = (propertyId: string) => favouriteIds.has(propertyId);

  const toggleFavourite = async (propertyId: string) => {
    if (!user) throw new Error('Login required');
    if (favouriteIds.has(propertyId)) {
      await api.favourites.remove(propertyId);
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    } else {
      await api.favourites.add(propertyId);
      setFavouriteIds((prev) => new Set(prev).add(propertyId));
    }
  };

  return (
    <FavouritesContext.Provider value={{ favouriteIds, loading, isFavourite, toggleFavourite, refreshFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider');
  return ctx;
}
