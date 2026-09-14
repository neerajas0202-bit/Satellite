# 🛰️ SATQUERY AI
### Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis through Natural Language Queries

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Complete%20%26%20Verified-brightgreen)

---

## 🌟 Executive Summary

**SATQUERY AI** is an end-to-end multimodal Remote Sensing (RS) intelligence platform. It bridges overhead earth-observation computer vision with natural language reasoning (RS-VQA). Users can upload satellite captures or explore high-resolution pre-loaded scenes, ask arbitrary questions in natural English, and receive verified geospatial intelligence with localized bounding boxes, land-cover distributions, and vegetation index (NDVI) telemetry.

Designed with a high-tech **Space & Earth Observation HUD** aesthetic, this project is built for college capstone demonstrations, research showcases, and geospatial analytical exploration.

---

## 📸 Key Features

- **🔭 Multimodal Satellite Viewer**:
  - Smooth pan, drag, and mouse-wheel zoom (up to 450%).
  - Reticle crosshair HUD with real-time latitude/longitude and Ground Sample Distance (GSD) scale readouts.
  - Interactive bounding boxes with confidence chips and hover inspection cards.
- **🌈 Spectral Band Simulation Filters**:
  - **True Color (RGB)**: Natural optical sensor capture.
  - **Color-Infrared (CIR)**: False-color infrared where healthy vegetation glows crimson and waterways turn dark blue.
  - **NDVI Proxy**: Simulated Normalized Difference Vegetation Index highlight for canopy vigor and biomass.
  - **SAR Sim**: Synthetic Aperture Radar microwave backscatter texture.
- **💬 Natural-Language RS-VQA Query Engine**:
  - Tactical prompt input bar with automated suggested queries.
  - Analysis Modes: *VQA Query*, *Object & Count*, *Land Cover / NDVI*, *Hazard / Change Analysis*, and *Automated Scene Captioning*.
- **📊 Synthesized Intelligence Panel**:
  - Structured natural language assessment with domain terminology.
  - Visual Confidence Gauge (e.g. 96%).
  - Multi-class Land-Cover Distribution: % Vegetation, % Built-Up, % Water, % Barren.
  - Telemetry stats: Mean NDVI, canopy vigor, built-up density, cloud coverage.
- **💾 Session Persistence & Export**:
  - SQLite backend recording all queries, timestamps, and model responses.
  - History drawer with one-click reload and delete.
  - Instant print-ready HTML/PDF intelligence reports.
  - Raw JSON intelligence dataset export.
- **🛰️ Pre-packaged High-Resolution Scenes**:
  1. *International Airport Hub* (Active runways, taxiways, commercial jet silhouettes, apron hangars).
  2. *Deep-Water Container Port* (Panamax vessels, STS gantry cranes, container stacking blocks, tugboat).
  3. *Agricultural River Delta* (Center-pivot irrigation circles, drainage canal, crop vigor).
  4. *Metropolitan Infrastructure Core* (High-density buildings, cast shadows, 6-lane highway, stadium).
  5. *Post-Disaster Coastal Flood Inundation* (Inundated terrain, levee breach, submerged arteries).

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────┐
                               │       React + Vite Frontend (TS)       │
                               │  - Space/Satellite HUD Theme (Tailwind) │
                               │  - Zoom/Pan Viewer with Overlays        │
                               │  - Interactive VQA Query Interface     │
                               │  - Spectral & Land-Cover Filter HUD    │
                               │  - History, Metrics & Report Exporter   │
                               └───────────────────┬────────────────────┘
                                                   │ HTTP / REST
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │           FastAPI Backend              │
                               │  - /api/upload (Image store & EXIF)    │
                               │  - /api/query (RS-VQA & Object Det)    │
                               │  - /api/samples (Preloaded RS scenes)  │
                               │  - /api/history (SQLite Session Store) │
                               │  - /api/export (JSON / PDF Summary)    │
                               └───────────────────┬────────────────────┘
                                                   │
                         ┌─────────────────────────┴─────────────────────────┐
                         ▼                                                   ▼
            ┌───────────────────────────┐                       ┌───────────────────────────┐
            │   Modular AI Pipeline     │                       │     SQLite Storage        │
            │ - BaseVisionLanguageModel │                       │ - SatelliteImage Records  │
            │ - BaseRemoteSensingDetector│                      │ - AnalysisQuery Records   │
            │                           │                       └───────────────────────────┘
            │ Providers:                │
            │ • RS-Heuristic & CV Engine│ (Real visual analysis via Pillow/NumPy)
            │ • Gemini Vision Provider  │ (Optional API key)
            │ • OpenAI Vision Provider  │ (Optional API key)
            └───────────────────────────┘
