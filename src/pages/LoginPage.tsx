import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemoStore } from '../state/store';

export function LoginPage() {
  const login = useDemoStore((state) => state.login);
  const error = useDemoStore((state) => state.loginError);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (login(username, password)) {
      navigate('/app');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#0F172A] p-6 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-md">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-400">Canvas Admin Portal</p>
        <h1 className="text-2xl font-semibold tracking-tight">Operating system for high-agency people</h1>
        <p className="mt-1 text-sm text-slate-400">Enter demo workspace</p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm text-slate-300">
              Username
            </label>
            <input
              id="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="admin"
              className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-[0_10px_28px_rgba(99,102,241,0.4)] transition hover:bg-indigo-400"
          >
            Enter Canvas
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">Demo credentials: admin / admin</p>
      </section>
    </main>
  );
}


