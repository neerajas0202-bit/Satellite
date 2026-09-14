import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path

from backend.config import settings, UPLOAD_DIR, SAMPLES_DIR, BASE_DIR
from backend.db.database import init_db, get_all_images
from backend.data.sample_generator import generate_all_samples
from backend.api.routes import router as api_router

FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    init_db()
    # Check if sample images exist; if not, generate them
    samples = get_all_images(source_type="sample")
    if not samples or len(list(SAMPLES_DIR.glob("*.jpg"))) < 5:
        print("[SATQUERY AI] Generating default high-resolution remote sensing samples...")
        generate_all_samples()
        print("[SATQUERY AI] Sample scenes generated successfully.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis",
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file endpoints to serve uploaded and sample satellite images
app.mount("/static/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/static/samples", StaticFiles(directory=str(SAMPLES_DIR)), name="samples")

# Include API routes
app.include_router(api_router, prefix=settings.API_PREFIX)

# Mount frontend production build if available
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend_spa(full_path: str):
        file_candidate = FRONTEND_DIST / full_path
        if full_path and file_candidate.exists() and file_candidate.is_file():
            return FileResponse(file_candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "SATQUERY AI Backend API Running",
            "docs": "/docs",
            "health": f"{settings.API_PREFIX}/health",
            "hint": "Run 'npm run build' or 'npm run dev' in frontend directory"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
