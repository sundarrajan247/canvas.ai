# Canvas Demo Prototype

Localhost-first, no-backend interactive prototype for the Canvas concept.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Login

- Username: `admin`
- Password: `admin`

## Demo Flows

1. Login and switch between canvases in the left rail.
2. Open `Vikram Development` and review recommendation cards in `Feed`.
3. Accept and dismiss recommendations to see state/memory updates.
4. Open `Inbox` and test `+` / `-` item actions and source filtering.
5. Use chat prompt chips, type custom prompts, upload an image, and test mic dictation fallback.
6. Open `Memory` and trigger `Assess now`.
7. Open `Feedback` and submit feature requests; entries persist in local storage.
8. Use `Reset Demo` to restore seed state.

## Notes

- This is a front-end prototype only (no real OAuth, Gmail, Calendar, or LLM calls).
- Data is seeded from local JSON and persisted via browser `localStorage`.

