import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/store';

export function LoginPage() {
  const signIn = useAppStore((state) => state.signIn);
  const signUp = useAppStore((state) => state.signUp);
  const authError = useAppStore((state) => state.authError);
  const isLoading = useAppStore((state) => state.isLoading);
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    if (ok) {
      navigate('/app');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#0F172A] p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-md">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-400">Canvas Auth</p>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Canvas</h1>
        <p className="mt-1 text-sm text-slate-400">Supabase-backed auth and persistence</p>

        <div className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
          <button
            type="button"
            className={`min-h-11 rounded-lg px-3 text-sm ${mode === 'signin' ? 'bg-indigo-500 text-white' : 'text-slate-300'}`}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`min-h-11 rounded-lg px-3 text-sm ${mode === 'signup' ? 'bg-indigo-500 text-white' : 'text-slate-300'}`}
            onClick={() => setMode('signup')}
          >
            Create account
          </button>
        </div>

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>

          {authError ? <p className="text-sm text-rose-300">{authError}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-[0_10px_28px_rgba(99,102,241,0.4)] transition hover:bg-indigo-400 disabled:opacity-60"
          >
            {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">Use your email and password to sign in or create an account.</p>
      </section>
    </main>
  );
}
