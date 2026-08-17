import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import type { Property } from '@/types';
import { imageUrl } from '@/lib/api';
import { useFormatPrice } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();
  const formatPrice = useFormatPrice();
  const navigate = useNavigate();
  const saved = isFavourite(property.id);
  const img = property.images[0] ? imageUrl(property.images[0]) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';

  const handleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: `/properties/${property.id}` } });
      return;
    }
    try {
      await toggleFavourite(property.id);
    } catch {
      /* ignore */
    }
  };

  return (
    <Link to={`/properties/${property.id}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <img
          src={img}
          alt={property.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={handleFavourite}
          className={`absolute right-3 top-3 rounded-full p-2 shadow-sm transition ${
            saved ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-600 hover:text-red-500 dark:bg-stone-900/90 dark:text-stone-300'
          }`}
          aria-label={saved ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold uppercase text-stone-700 dark:bg-stone-900/90 dark:text-stone-300">
          {property.type}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight text-stone-900 dark:text-stone-100">{property.title}</h3>
          {property.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-stone-700 dark:text-stone-300">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {property.rating}
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <MapPin className="h-3.5 w-3.5" /> {property.city}
        </p>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
          From <span className="text-price">{formatPrice(property.startingPrice).primary}</span>/mo
        </p>
      </div>
    </Link>
  );
}
