# SelfSubmit

UK self-employed **Making Tax Digital (MTD)**-oriented product: monthly income & expenses capture, profession templates, and illustrative tools.

## Structure

| Folder     | Description                          |
| ---------- | ------------------------------------ |
| `frontend` | Next.js (App Router) marketing site  |
| `backend`  | Node API (Express) — roadmap hooks |

## Local development

From the **repository root** (`c:\selfsubmit`), after installing dependencies inside each app once:

```bash
cd frontend && npm install && cd ..
# optional: cd backend && npm install && cd ..
npm run dev          # Next.js — http://localhost:3000
npm run dev:backend  # API — backend `dev` script (Node --watch)
```

Or run inside each folder as usual:

```bash
cd frontend && npm install && npm run dev
cd backend && npm install && npm run dev
```

There is **no** `package.json` in the root except the small shim above — real dependencies live under `frontend/` and `backend/`.

## Legal

SelfSubmit is associated with **Clicado Media UK Ltd**. Marketing copy (including “MTD compliant”) describes product direction until live filing integrations are certified — see the **Disclaimer** route in the app (`/disclaimer`).

---

© Clicado Media UK Ltd.
