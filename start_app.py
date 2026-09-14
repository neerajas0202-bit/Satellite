import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

# Set UTF-8 encoding for Windows terminal
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 65)
    print("        SATQUERY AI - REMOTE SENSING VISION-LANGUAGE ASSISTANT")
    print("=" * 65)
    print("\n[1/3] Checking environment and dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import PIL
        import numpy
        print("  [OK] Python dependencies verified (FastAPI, Uvicorn, Pillow, NumPy)")
    except ImportError as e:
        print(f"  [!] Missing dependency: {e}. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(BACKEND_DIR / "requirements.txt")], check=True)

    # Check if samples exist
    samples_dir = BACKEND_DIR / "data" / "samples"
    if not samples_dir.exists() or len(list(samples_dir.glob("*.jpg"))) < 5:
        print("\n[2/3] Generating synthetic high-resolution satellite scenes...")
        from backend.data.sample_generator import generate_all_samples
        from backend.db.database import init_db
        init_db()
        generate_all_samples()
        print("  [OK] Sample scenes generated.")
    else:
        print("\n[2/3] Verified satellite sample dataset.")

    # Check frontend build
    dist_dir = FRONTEND_DIR / "dist"
    if not dist_dir.exists():
        print("\n[Optional] Building frontend production bundle...")
        subprocess.run(["npm", "run", "build"], cwd=str(FRONTEND_DIR), shell=True)

    is_lan = "--lan" in sys.argv or "--public" in sys.argv
    bind_host = "0.0.0.0" if is_lan else "127.0.0.1"
    server_url = f"http://127.0.0.1:8000"

    print("\n[3/3] Starting SATQUERY AI Full-Stack Server...")
    print(f"  * Local Web App:       {server_url}")
    print(f"  * Interactive API Docs: {server_url}/docs")
    if is_lan:
        import socket
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            print(f"  * LAN (Same Wi-Fi) URL: http://{local_ip}:8000")
        except Exception:
            pass
    print("  * Press Ctrl+C to terminate\n")

    def open_browser():
        time.sleep(1.5)
        webbrowser.open(server_url)

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    import uvicorn
    uvicorn.run("backend.main:app", host=bind_host, port=8000, reload=False)

if __name__ == "__main__":
    main()
