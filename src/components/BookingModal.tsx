import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import type { Booking, PropertyDetail, Room, RoomType } from '@/types';
import { api, nextMonthInput } from '@/lib/api';
import { useFormatPrice } from '@/context/CurrencyContext';

interface BookingModalProps {
  property: PropertyDetail;
  open: boolean;
  onClose: () => void;
  onCreated: (booking: Booking) => void;
}

export function BookingModal({ property, open, onClose, onCreated }: BookingModalProps) {
  const formatPrice = useFormatPrice();
  const [startMonth, setStartMonth] = useState(nextMonthInput());
  const [duration, setDuration] = useState(Math.max(property.minimumStay, 3));
  const [roomTypeId, setRoomTypeId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [seatNumber, setSeatNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<PropertyDetail | null>(null);

  const selectedRoomType = (availability ?? property).roomTypes.find((rt) => rt.id === roomTypeId);
  const roomsForType = (availability ?? property).rooms.filter(
    (r) => r.roomTypeId === roomTypeId && r.active
  );
  const pricePerMonth = selectedRoomType?.pricePerMonth ?? 0;
  const total = pricePerMonth * duration;

  useEffect(() => {
    if (!open) return;
    setStartMonth(nextMonthInput());
    setDuration(Math.max(property.minimumStay, 3));
    setRoomTypeId('');
    setRoomId('');
    setSeatNumber(1);
    setError('');
  }, [open, property]);

  useEffect(() => {
    if (!open || !startMonth) return;
    let cancelled = false;
    api.properties.get(property.id, { startMonth, duration })
      .then((data) => { if (!cancelled) setAvailability(data); })
      .catch(() => { if (!cancelled) setAvailability(null); });
    return () => { cancelled = true; };
  }, [open, property.id, startMonth, duration]);

  useEffect(() => {
    const types = (availability ?? property).roomTypes.filter((rt) => rt.active);
    if (types.length && !roomTypeId) setRoomTypeId(types[0].id);
  }, [availability, property, roomTypeId]);

  useEffect(() => {
    if (roomsForType.length && !roomsForType.some((r) => r.id === roomId)) {
      setRoomId(roomsForType[0].id);
    }
  }, [roomsForType, roomId]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTypeId || !roomId) {
      setError('Please select a room type and room');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const booking = await api.bookings.create({
        propertyId: property.id,
        roomTypeId,
        roomId,
        seatNumber,
        startMonth,
        durationMonths: duration,
      });
      onCreated(booking);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoomTypeOption = (rt: RoomType) => (
    <option key={rt.id} value={rt.id}>
      {rt.name} — {formatPrice(rt.pricePerMonth).primary}/mo
      {rt.availableSeats !== undefined ? ` (${rt.availableSeats} seats free)` : ''}
    </option>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-800">
          <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Book your stay</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <p className="text-sm text-stone-600 dark:text-stone-400">{property.title} · Min. {property.minimumStay} month(s)</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Start month</span>
              <input
                type="month"
                className="input-field"
                value={startMonth}
                min={nextMonthInput()}
                onChange={(e) => setStartMonth(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Duration (months)</span>
              <input
                type="number"
                className="input-field"
                min={property.minimumStay}
                max={24}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Room type</span>
            <select
              className="input-field"
              value={roomTypeId}
              onChange={(e) => { setRoomTypeId(e.target.value); setSeatNumber(1); }}
              required
            >
              {(availability ?? property).roomTypes.filter((rt) => rt.active).map(renderRoomTypeOption)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Room</span>
            <select className="input-field" value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
              {roomsForType.map((r: Room) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Seat</span>
            <select
              className="input-field"
              value={seatNumber}
              onChange={(e) => setSeatNumber(Number(e.target.value))}
              required
            >
              {Array.from({ length: selectedRoomType?.seatCapacity ?? 1 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>Seat {n}</option>
              ))}
            </select>
          </label>

          <div className="rounded-xl bg-nest-50 px-4 py-3 dark:bg-nest-900/40">
            <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
              <span>{duration} × {formatPrice(pricePerMonth).primary}</span>
              <span className="font-display text-lg font-bold text-nest-800 dark:text-nest-300">{formatPrice(total).primary}</span>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
              <Clock className="h-3.5 w-3.5" /> 15-minute payment window after booking
            </p>
          </div>

          {error && (
            <div className="alert-error text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Creating…' : 'Create booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
