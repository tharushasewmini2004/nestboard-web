import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio ?? '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.profile.update({ name, bio });
      await refreshUser();
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-3xl font-bold dark:text-stone-100">Profile</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">Manage your account details.</p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">Email</p>
          <p className="font-medium text-stone-900 dark:text-stone-100">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-stone-500 dark:text-stone-400">Role</p>
          <p className="font-medium text-stone-900 dark:text-stone-100">{user.role}</p>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Name</span>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Bio</span>
          <textarea
            className="input-field min-h-[100px] resize-y"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
          />
        </label>

        {message && <div className="alert-info text-sm">{message}</div>}
        {error && <div className="alert-error text-sm">{error}</div>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
