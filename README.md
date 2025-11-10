## HCMUT Multi-Role Portal

A full Tutor–Student–Staff experience based on the provided Visily mockups.  
The UI is powered by **React + Vite + Tailwind**, the backend is a **Python FastAPI** service built with clear OOP layers (models, repository, services) so you can derive class diagrams directly from the codebase.

### Repository Layout

```
backend/   # FastAPI application (app/models, app/repositories, app/services)
frontend/  # React + Vite + Tailwind implementation of every screen
api/       # Thin adapter so the FastAPI app can run as a Vercel Python function
```

### Folder Structure

```
CNPM/                       # Monorepo root
|-- README.md               # Project overview + instructions
|-- api/                    # Vercel Python entrypoint that re-exports FastAPI app
|   `-- index.py            # Imports backend.app.main:app for serverless hosting
|-- backend/                # FastAPI service
|   |-- requirements.txt    # Python dependencies
|   `-- app/                # Application package
|       |-- main.py         # FastAPI bootstrap + routers
|       |-- models/         # Pydantic schemas
|       |-- repositories/   # In-memory data providers
|       `-- services/       # Domain logic (auth, bundles, etc.)
|-- frontend/               # React + Vite portal UI
|   |-- package.json        # Frontend dependencies/scripts
|   |-- src/                # All source code
|   |   |-- assets/         # Static icons/images
|   |   |-- components/     # Shared building blocks (e.g., ProtectedRoute)
|   |   |-- context/        # React context providers
|   |   |-- data/           # Local fixtures/constants
|   |   |-- hooks/          # Custom hooks
|   |   |-- layouts/        # Portal shell / layout components
|   |   |-- lib/            # API helpers
|   |   |-- pages/          # Route-aligned views
|   |   |   |-- portal/     # Student/Tutor/Staff pages
|   |   |   `-- public/     # Auth landing + CAS login
|   |   `-- types/          # Shared TypeScript types
|   `-- vite.config.ts      # Vite build configuration
|-- Staff View/             # PNG exports for staff mockups
|-- Student View/           # PNG exports for student mockups
`-- Tutor View/             # PNG exports for tutor mockups
```

The `Staff View`, `Student View`, and `Tutor View` folders store the exported Visily PNGs that guided the UI build, while the `frontend/src/pages/portal` tree maps directly to each role-specific screen described in the mockups.

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm / pip

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs on `http://127.0.0.1:8000`.  
Key endpoints:

- `POST /api/auth/login` – accepts any email ending with `@hcmut.edu.vn`. Use `student@…`, `tutor@…`, or `staff@…` to load each persona.
- `GET /api/portal/{role}/bundle` – returns the full data bundle for that role.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev          # served on http://127.0.0.1:5173
```

Create a `.env` (or `.env.local`) if you want to point to a deployed API:

```
VITE_API_URL=https://your-vecl-backend.vercel.app/api
```

#### Mock logins

| Role    | Email                       |
|---------|-----------------------------|
|Student  | `student@hcmut.edu.vn`      |
|Tutor    | `tutor@hcmut.edu.vn`        |
|Staff    | `staff@hcmut.edu.vn`        |

Passwords are not validated; the login step is visual only.

### 3. Build & Quality Checks

```bash
# Frontend type-check + bundle
cd frontend
npm run build

# Backend lint/test entry point (FastAPI has a /health route)
cd backend
uvicorn app.main:app --reload   # respond to GET /health
```

### 4. Deploying to Vercel

Create **two Vercel projects** from this repository so both tiers stay independent and scalable.

#### Backend project (FastAPI → Python Serverless Function)

1. In the Vercel dashboard choose “Other” framework and set the root to the repository root.
2. Set *Install Command* to `pip install -r backend/requirements.txt`.
3. Ensure `api/index.py` is detected (it imports `backend/app/main.py` and exposes `app`).
4. Deploy; note the resulting API URL, e.g. `https://cnpm-portal-backend.vercel.app`.

#### Frontend project (React + Vite)

1. Add another Vercel project but set the root directory to `frontend`.
2. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
3. Add an env variable `VITE_API_URL` that points to the backend URL above plus `/api`, e.g. `https://cnpm-portal-backend.vercel.app/api`.
4. Redeploy; the hosted site will automatically call the cloud API.

Vercel already proxies `/api/*` requests to the Python function because the backend lives under the `api/` folder.

### Feature Coverage

- **Student View**: announcements, tutor–student course matching (cards + modal), course detail, quiz (taking + completion states), timetable / reschedule heatmap, feedback form, profile view & edit states, academic records & scholarships panel.
- **Tutor View**: matching dashboard tailored to tutors, course support tools (upload materials, create quiz, schedule meeting), attendance capture + dual feedback history, same scheduling/reschedule UI.
- **Staff View**: scholarship and academic record boards, notification composer, report builders (academic, scholarship, feedback generation) and downloadable report confirmation screen.

Every panel mirrors the provided Visily images, omitting only the “Made with Visily” watermark per your request. All data comes from strongly-typed repositories/services so you can easily draw a class diagram from the backend code.
