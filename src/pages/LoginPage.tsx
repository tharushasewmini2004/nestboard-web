import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-bold dark:text-stone-100">Welcome back</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Sign in to manage bookings and favourites.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Email</span>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Password</span>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <div className="alert-error text-sm">{error}</div>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" state={{ from }} className="font-semibold text-nest-700 hover:underline dark:text-nest-400">
            Sign up
          </Link>
        </p>

        <div className="alert-info mt-6 text-sm">
          <p className="font-medium">Demo account</p>
          <p className="mt-1">guest@nestboard.com / password123</p>
        </div>
      </div>
    </div>
  );
}
