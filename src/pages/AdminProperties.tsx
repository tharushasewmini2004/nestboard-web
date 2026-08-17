import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { AdminCard, AdminPageShell } from '@/components/AdminLayout';
import { api } from '@/lib/api';
import { useFormatPrice } from '@/context/CurrencyContext';
import type { CreatePropertyPayload, CreateRoomPayload, CreateRoomTypePayload, Property, PropertyDetail, PropertyType, RoomType } from '@/types';

const PROPERTY_TYPES: PropertyType[] = ['HOUSE', 'VILLA', 'APARTMENT', 'HOTEL'];

const emptyProperty: CreatePropertyPayload = {
  title: '',
  description: '',
  address: '',
  city: '',
  type: 'APARTMENT',
  amenities: [],
  latitude: 6.9271,
  longitude: 79.8612,
  minimumStay: 1,
  images: [],
};

export function AdminProperties() {
  const formatPrice = useFormatPrice();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, PropertyDetail>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreatePropertyPayload>(emptyProperty);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [roomTypeForms, setRoomTypeForms] = useState<Record<string, CreateRoomTypePayload>>({});
  const [roomForms, setRoomForms] = useState<Record<string, CreateRoomPayload>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProperties(await api.admin.properties());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!expanded) return;
    api.properties.get(expanded)
      .then((d) => setDetails((prev) => ({ ...prev, [expanded]: d })))
      .catch(() => {});
  }, [expanded, properties]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const resetForm = () => {
    setForm(emptyProperty);
    setAmenitiesInput('');
    setEditId(null);
    setShowForm(false);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      amenities: amenitiesInput.split(',').map((a) => a.trim()).filter(Boolean),
    };
    try {
      if (editId) {
        await api.admin.updateProperty(editId, payload);
      } else {
        await api.admin.createProperty(payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Deactivate this property?')) return;
    try {
      await api.admin.deleteProperty(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const startEdit = (p: Property) => {
    setEditId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      address: p.address,
      city: p.city,
      type: p.type,
      amenities: p.amenities,
      latitude: p.latitude,
      longitude: p.longitude,
      minimumStay: p.minimumStay,
      images: p.images,
    });
    setAmenitiesInput(p.amenities.join(', '));
    setShowForm(true);
  };

  const handleCreateRoomType = async (propertyId: string) => {
    const data = roomTypeForms[propertyId];
    if (!data?.name) return;
    try {
      await api.admin.createRoomType(propertyId, data);
      setRoomTypeForms((prev) => ({ ...prev, [propertyId]: { name: '', pricePerMonth: 15000, seatCapacity: 2, hasAC: false } }));
      const detail = await api.properties.get(propertyId);
      setDetails((prev) => ({ ...prev, [propertyId]: detail }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room type');
    }
  };

  const handleCreateRoom = async (roomTypeId: string, propertyId: string) => {
    const data = roomForms[roomTypeId];
    if (!data?.label) return;
    try {
      await api.admin.createRoom(roomTypeId, data);
      setRoomForms((prev) => ({ ...prev, [roomTypeId]: { label: '' } }));
      const detail = await api.properties.get(propertyId);
      setDetails((prev) => ({ ...prev, [propertyId]: detail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const handleDeleteRoomType = async (id: string, propertyId: string) => {
    if (!confirm('Deactivate this room type?')) return;
    try {
      await api.admin.deleteRoomType(id);
      const detail = await api.properties.get(propertyId);
      setDetails((prev) => ({ ...prev, [propertyId]: detail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleDeleteRoom = async (id: string, propertyId: string) => {
    if (!confirm('Deactivate this room?')) return;
    try {
      await api.admin.deleteRoom(id);
      const detail = await api.properties.get(propertyId);
      setDetails((prev) => ({ ...prev, [propertyId]: detail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <AdminPageShell title="Properties">
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
        >
          <Plus className="h-4 w-4" /> Add property
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">{error}</div>
      )}

      {showForm && (
        <AdminCard className="mb-6">
          <h2 className="font-semibold text-white">{editId ? 'Edit property' : 'New property'}</h2>
          <form onSubmit={handleSaveProperty} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs text-stone-400">Title</span>
              <input className="input-field bg-stone-800 text-white" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs text-stone-400">Description</span>
              <textarea className="input-field min-h-[80px] bg-stone-800 text-white" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <label>
              <span className="mb-1 block text-xs text-stone-400">Address</span>
              <input className="input-field bg-stone-800 text-white" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </label>
            <label>
              <span className="mb-1 block text-xs text-stone-400">City</span>
              <input className="input-field bg-stone-800 text-white" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </label>
            <label>
              <span className="mb-1 block text-xs text-stone-400">Type</span>
              <select className="input-field bg-stone-800 text-white" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs text-stone-400">Min stay (months)</span>
              <input type="number" min={1} className="input-field bg-stone-800 text-white" value={form.minimumStay} onChange={(e) => setForm({ ...form, minimumStay: Number(e.target.value) })} />
            </label>
            <label>
              <span className="mb-1 block text-xs text-stone-400">Latitude</span>
              <input type="number" step="any" className="input-field bg-stone-800 text-white" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} />
            </label>
            <label>
              <span className="mb-1 block text-xs text-stone-400">Longitude</span>
              <input type="number" step="any" className="input-field bg-stone-800 text-white" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs text-stone-400">Amenities (comma-separated)</span>
              <input className="input-field bg-stone-800 text-white" value={amenitiesInput} onChange={(e) => setAmenitiesInput(e.target.value)} placeholder="WiFi, Gym, Kitchen" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </AdminCard>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-700 border-t-nest-600" />
        </div>
      ) : properties.length === 0 ? (
        <AdminCard><p className="text-stone-400">No properties yet. Create your first one.</p></AdminCard>
      ) : (
        <div className="space-y-3">
          {properties.map((p) => (
            <AdminCard key={p.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 text-left"
                onClick={() => toggleExpand(p.id)}
              >
                {expanded === p.id ? <ChevronDown className="h-4 w-4 text-stone-400" /> : <ChevronRight className="h-4 w-4 text-stone-400" />}
                <div className="flex-1">
                  <p className="font-semibold text-white">{p.title}</p>
                  <p className="text-sm text-stone-400">{p.city} · {p.type} · from {formatPrice(p.startingPrice).primary}/mo</p>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="btn-secondary py-1.5 text-xs" onClick={() => startEdit(p)}>Edit</button>
                  <button type="button" className="btn-danger py-1.5 text-xs" onClick={() => handleDeleteProperty(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </button>

              {expanded === p.id && (
                <div className="mt-4 border-t border-stone-800 pt-4">
                  {details[p.id]?.roomTypes.filter((rt) => rt.active).map((rt: RoomType) => (
                    <div key={rt.id} className="mb-4 rounded-xl border border-stone-800 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{rt.name}</p>
                          <p className="text-xs text-stone-400">
                            {formatPrice(rt.pricePerMonth).primary}/mo · {rt.seatCapacity} seats {rt.hasAC ? '· AC' : ''}
                          </p>
                        </div>
                        <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => handleDeleteRoomType(rt.id, p.id)}>
                          Remove
                        </button>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {details[p.id]?.rooms.filter((r) => r.roomTypeId === rt.id && r.active).map((r) => (
                          <li key={r.id} className="flex items-center justify-between text-sm text-stone-400">
                            <span>Room {r.label}</span>
                            <button type="button" className="text-xs text-red-400 hover:underline" onClick={() => handleDeleteRoom(r.id, p.id)}>
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 flex gap-2">
                        <input
                          className="input-field flex-1 bg-stone-800 text-white"
                          placeholder="New room label"
                          value={roomForms[rt.id]?.label ?? ''}
                          onChange={(e) => setRoomForms((prev) => ({ ...prev, [rt.id]: { label: e.target.value } }))}
                        />
                        <button type="button" className="btn-secondary py-2 text-xs" onClick={() => handleCreateRoom(rt.id, p.id)}>
                          Add room
                        </button>
                      </div>
                    </div>
                  ))}

                  <h3 className="text-sm font-semibold text-stone-300">Add room type</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <input
                      className="input-field bg-stone-800 text-white"
                      placeholder="Name"
                      value={roomTypeForms[p.id]?.name ?? ''}
                      onChange={(e) => setRoomTypeForms((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] ?? { pricePerMonth: 15000, seatCapacity: 2, hasAC: false }), name: e.target.value },
                      }))}
                    />
                    <input
                      type="number"
                      className="input-field bg-stone-800 text-white"
                      placeholder="Price/mo"
                      value={roomTypeForms[p.id]?.pricePerMonth ?? 15000}
                      onChange={(e) => setRoomTypeForms((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] ?? { name: '', seatCapacity: 2, hasAC: false }), pricePerMonth: Number(e.target.value) },
                      }))}
                    />
                    <input
                      type="number"
                      className="input-field bg-stone-800 text-white"
                      placeholder="Seats"
                      value={roomTypeForms[p.id]?.seatCapacity ?? 2}
                      onChange={(e) => setRoomTypeForms((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] ?? { name: '', pricePerMonth: 15000, hasAC: false }), seatCapacity: Number(e.target.value) },
                      }))}
                    />
                    <button type="button" className="btn-primary py-2" onClick={() => handleCreateRoomType(p.id)}>Add type</button>
                  </div>
                </div>
              )}
            </AdminCard>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
