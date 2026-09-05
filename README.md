# RailBot AI — Production Railway Enquiry Assistant

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v3.0.0-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4.3-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Test Suite](https://img.shields.io/badge/Tests-130%2F130%20Passing%20(100%25)-brightgreen)](#automated-testing--model-evaluation)

RailBot AI is an intelligent railway assistant for Indian Railways enquiries. Built with NLP intent recognition (TF-IDF + Logistic Regression), fuzzy station matching, and an in-memory compressed indexing engine (`zlib`), it resolves train searches, station lookups, route mapping, and schedules instantaneously.

---

## Key Features

- **Pan-India Railway Dataset**: Coverage for 13,000+ trains, 7,300+ stations, and complete station-by-station schedules.
- **NLP Intent Classification**: 8 core intents (Train Search, Train Details, Station Info, Schedule Query, PNR Status, Live Train Status, Greetings, Goodbyes).
- **Sub-Second Search Engine**:
  - Exact train number / train name indexing ($O(1)$ lookups).
  - High-speed station code and city alias resolution.
  - On-demand decompressed schedules keeping memory footprints minimal (<120MB heap).
- **Live Status & PNR Inquiries**: Mock and live external API providers with fault-tolerant status tracking.
- **Modern Responsive UI**:
  - Dark & Light mode toggle with CSS variable theming.
  - English and Hindi bilingual selector.
  - Real-time backend connection health monitoring.
  - Collapsible welcome hero and interactive quick-action prompts.
  - Client-side session management and saved searches stored in LocalStorage.

---

## Architecture Overview

```
User Query (Frontend)
       │
       ▼
  FastAPI API (/chat)
       │
       ├─► Input Normalisation & Sanitisation
       │
       ├─► Entity Extraction (Source, Destination, Train No/Name, Station, PNR)
       │
       ├─► Dataset Entity Matching & Priority Dispatch
       │
       ├─► TF-IDF Vectorizer + Logistic Regression Classifier (Confidence Gated)
       │
       └─► Query Dispatcher:
             ├─► Train Search (route_search.py)
             ├─► Station Info (station_search.py)
             ├─► Train Details (search_engine.py)
             ├─► Schedule Lookup (schedule_search.py — zlib decompressed)
             └─► Live Status / PNR (external_api.py)
       │
       ▼
Structured Response Payload (JSON)
```

---

## Quick Start (Local Development)

### 1. Backend Setup

```powershell
# Navigate to project root
cd d:\NLP_Project

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run the FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend server will start at: `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

```powershell
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend client will start at: `http://localhost:5173`

---

## Automated Testing & Model Evaluation

RailBot AI includes a comprehensive 130-test verification suite covering all intents, entity extractors, boundary conditions, and mock API failures:

```powershell
python backend/test_production.py
```

### Held-Out Evaluation Summary

| Category | Tests | Accuracy | Status |
|---|---|---|---|
| NLP Intent & Entity Tests | 50 / 50 | 100.0% | PASS |
| Train Query Tests | 20 / 20 | 100.0% | PASS |
| Station Query Tests | 20 / 20 | 100.0% | PASS |
| Schedule Query Tests | 20 / 20 | 100.0% | PASS |
| Invalid & Boundary Tests | 10 / 10 | 100.0% | PASS |
| API & Error Handling Tests | 10 / 10 | 100.0% | PASS |
| **Total Production Suite** | **130 / 130** | **100.0%** | **PASS** |

---

## Deployment Options

### Option A: Docker & Docker Compose (Recommended)

Run both the frontend and backend with a single command:

```powershell
docker compose up --build -d
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### Option B: Cloud Deployment (Render / Railway / Fly.io)

1. **Backend**:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - Supported natively via the included `Dockerfile` and `Procfile`.
2. **Frontend (Vercel / Netlify / Cloudflare Pages)**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Set environment variable `VITE_BACKEND_URL` to your live backend URL.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/chat` | Core chat endpoint accepting `{"message": "string"}` |
| `GET` | `/health` | Service health status and external API diagnostic flags |
| `GET` | `/diagnostics` | Full system telemetry and configuration state |
| `GET` | `/` | API status and root banner |
| `GET` | `/docs` | OpenAPI / Swagger interactive documentation |

---

## Project Structure

```
NLP_Project/
├── backend/
│   ├── main.py               # FastAPI application & query router
│   ├── entity_extractor.py   # Regex & dictionary entity extractor
│   ├── search_engine.py      # Train search & details lookup
│   ├── station_search.py     # Station search & alias resolution
│   ├── route_search.py       # Source-destination route finder
│   ├── schedule_search.py    # Compressed in-memory schedule store
│   ├── external_api.py       # PNR & Live Train Status integration
│   ├── intent_model.pkl      # Trained Logistic Regression classifier
│   ├── vectorizer.pkl        # Fitted TF-IDF Vectorizer
│   ├── requirements.txt      # Production Python requirements (UTF-8)
│   └── test_production.py    # Comprehensive 130-test suite
├── dataset/
│   ├── trains.json           # 13,000+ train definitions
│   ├── stations.json         # 7,300+ station records
│   ├── schedules.json        # Station-by-station train stop records
│   ├── schedules_cache.pkl   # High-speed compressed binary cache
│   └── intents.csv           # NLP intent training corpus
├── frontend/
│   ├── src/
│   │   ├── components/       # Header, Sidebar, Chat, LiveStatus, Modals
│   │   ├── services/api.js   # Axios backend client & health monitor
│   │   ├── App.jsx           # Root layout & state manager
│   │   └── index.css         # Tailwind styles & theme variables
│   ├── Dockerfile            # Multi-stage Nginx build
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite build configuration
├── Dockerfile                # Backend production container
├── docker-compose.yml        # Full-stack container orchestration
├── Procfile                  # Cloud web process entrypoint
└── README.md                 # Project documentation
```

---

## License

Academic and demonstration project. Not affiliated with IRCTC or Indian Railways.
