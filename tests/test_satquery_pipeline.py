import numpy as np
from backend.ai.raster_engine import raster_engine
from backend.ai.models import model_registry
from backend.ai.models.vectorizer import vectorizer
from backend.ai.query_interpreter import query_interpreter
from backend.ai.pipeline import pipeline

def test_query_interpreter():
    q1 = query_interpreter.interpret("Detect flooded areas in this region")
    assert q1["task_type"] == "water_flood_segmentation"

    q2 = query_interpreter.interpret("Show built-up expansion")
    assert q2["task_type"] == "urban_expansion_segmentation"

    q3 = query_interpreter.interpret("Identify vegetation loss")
    assert q3["task_type"] == "vegetation_loss_analysis"

    q4 = query_interpreter.interpret("Compare 2023 and 2025")
    assert q4["task_type"] == "change_detection"

def test_raster_engine_spectral_indices():
    nir = np.full((10, 10), 0.8, dtype=np.float32)
    red = np.full((10, 10), 0.2, dtype=np.float32)
    green = np.full((10, 10), 0.5, dtype=np.float32)
    swir = np.full((10, 10), 0.3, dtype=np.float32)

    ndvi = raster_engine.compute_ndvi(nir, red)
    assert ndvi.shape == (10, 10)
    assert np.all(ndvi > 0.5)

    ndwi = raster_engine.compute_ndwi(green, nir)
    assert ndwi.shape == (10, 10)

    ndbi = raster_engine.compute_ndbi(swir, nir)
    assert ndbi.shape == (10, 10)

def test_vectorizer_geodesic_area():
    bbox = [-114.85, 35.95, -114.55, 36.25]
    mask = np.zeros((100, 100), dtype=np.uint8)
    mask[20:40, 20:40] = 1 # 400 pixels out of 10000 (4%)

    total_km2, det_km2, det_ha = vectorizer.calculate_geodesic_area_km2(bbox, mask)
    assert total_km2 > 0
    assert det_km2 > 0
    assert det_ha > 0
    assert abs((det_km2 / total_km2) - 0.04) < 0.001

    features = vectorizer.mask_to_geojson_features(mask, bbox, "Water", 0.95)
    assert len(features) > 0
    assert features[0]["geometry"]["type"] == "Polygon"

def test_water_flood_pytorch_model():
    model = model_registry.get_model_for_task("water_flood_segmentation")
    h, w = 64, 64
    tensor_inputs = {
        "ndwi": np.full((h, w), 0.3, dtype=np.float32),
        "nir": np.full((h, w), 0.1, dtype=np.float32),
        "green": np.full((h, w), 0.4, dtype=np.float32),
        "red": np.full((h, w), 0.15, dtype=np.float32)
    }
    res = model.infer(tensor_inputs, {"bbox": [-114.85, 35.95, -114.55, 36.25]})
    assert res["task"] == "water_flood_segmentation"
    assert "geojson" in res
    assert res["coverage_percentage"] > 0

def test_uploaded_image_analysis():
    from backend.ai.image_processor import image_processor
    from PIL import Image
    from pathlib import Path

    test_path = Path("backend/uploads/test_unit_scene.png")
    test_path.parent.mkdir(parents=True, exist_ok=True)
    img_data = np.full((128, 128, 3), 120, dtype=np.uint8)
    Image.fromarray(img_data).save(test_path)

    meta = image_processor.process_uploaded_image(test_path.read_bytes(), "test_unit_scene.png", test_path)
    assert meta["width"] == 128
    assert meta["height"] == 128

    res = pipeline.execute_uploaded_image_analysis(
        image_record=meta,
        query="Detect flooded areas in this image",
        satellite_type="Sentinel-2 Optical"
    )
    assert res["status"] == "completed"
    assert "natural_language_summary" in res
    assert res["task_type"] == "water_flood_segmentation"

