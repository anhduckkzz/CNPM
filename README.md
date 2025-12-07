<div align="center">
  
**Vietnam National University, Ho Chi Minh City**  
**University of Technology**  
**Faculty of Computer Science and Engineering**

[![HCMUT Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HCMUT_official_logo.png/238px-HCMUT_official_logo.png)](https://www.hcmut.edu.vn/vi)

**Software Engineering / Semester 251**  
**Group 1**

</div>

---

# Project: Tutor Support System at Ho Chi Minh City University of Technology – VNU-HCM

## Lecturer: Trần Trường Tấn Phát

## Team members

| No. | Name                | Student ID | Class | Email                              |
| :-: | ------------------- | :--------: | :---: | ---------------------------------- |
|  1  | Nguyễn Duy Thành    | 2353101    | CC05  | thanh.nguyen09012005@hcmut.edu.vn  |
|  2  | Hồ Lâm Khánh Vy     | 2353353    | CC05  | vy.holamkhanh@hcmut.edu.vn         |
|  3  | Đặng Sinh Hưng      | 2352420    | CC05  | hung.dang2109@hcmut.edu.vn         |
|  4  | Châu Kiên Toàn      | 2353192    | CC05  | toan.chaukien@hcmut.edu.vn         |
|  5  | Trần Hoàng Khánh    | 2352533    | CC05  | khanh.tranhoang@hcmut.edu.vn       |
|  6  | Trần Anh Đức        | 2352271    | CC05  | duc.trananh0502@hcmut.edu.vn       |
|  7  | Nguyễn Khánh Hưng   | 2352435    | CC05  | hung.nguyenshogun@hcmut.edu.vn     |

---

## Tech Stack

- **Front-end:**  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="28"/> React 18  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-plain.svg" width="26"/> TypeScript  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="28"/> Node.js  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="26"/> Vite  
  <img src="https://cdn.worldvectorlogo.com/logos/tailwindcss.svg" width="28"/> Tailwind CSS

- **Back-end:**  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="30"/> Python 3.11  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" width="30"/> FastAPI

- **Version Control:**  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="28"/> Git + GitHub

- **UX/UI:**  
  <img src="https://www.visily.ai/wp-content/uploads/2021/11/visily-logo.png" width="80"/> Visily / Figma mockups

- **UML:**  
  <img src="https://w7.pngwing.com/pngs/587/903/png-transparent-draw-io-hd-logo-thumbnail.png" width="32"/> draw.io

- **Authentication Mock:**  
  HCMUT_SSO

---

## HCMUT Multi-Role Portal

A full Tutor–Student–Staff experience based on the provided Visily mockups.  
The UI is powered by **React + Vite + Tailwind**, the backend is a **Python FastAPI** service built with clear OOP layers (models, repositories, services) so class diagrams can be derived directly from the codebase.

### Repository Layout

```
backend/   # FastAPI application (app/models, app/repositories, app/services)
frontend/  # React + Vite + Tailwind implementation of every screen
api/       # Thin adapter so the FastAPI app can run as a Vercel Python function
```

### Folder Structure
```
CNPM/
├── README.md                  # Project overview and documentation
├── stress_test.js             # k6 script for performance/load testing
├── testcase.json              # Data-driven test cases (likely for API testing)
|
├── api/                       # Serverless functions for Vercel deployment
│   └── index.py               # Entry point for backend API on Vercel
|
├── backend/                   # Python FastAPI Backend Application
│   ├── app/                   # Main FastAPI application source code
│   │   ├── main.py            # FastAPI application entry point, defines routes and middleware
│   │   ├── models/            # Pydantic models for data structures
│   │   ├── repositories/      # Data access layer
│   │   └── services/          # Business logic layer
│   ├── data/                  # Mock data for different user roles
│   └── static/                # Static files served by the backend
│       ├── images/            # Project images
│       ├── materials/         # Uploaded course materials
│       └── pdfs/              # Pre-defined PDF documents
|
├── frontend/                  # React.js Frontend Application
│   ├── public/                # Static assets served directly
│   └── src/                   # React source code
│       ├── App.tsx            # Main React application component
│       ├── main.tsx           # Entry point for React app
│       ├── components/        # Reusable UI components
│       ├── context/           # React Context for global state management
│       ├── hooks/             # Custom React hooks
│       ├── layouts/           # Page layouts
│       ├── lib/               # Utility functions, API client setup
│       ├── models/            # Frontend data models/interfaces
│       ├── pages/             # Page-level components, grouped by sections
│       │   ├── portal/
│       │   └── public/
│       ├── types/             # TypeScript type definitions
│       └── utils/             # General utility functions
|
├── Staff View/                # Screenshots/documentation for Staff View
├── Student View/              # Screenshots/documentation for Student View
└── Tutor View/                # Screenshots/documentation for Tutor View
```
The Visily exports in `Staff View`, `Student View`, and `Tutor View` guided the UI build; each screen in `frontend/src/pages/portal` maps directly to those mockups.


## Prerequisites

- Node.js 18+
- Python 3.11+
- npm / pip

---

## 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # source .venv/bin/activate on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API serves on `http://127.0.0.1:8000`.

Key endpoints:

- `POST /api/auth/login` – accepts any email ending with `@hcmut.edu.vn`. Use `student@…`, `tutor@…`, or `staff@…` to load each persona.
- `GET /api/portal/{role}/bundle` – returns the full data bundle for that role.

> **Note**: We currently rely on in-memory repositories; no database is required for the demo.

---

## 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev          # Served on http://127.0.0.1:5173
```

### Environment Variables

Create `frontend/.env.local` for local development:

```env
VITE_API_URL=http://localhost:8000/api
VITE_BACKEND_URL=http://localhost:8000
```

For production deployment, use your actual backend URL:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_BACKEND_URL=https://your-backend.onrender.com
```

**Important:** `VITE_BACKEND_URL` is required for PDF and static file URLs to work correctly in production!

### Mock logins

| Role    | Email                  | Password |
|---------|------------------------|----------|
|Student  | `student@hcmut.edu.vn` | `12345678` |
|Tutor    | `tutor@hcmut.edu.vn`   | (any password) |
|Staff    | `staff@hcmut.edu.vn`   | (any password) |

---

## 3. Build & Verification

```bash
# Frontend type-check + production build
cd frontend
npm run build

# Backend local run (already covered above)
cd backend
uvicorn app.main:app --reload
```

---

## 4. Deployment (Render + Vercel)

- **Render (FastAPI backend)**
  1. New Web Service → Root directory `backend/`
  2. Build command: `pip install -r requirements.txt`
  3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port ${PORT}`
  4. Deploy and note the public URL (e.g., `https://your-backend.onrender.com`)

- **Vercel (React + Vite frontend)**
  1. Create a project with root `frontend/`
  2. Build command: `npm run build`; output directory: `dist`
  3. **Add Environment Variables** (Required!):
     - `VITE_API_URL=https://your-backend.onrender.com/api`
     - `VITE_BACKEND_URL=https://your-backend.onrender.com`
  4. Deploy; the UI will call the Render backend automatically

> **Important:** Without setting `VITE_BACKEND_URL` in Vercel, PDF links will still point to localhost and won't work in production.

📄 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.
