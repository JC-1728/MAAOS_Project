# MAAOS — Multi-Agent Academic Operating System

This is the initial slice of the MAAOS capstone project: **Auth Module** (register + login)
implemented end-to-end, styled to match the provided Figma reference (SYSTEM ACCESS screen)
and the architecture defined in `UML.pdf` / `final_abs.pdf`.

## What's included
- **frontend/** — React 18 + Vite + Tailwind, monospace "kernel UI" aesthetic
  - `src/pages/Login.jsx` — Sign-in screen (matches the SYSTEM ACCESS reference design)
  - `src/pages/Register.jsx` — "Request System Access" screen, same visual language
  - `src/api/auth.js` — talks to the backend `/auth/*` endpoints
- **backend/** — FastAPI Auth Module, matching the `USERS` table in the schema doc
  - JWT-based auth (`python-jose`), bcrypt password hashing (`passlib`)
  - SQLite for local dev (swap the `DATABASE_URL` for PostgreSQL/MySQL in production, per the design doc)

## Run the backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API will be live at `http://localhost:8000` (interactive docs at `/docs`).

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
App will be live at `http://localhost:5173`. Vite is pre-configured to proxy `/api` → `http://localhost:8000`,
so no extra env setup is needed for local dev.

## Endpoints implemented
| Method | Path            | Purpose                          |
|--------|-----------------|-----------------------------------|
| POST   | /auth/register  | Create a USERS row, return a JWT |
| POST   | /auth/login     | Verify credentials, return a JWT |
| GET    | /health         | Liveness check                   |

## Next modules (not yet built)
Per `UML.pdf`, the next pieces in build order are: Coordinator Agent → Email Intelligence Agent
(Gmail OAuth + LLM extraction) → Priority/Workload/Scheduling/Reminder agents → OCR Agent →
RAG (ChromaDB) Agent → Analytics Agent → Hybrid LLM Router. The dashboard/coordinator chat UI,
Gmail OAuth consent screen, and weekly digest views from the Figma file are also still pending —
happy to build any of those next.
