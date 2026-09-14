import asyncio
import unittest
from pathlib import Path
from backend.db.database import init_db, get_all_images, get_analysis_history
from backend.db.models import QueryRequest
from backend.ai.pipeline import pipeline

class TestSatQueryBackend(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_samples_exist(self):
        samples = get_all_images(source_type="sample")
        self.assertGreaterEqual(len(samples), 5)
        for s in samples:
            self.assertTrue(Path(s["file_path"]).exists(), f"Sample image file missing: {s['file_path']}")
            self.assertEqual(s["width"], 1024)
            self.assertEqual(s["height"], 1024)

    def test_ai_pipeline_query(self):
        samples = get_all_images(source_type="sample")
        airport = next(s for s in samples if "airport" in s["filename"])
        
        req = QueryRequest(
            image_id=airport["id"],
            query="How many aircraft are parked on the tarmac?",
            analysis_mode="object_detection",
            model_provider="rs_engine"
        )
        
        result = asyncio.run(pipeline.execute_query(
            image_path=airport["file_path"],
            image_metadata=airport,
            request=req
        ))
        
        self.assertIsNotNone(result.answer)
        self.assertGreater(result.confidence, 0.8)
        self.assertGreater(len(result.detected_objects), 0)
        self.assertGreater(result.land_cover_stats.built_up, 0)
        self.assertIsNotNone(result.spectral_metrics.mean_ndvi)

if __name__ == "__main__":
    unittest.main()