```

---

## 🚀 Quickstart & Running the Application

### Option 1: One-Click Windows Launcher (Recommended)
Double-click `run_app.bat` or run in terminal:
```powershell
python start_app.py
```
This automatically verifies dependencies, starts the FastAPI server on `http://127.0.0.1:8000`, serves both the API and the compiled React frontend, and opens your browser.

---

### Option 2: Full-Stack Development Mode

#### 1. Backend Server
```powershell
# From project root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API will run on `http://127.0.0.1:8000` (Docs at `http://127.0.0.1:8000/docs`).

#### 2. Frontend Server (Vite HMR)
```powershell
cd frontend
npm install
npm run dev
```
Frontend development server will open on `http://localhost:5173` with automatic API proxying to port 8000.

---

## 📁 Repository Structure

```
project/
├── backend/
│   ├── ai/
│   │   ├── interfaces.py          # Abstract contracts (BaseVisionLanguageModel)
│   │   ├── rs_engine.py           # Core RS Computer Vision & Heuristic VLM
│   │   ├── external_vlm.py        # Gemini & OpenAI Vision adapters
│   │   └── pipeline.py            # AI Pipeline orchestrator
│   ├── api/
│   │   └── routes.py              # REST API endpoints
│   ├── data/
│   │   ├── sample_generator.py    # Generates synthetic 1024x1024 RS scenes
│   │   └── samples/               # Sample satellite imagery (*.jpg)
│   ├── db/
│   │   ├── database.py            # SQLite connection & CRUD functions
│   │   └── models.py              # Pydantic data contracts
│   ├── uploads/                   # User-uploaded satellite imagery
│   ├── config.py                  # Global application configuration
│   ├── main.py                    # FastAPI entrypoint & SPA static server
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Mission telemetry header & model picker
│   │   │   ├── SatelliteViewer.tsx# Pan/zoom viewer, spectral filters & overlays
│   │   │   ├── QueryInterface.tsx # Natural-language prompt bar & chips
│   │   │   ├── ResponsePanel.tsx  # Intelligence answers, gauge & breakdown
│   │   │   ├── SampleSelector.tsx # Reference scenes carousel
│   │   │   ├── UploadModal.tsx    # Ingestion modal for custom satellite files
│   │   │   ├── HistoryDrawer.tsx  # Analysis log drawer & replay
│   │   │   └── InfoModal.tsx      # System architecture & project guide
│   │   ├── services/
│   │   │   └── api.ts             # Backend REST API client
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   ├── App.tsx                # Main React dashboard layout
│   │   ├── index.css              # Custom styling & animations
│   │   └── main.tsx               # DOM mount point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── tests/
│   └── test_backend.py            # Unit test suite
├── .env.example                   # Environment variables template
├── run_app.bat                    # One-click Windows startup script
├── start_app.py                   # Automatic orchestrator script
└── README.md                      # Comprehensive documentation
```

---

## 🛰️ REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & available model providers |
| `GET` | `/api/samples` | List preloaded satellite scenes with sample queries |
| `GET` | `/api/images` | List all available images (uploaded + samples) |
| `POST` | `/api/upload` | Upload new satellite image with GSD & sensor metadata |
| `POST` | `/api/query` | Submit natural-language question for multimodal analysis |
| `GET` | `/api/history` | Retrieve query history and past analysis sessions |
| `DELETE` | `/api/history/{id}` | Remove a recorded analysis item |
| `GET` | `/api/export/{id}` | Export analysis as JSON or print-ready HTML report |

---

## 🎓 College Project Presentation Checklist

When presenting this project:
1. **Scene Variety**: Demonstrate the 5 scenes to show versatility across Aerodrome, Maritime, Farmland, Urban, and Disaster domains.
2. **Object Counting Query**: Select the *International Airport* scene, ask *"How many aircraft are on the apron?"*, and point out the detected bounding boxes on the parked planes.
3. **Spectral Band Switcher**: Switch to *CIR (Infrared)* or *NDVI Proxy* to explain chlorophyll reflectance and remote sensing band combinations.
4. **Custom Image Upload**: Click *"Upload Image"*, drag an aerial or satellite photo, specify resolution (e.g. 0.5m GSD), and ask questions about the newly ingested scene.
5. **Printable Report**: Click *"Print Report"* in the intelligence response panel to display the generated intelligence brief.

---

## 📜 License
SATQUERY AI is open-source under the MIT License.
