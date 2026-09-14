import io
import sys
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient

# Reconfigure stdout for UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.main import app

def run_verification():
    print("==================================================")
    print("  RUNNING SATQUERY AI END-TO-END FLOW VERIFICATION")
    print("==================================================")
    
    client = TestClient(app)

    # 1. Health check
    print("\n[Step 1] Testing /api/health...")
    resp = client.get("/api/health")
    assert resp.status_code == 200, f"Health check failed: {resp.text}"
    print("  [OK] Health Status:", resp.json()["status"])

    # 2. Verify Sample Scenes
    print("\n[Step 2] Testing /api/samples...")
    resp = client.get("/api/samples")
    assert resp.status_code == 200, f"Samples failed: {resp.text}"
    samples = resp.json()
    assert len(samples) >= 5, f"Expected at least 5 sample scenes, got {len(samples)}"
    print(f"  [OK] Found {len(samples)} sample remote-sensing scenes:")
    for s in samples:
        print(f"    - {s['title']} ({s['gsd_meters']}m GSD)")

    # 3. Query on Sample Scene (Airport)
    airport = next(s for s in samples if "airport" in s["filename"])
    print(f"\n[Step 3] Submitting query for Airport scene '{airport['title']}'...")
    query_payload = {
        "image_id": airport["id"],
        "query": "How many aircraft are visible on the tarmac?",
        "analysis_mode": "object_detection",
        "model_provider": "rs_engine"
    }
    resp = client.post("/api/query", json=query_payload)
    assert resp.status_code == 200, f"Query failed: {resp.text}"
    result = resp.json()
    print("  [OK] AI Response Received:")
    print("    - Answer:", result["answer"][:90], "...")
    print(f"    - Confidence: {int(result['confidence'] * 100)}%")
    print(f"    - Detected Objects: {len(result['detected_objects'])} entities")
    print(f"    - Land Cover: {result['land_cover_stats']}")
    print(f"    - Mean NDVI: {result['spectral_metrics']['mean_ndvi']}")
    sample_analysis_id = result["id"]

    # 4. Upload a custom satellite image
    print("\n[Step 4] Testing custom image upload (/api/upload)...")
    # Generate test image in memory
    test_img = Image.new("RGB", (512, 512), color=(40, 90, 140))
    img_byte_arr = io.BytesIO()
    test_img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()

    files = {"file": ("surveillance_target_alpha.jpg", img_bytes, "image/jpeg")}
    data = {
        "title": "Surveillance Sector Alpha",
        "description": "Tactical overhead imagery test",
        "gsd_meters": 0.4,
        "sensor_type": "WorldView-3"
    }
    resp = client.post("/api/upload", files=files, data=data)
    assert resp.status_code == 200, f"Upload failed: {resp.text}"
    uploaded_img = resp.json()
    print(f"  [OK] Image uploaded successfully: ID={uploaded_img['id']}, URL={uploaded_img['url']}")

    # 5. Ask Question on the Uploaded Image
    print("\n[Step 5] Asking natural-language question on uploaded image...")
    upload_query = {
        "image_id": uploaded_img["id"],
        "query": "What is the dominant land-cover composition and water surface ratio?",
        "analysis_mode": "land_cover",
        "model_provider": "rs_engine"
    }
    resp = client.post("/api/query", json=upload_query)
    assert resp.status_code == 200, f"Query on uploaded image failed: {resp.text}"
    upload_result = resp.json()
    print("  [OK] AI Analysis on Uploaded Image:")
    print("    - Answer:", upload_result["answer"][:90], "...")
    print(f"    - Land Cover Stats: {upload_result['land_cover_stats']}")

    # 6. Verify History Retrieval
    print("\n[Step 6] Testing /api/history...")
    resp = client.get("/api/history")
    assert resp.status_code == 200, f"History failed: {resp.text}"
    history = resp.json()
    assert len(history) >= 2, f"Expected at least 2 history records, got {len(history)}"
    print(f"  [OK] Retrieved {len(history)} persistent history records.")

    # 7. Verify Export Report
    print("\n[Step 7] Testing /api/export/{id}?format=html...")
    resp = client.get(f"/api/export/{sample_analysis_id}?format=html")
    assert resp.status_code == 200, f"Export HTML failed: {resp.text}"
    assert "SATQUERY AI" in resp.text
    assert "Land Cover Composition" in resp.text
    print("  [OK] Intelligence HTML/PDF printable report generated successfully.")

    # 8. Verify Frontend SPA Serving
    print("\n[Step 8] Testing frontend SPA root route (/)...")
    resp = client.get("/")
    assert resp.status_code == 200, f"Frontend root failed: {resp.text}"
    assert '<div id="root">' in resp.text or "satquery" in resp.text.lower()
    print("  [OK] Frontend SPA bundle correctly mounted and served at '/'")

    print("\n==================================================")
    print("  ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!  ")
    print("==================================================")

if __name__ == "__main__":
    run_verification()
