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

- **Front-end**  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="32"/>  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-plain.svg" width="30"/>  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="32"/>  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="30"/>  
  <img src="https://cdn.worldvectorlogo.com/logos/tailwindcss.svg" width="32"/>  
  React 18, TypeScript, Node.js (npm tooling), Vite, Tailwind CSS

- **Back-end**  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="34"/>  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" width="34"/>  
  Python 3.11, FastAPI (current demo uses in-memory repositories)

- **Version Control**  
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="30"/>

- **UX/UI**  
  <img src="https://www.visily.ai/wp-content/uploads/2021/11/visily-logo.png" width="80"/> – Visily/Figma-based mockups

- **UML**  
  <img src="https://w7.pngwing.com/pngs/587/903/png-transparent-draw-io-hd-logo-thumbnail.png" width="36"/> – draw.io

- **Authentication Mock**  
  HCMUT_SSO (visual simulation only)

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
|-- README.md
|-- api/
|   `-- index.py                # Re-exports backend FastAPI app for Vercel
|-- backend/
|   |-- requirements.txt
|   `-- app/
|       |-- main.py             # FastAPI bootstrap + routers
|       |-- models/             # Pydantic schemas
|       |-- repositories/       # In-memory data providers
|       `-- services/           # Domain logic (auth, bundles, etc.)
|-- frontend/
|   |-- package.json
|   |-- public/                 # Static assets (logos, syllabus, etc.)
|   `-- src/
|       |-- assets/
|       |-- components/
|       |-- context/
|       |-- hooks/
|       |-- layouts/
|       |-- lib/
|       |-- pages/
|       |   |-- portal/         # Student/Tutor/Staff pages
|       |   `-- public/         # SSO landing, CAS login, etc.
|       `-- types/
|-- Staff View/                 # PNG exports for staff mockups
|-- Student View/               # PNG exports for student mockups
`-- Tutor View/                 # PNG exports for tutor mockups
```

The Visily exports in `Staff View`, `Student View`, and `Tutor View` guided the UI build; each screen in `frontend/src/pages/portal` maps directly to those mockups.

---

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

Optional `.env` if pointing to a remote API:

```
VITE_API_URL=https://your-backend.vercel.app/api
```

### Mock logins

| Role    | Email                  |
|---------|------------------------|
|Student  | `student@hcmut.edu.vn` |
|Tutor    | `tutor@hcmut.edu.vn`   |
|Staff    | `staff@hcmut.edu.vn`   |

Passwords are not validated; the login step is purely visual.

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
  4. Deploy and note the public URL (e.g., `https://your-render-backend.onrender.com`)

- **Vercel (React + Vite frontend)**
  1. Create a project with root `frontend/`
  2. Build command: `npm run build`; output directory: `dist`
  3. Add `VITE_API_URL=https://your-render-backend.onrender.com/api`
  4. Deploy; the UI will call the Render backend automatically
