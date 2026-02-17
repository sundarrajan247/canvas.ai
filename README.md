# Canvas (Supabase Persistence Demo)

Investor/demo-ready mobile-first Canvas prototype with real user accounts and Postgres persistence.

## Stack

- React + Vite + TypeScript
- Zustand state store
- Supabase Auth + Postgres + RLS
- Tailwind CSS + lucide-react icons

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and fill values:

```bash
cp .env.example .env
```

Required variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Run SQL migration in Supabase SQL Editor:

- File: `supabase/migrations/20260217_canvas_auth_persistence.sql`

4. Start app:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Auth and Demo User

- Create account using any email/password from login screen.
- On first login, profile row is auto-created in `profiles`.
- Default handle is set to `supriya0506` (editable in Profile tab).

## Persisted Data

The following persist in Supabase and survive refresh/session changes:

- Canvases
- Goals
- Todos
- Memories
- Profile handle

## GitHub Pages

Published URL:

- `https://sundarrajan247.github.io/canvas.ai/`

Set repository secrets for deploy builds:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Workflow file already injects these into `npm run build`.

## Manual Persistence Test Checklist

1. Sign up / sign in.
2. Create a canvas from Canvases modal.
3. Open that canvas and add:
   - one goal
   - one todo
   - one memory
4. Refresh browser: confirm all items still exist.
5. Logout, login again with same account: confirm same data appears.
6. Edit handle in Profile and refresh: confirm handle persists.
