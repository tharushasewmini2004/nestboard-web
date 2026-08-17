import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star, Wind } from 'lucide-react';
import { BookingModal } from '@/components/BookingModal';
import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';
import { api, imageUrl } from '@/lib/api';
import { useFormatPrice } from '@/context/CurrencyContext';
import type { Booking, PropertyDetail } from '@/types';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();
  const formatPrice = useFormatPrice();
  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.properties.get(id)
      .then(setProperty)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!user) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    setBookingOpen(true);
  };

  const handleFavourite = async () => {
    if (!user || !property) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    await toggleFavourite(property.id);
  };

  const handleCreated = (booking: Booking) => {
    navigate('/bookings', { state: { confirmId: booking.id } });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-nest-200 border-t-nest-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-600 dark:text-red-400">{error || 'Property not found'}</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back to browse</Link>
      </div>
    );
  }

  const img = property.images[0] ? imageUrl(property.images[0]) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200';
  const saved = isFavourite(property.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-nest-700 dark:text-stone-400 dark:hover:text-nest-400">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="overflow-hidden rounded-2xl">
        <img src={img} alt={property.title} className="aspect-[21/9] w-full object-cover" />
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">{property.title}</h1>
            <span className="rounded-lg bg-nest-100 px-2 py-1 text-xs font-semibold uppercase text-nest-800 dark:bg-nest-900/50 dark:text-nest-300">
              {property.type}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1 text-stone-600 dark:text-stone-400">
            <MapPin className="h-4 w-4" /> {property.address}, {property.city}
          </p>
          {property.rating > 0 && (
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-stone-700 dark:text-stone-300">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {property.rating} ({property.reviewCount} reviews)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={handleFavourite} className="btn-secondary">
            <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button type="button" onClick={handleBook} className="btn-primary">
            Book now — from {formatPrice(property.startingPrice).primary}/mo
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="card p-6">
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">About</h2>
            <p className="mt-3 leading-relaxed text-stone-600 dark:text-stone-400">{property.description}</p>
          </section>

          <section className="card mt-6 p-6">
            <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Room types</h2>
            <div className="mt-4 space-y-4">
              {property.roomTypes.filter((rt) => rt.active).map((rt) => (
                <div key={rt.id} className="flex items-center justify-between rounded-xl border border-stone-100 p-4 dark:border-stone-800">
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{rt.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                      {rt.seatCapacity} seat{rt.seatCapacity > 1 ? 's' : ''}
                      {rt.hasAC && (
                        <span className="flex items-center gap-1 text-nest-700">
                          <Wind className="h-3.5 w-3.5" /> AC
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-price">{formatPrice(rt.pricePerMonth).primary}/mo</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="card p-6">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">Amenities</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <li key={a} className="rounded-lg bg-stone-100 px-3 py-1 text-sm dark:bg-stone-800 dark:text-stone-300">{a}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">Minimum stay: {property.minimumStay} month(s)</p>
            <button type="button" onClick={handleBook} className="btn-primary mt-4 w-full">
              Start booking
            </button>
          </div>
        </aside>
      </div>

      <BookingModal
        property={property}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
