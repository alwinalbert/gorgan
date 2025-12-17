import { useState } from 'react';
import { LogIn, UserPlus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInAnonymous, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black/60 border border-red-800 rounded-2xl p-6 shadow-2xl hover-glow">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-xl font-bold">UPSIDEDOWN ACCESS</h1>
            <p className="text-xs text-gray-400">Authenticate to enter the hub</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 text-sm">
          <button
            className={`flex-1 py-2 rounded-lg border ${mode === 'login' ? 'border-red-500 bg-red-900/40' : 'border-transparent bg-gray-900/50'}`}
            onClick={() => setMode('login')}
            disabled={loading}
          >
            <LogIn className="inline w-4 h-4 mr-1" /> Login
          </button>
          <button
            className={`flex-1 py-2 rounded-lg border ${mode === 'signup' ? 'border-red-500 bg-red-900/40' : 'border-transparent bg-gray-900/50'}`}
            onClick={() => setMode('signup')}
            disabled={loading}
          >
            <UserPlus className="inline w-4 h-4 mr-1" /> Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-gray-900/60 border border-red-800/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              placeholder="hopper@hawkins.gov"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-gray-900/60 border border-red-800/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded-lg font-semibold border border-red-500 transition-colors"
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Enter the Hub' : 'Join the Party'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => signInAnonymous()}
            className="text-xs text-gray-400 hover:text-white underline"
            disabled={loading}
          >
            Continue as Observer (anonymous)
          </button>
        </div>
      </div>
    </div>
  );
}
