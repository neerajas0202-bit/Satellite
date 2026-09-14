import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_endpoints():
    r = client.get("/api/health")
    print("Health status:", r.status_code, r.json()["service"])
    assert r.status_code == 200

    r = client.get("/api/models")
    print("Models count:", r.status_code, len(r.json()))
    assert r.status_code == 200
    assert len(r.json()) == 5

    r = client.get("/api/samples")
    print("Samples count:", r.status_code, len(r.json()))
    assert r.status_code == 200
    assert len(r.json()) >= 7

    # Test analyze query
    samples = r.json()
    temporal_2022 = next(s for s in samples if "2022" in s["id"])
    temporal_2025 = next(s for s in samples if "2025" in s["id"])

    # Test validate
    r_val = client.post("/api/validate", data={
        "image_id": temporal_2022["id"],
        "pair_image_id": temporal_2025["id"],
        "task_hint": "change_detection"
    })
    print("Validate status:", r_val.status_code, r_val.json()["status"], r_val.json()["summary_message"])
    assert r_val.status_code == 200

    # Test analyze
    r_ana = client.post("/api/analyze", json={
        "image_id": temporal_2022["id"],
        "pair_image_id": temporal_2025["id"],
        "query": "What changed between these two images?"
    })
    print("Analyze status:", r_ana.status_code, r_ana.json()["task_identified"])
    assert r_ana.status_code == 200
    assert len(r_ana.json()["execution_trace"]) == 7
    assert len(r_ana.json()["key_findings"]) >= 3

    # Test compare
    r_cmp = client.post("/api/compare", json={
        "before_image_id": temporal_2022["id"],
        "after_image_id": temporal_2025["id"]
    })
    print("Compare status:", r_cmp.status_code, r_cmp.json()["built_up_expansion_pct"])
    assert r_cmp.status_code == 200

    # Test multimodal
    opt = next(s for s in samples if "optical" in s["id"])
    sar = next(s for s in samples if "sar" in s["id"])
    r_mm = client.post("/api/multimodal", json={
        "optical_image_id": opt["id"],
        "sar_image_id": sar["id"]
    })
    print("Multimodal status:", r_mm.status_code, r_mm.json()["confidence"])
    assert r_mm.status_code == 200

    # Test evaluation
    r_eval = client.get("/api/evaluation")
    print("Evaluation status:", r_eval.status_code, len(r_eval.json()["metrics"]))
    assert r_eval.status_code == 200

    print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
