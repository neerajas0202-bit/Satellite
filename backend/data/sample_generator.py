import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
from typing import List, Dict, Any

from backend.config import SAMPLES_DIR
from backend.db.database import save_image_record, init_db

def generate_noise(w: int, h: int, scale: float = 0.05) -> np.ndarray:
    """Generate subtle surface texture noise."""
    return np.random.normal(0, 8, (h, w, 3)).astype(np.float32)

def create_airport_scene(dest: Path) -> Dict[str, Any]:
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(95, 125, 75))
    draw = ImageDraw.Draw(img)
    
    # Runway 1 (Main asphalt runway)
    draw.rectangle([120, 80, 220, 944], fill=(55, 60, 65))
    for y in range(120, 900, 60):
        draw.rectangle([165, y, 175, y + 35], fill=(240, 240, 240))
    for x in range(130, 210, 10):
        draw.rectangle([x, 90, x + 5, 140], fill=(240, 240, 240))
        draw.rectangle([x, 880, x + 5, 930], fill=(240, 240, 240))

    # Diagonal Taxiway
    draw.polygon([(220, 300), (360, 450), (320, 480), (220, 370)], fill=(75, 80, 85))
    
    # Main Tarmac / Apron
    draw.rectangle([400, 250, 650, 750], fill=(130, 135, 140))
    draw.line([420, 280, 420, 720], fill=(230, 190, 40), width=4)
    draw.line([520, 280, 520, 720], fill=(230, 190, 40), width=4)
    
    # Terminal Concourse Building
    draw.rectangle([700, 200, 880, 800], fill=(180, 185, 190))
    draw.rectangle([650, 320, 700, 380], fill=(160, 165, 170))
    draw.rectangle([650, 460, 700, 520], fill=(160, 165, 170))
    draw.rectangle([650, 600, 700, 660], fill=(160, 165, 170))

    def draw_airplane(cx, cy, heading_deg, span, length):
        draw.ellipse([cx - 8, cy - length//2, cx + 8, cy + length//2], fill=(245, 245, 245))
        draw.polygon([
            (cx, cy - 5),
            (cx - span//2, cy + 15),
            (cx - span//2 + 8, cy + 22),
            (cx, cy + 10),
            (cx + span//2 - 8, cy + 22),
            (cx + span//2, cy + 15)
        ], fill=(235, 235, 240))
        draw.polygon([
            (cx, cy + length//2 - 12),
            (cx - span//4, cy + length//2),
            (cx + span//4, cy + length//2)
        ], fill=(230, 230, 235))

    draw_airplane(490, 360, 90, 80, 90)
    draw_airplane(510, 480, 90, 90, 100)
    draw_airplane(470, 590, 90, 70, 75)
    draw_airplane(400, 650, 45, 60, 65)

    draw.rectangle([890, 250, 990, 750], fill=(70, 72, 75))
    for r in range(270, 730, 30):
        draw.line([900, r, 980, r], fill=(200, 200, 200), width=2)

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-airport-01",
        "filename": "airport_international.jpg",
        "file_path": str(dest),
        "original_name": "International_Airport_Runway_Apron.jpg",
        "width": w,
        "height": h,
        "gsd_meters": 0.3,
        "sensor_type": "WorldView-3 (0.3m Panchromatic-Sharpened)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2024-08-12",
        "title": "International Airport Hub - Terminal & Runways",
        "description": "Commercial aerodrome infrastructure showing active runway 09R, high-speed taxiways, passenger concourse, and parked aircraft.",
        "sample_queries": [
            "How many aircraft are parked along the terminal apron?",
            "Identify the primary runway orientation and threshold markings.",
            "What is the land-cover breakdown between tarmac, turf, and built structures?",
            "Assess apron operational capacity and security perimeter."
        ]
    }

def create_harbor_scene(dest: Path) -> Dict[str, Any]:
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(35, 65, 85))
    draw = ImageDraw.Draw(img)
    draw.polygon([(0, 0), (480, 0), (420, 1024), (0, 1024)], fill=(155, 158, 162))
    
    # Berth piers
    draw.rectangle([420, 180, 750, 260], fill=(135, 138, 142))
    draw.rectangle([400, 480, 780, 570], fill=(135, 138, 142))
    draw.rectangle([380, 780, 720, 860], fill=(135, 138, 142))

    # Gantry Cranes
    for y in [220, 520, 820]:
        draw.line([380, y, 750, y], fill=(235, 75, 40), width=6)

    # Cargo container stacks
    colors = [(210, 50, 45), (45, 110, 210), (50, 180, 80), (220, 180, 40), (230, 230, 235)]
    np.random.seed(42)
    for bx in range(40, 360, 45):
        for by in range(60, 960, 28):
            c = colors[np.random.randint(0, len(colors))]
            draw.rectangle([bx, by, bx + 36, by + 22], fill=c, outline=(40, 40, 45))

    # Panamax container ships
    draw.polygon([(620, 275), (880, 275), (940, 310), (880, 345), (620, 345)], fill=(40, 45, 50))
    for sx in range(660, 860, 24):
        draw.rectangle([sx, 285, sx + 18, 335], fill=colors[sx % len(colors)])

    draw.polygon([(650, 585), (920, 585), (980, 620), (920, 655), (650, 655)], fill=(160, 40, 35))

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-harbor-02",
        "filename": "maritime_cargo_port.jpg",
        "file_path": str(dest),
        "original_name": "Deepwater_Container_Port_Terminal.jpg",
        "width": w,
        "height": h,
        "gsd_meters": 0.5,
        "sensor_type": "Pléiades Neo (0.5m Optical)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2024-09-05",
        "title": "Deep-Water Container Port & Berths",
        "description": "Marine container terminal showing intermodal container yards, STS cranes, and docked cargo vessels.",
        "sample_queries": [
            "Count the ships and marine vessels visible in the harbor basin.",
            "Locate the container stacking yard and estimate cargo density.",
            "What percentage of the scene consists of open water vs engineered port facilities?",
            "Are there gantry cranes deployed along the berth line?"
        ]
    }

def create_farm_scene(dest: Path) -> Dict[str, Any]:
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(175, 160, 125))
    draw = ImageDraw.Draw(img)

    # Center-pivot circular fields
    pivots = [
        (260, 260, 210, (50, 140, 55)),
        (740, 240, 190, (85, 175, 70)),
        (280, 740, 230, (140, 185, 60)),
        (760, 760, 200, (195, 145, 50)),
        (512, 500, 150, (60, 160, 80))
    ]
    for cx, cy, r, c in pivots:
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c, outline=(140, 120, 85), width=3)
        draw.line([cx, cy, cx + r - 10, cy], fill=(220, 220, 220), width=3)

    # Meandering drainage canal
    draw.line([(0, 480), (200, 510), (450, 490), (700, 530), (1024, 500)], fill=(30, 95, 140), width=24)

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-farm-03",
        "filename": "agricultural_river_delta.jpg",
        "file_path": str(dest),
        "original_name": "Agricultural_Delta_Irrigation_Circles.jpg",
        "width": w,
        "height": h,
        "gsd_meters": 10.0,
        "sensor_type": "Sentinel-2 MSI (10m Multispectral)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2024-07-22",
        "title": "Agricultural River Delta - Center-Pivot Circles",
        "description": "Agricultural sector with circular pivot irrigation fields, drainage waterways, and varying vegetative health.",
        "sample_queries": [
            "Evaluate crop health and simulated NDVI across the circular parcels.",
            "Detect the central water drainage canal and calculate water coverage.",
            "How many center-pivot irrigation circles are active in this sector?",
            "Identify fallow or stressed agricultural land vs vigorous crops."
        ]
    }

def create_urban_scene(dest: Path) -> Dict[str, Any]:
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(140, 142, 145))
    draw = ImageDraw.Draw(img)

    # Highway
    draw.rectangle([480, 0, 545, 1024], fill=(50, 52, 55))
    for y in range(0, 1024, 40):
        draw.line([512, y, 512, y + 20], fill=(240, 240, 240), width=2)

    # City blocks & buildings
    np.random.seed(101)
    for bx in [60, 260, 580, 780]:
        for by in range(60, 960, 160):
            draw.rectangle([bx, by, bx + 150, by + 120], fill=(95, 98, 102))
            # Individual buildings
            for rx in range(bx + 10, bx + 135, 45):
                for ry in range(by + 10, by + 105, 35):
                    sh = 8
                    draw.rectangle([rx + sh, ry + sh, rx + 35 + sh, ry + 25 + sh], fill=(30, 32, 35))
                    b_color = (np.random.randint(180, 245), np.random.randint(180, 240), np.random.randint(170, 230))
                    draw.rectangle([rx, ry, rx + 35, ry + 25], fill=b_color)

    # City Park
    draw.rectangle([60, 380, 210, 660], fill=(45, 115, 55))
    draw.ellipse([90, 480, 180, 560], fill=(40, 85, 130))

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-urban-04",
        "filename": "urban_metropolitan_center.jpg",
        "file_path": str(dest),
        "original_name": "Metropolitan_Urban_Infrastructure.jpg",
        "width": w,
        "height": h,
        "gsd_meters": 0.5,
        "sensor_type": "WorldView-2 (0.5m High Resolution)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2024-10-02",
        "title": "Metropolitan Infrastructure - CBD Core & Highway",
        "description": "Dense urban municipal core exhibiting high-rise commercial structures, multi-lane divided expressway, and civic green park.",
        "sample_queries": [
            "Calculate built-up surface density and impervious cover ratio.",
            "Locate the central municipal park complex.",
            "Analyze traffic flow infrastructure along the primary north-south highway corridor.",
            "Segment building footprints and assess vertical building heights using shadows."
        ]
    }

def create_flood_scene(dest: Path) -> Dict[str, Any]:
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(110, 130, 95))
    draw = ImageDraw.Draw(img)

    # Flood Inundation Water
    draw.polygon([
        (0, 0), (620, 0), (600, 380), (450, 600), (520, 1024), (0, 1024)
    ], fill=(65, 88, 115))

    # Submerged roads
    draw.line([(0, 420), (700, 420)], fill=(75, 78, 80), width=12)
    draw.line([(320, 0), (320, 1024)], fill=(75, 78, 80), width=12)

    # Isolated buildings in flooded zones
    for r in range(200, 800, 70):
        for c in range(730, 920, 60):
            draw.rectangle([c, r, c + 35, r + 35], fill=(210, 180, 150), outline=(60, 60, 60))

    draw.ellipse([600, 370, 640, 410], fill=(220, 40, 40))

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-flood-05",
        "filename": "coastal_flood_inundation.jpg",
        "file_path": str(dest),
        "original_name": "Post_Disaster_Coastal_Flood_Inundation.jpg",
        "width": w,
        "height": h,
        "gsd_meters": 0.8,
        "sensor_type": "RADARSAT / Optical Fusion (0.8m)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2024-06-18",
        "title": "Post-Disaster Riverine & Coastal Flood Inundation",
        "description": "Emergency response scene detailing widespread inundation, submerged arterial roads, sediment plumes, and isolated highland settlements.",
        "sample_queries": [
            "Estimate total percentage of inundated terrain and standing floodwater.",
            "Locate breached levee/embankment section and cut-off road links.",
            "Identify residential settlements under acute inundation risk.",
            "Compare intact eastern highland terrain vs submerged western plains."
        ]
    }

# =========================================================================
# NEW DEDICATED SCENARIOS FOR SIH 2026:
# 1. BI-TEMPORAL PAIR (2022 vs 2025)
# 2. MULTIMODAL PAIR (OPTICAL vs SAR)
# =========================================================================

def create_temporal_before_2022(dest: Path) -> Dict[str, Any]:
    """Urban Expansion - Observation 1 (2022-03-15): Rural & agricultural fringe with modest settlement."""
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(90, 135, 70)) # Lush vegetation/farmland
    draw = ImageDraw.Draw(img)

    # Modest 2-lane road
    draw.line([(80, 180), (940, 180)], fill=(120, 115, 105), width=8)
    draw.line([(512, 180), (512, 920)], fill=(120, 115, 105), width=8)

    # Modest existing settlement in NW quadrant
    for r in range(240, 420, 50):
        for c in range(160, 380, 55):
            draw.rectangle([c, r, c + 35, r + 30], fill=(200, 195, 180), outline=(80, 80, 80))

    # Small pond
    draw.ellipse([650, 650, 820, 780], fill=(45, 95, 135))

    # Dense trees / orchard patches in East
    for ex in range(600, 920, 60):
        for ey in range(250, 550, 50):
            draw.ellipse([ex, ey, ex + 40, ey + 35], fill=(45, 105, 40))

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-temporal-2022",
        "filename": "urban_expansion_2022.jpg",
        "file_path": str(dest),
        "original_name": "Sentinel2_Urban_Corridor_20220315.tif",
        "width": w,
        "height": h,
        "gsd_meters": 10.0,
        "sensor_type": "Sentinel-2 MSI (Level-2A BOA)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2022-03-15",
        "pair_id": "sample-temporal-2025",
        "title": "Urban Expansion Baseline (Epoch 2022 - Before)",
        "description": "Pre-development baseline showing contiguous agricultural parcels, rural residential clusters, and intact eastern tree cover.",
        "sample_queries": [
            "What changed between these two images?",
            "Has the built-up area increased?",
            "Detect land cover transition and canopy loss.",
            "Compare infrastructure layout with epoch 2025."
        ]
    }

def create_temporal_after_2025(dest: Path) -> Dict[str, Any]:
    """Urban Expansion - Observation 2 (2025-02-20): +18.4% Built-up, wide highway, cleared vegetation."""
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(110, 135, 85))
    draw = ImageDraw.Draw(img)

    # Upgraded 6-lane paved highway with interchanges
    draw.line([(80, 180), (940, 180)], fill=(45, 48, 52), width=24)
    draw.line([(512, 180), (512, 920)], fill=(45, 48, 52), width=24)
    # Highway median lines
    for x in range(90, 930, 40):
        draw.line([x, 180, x + 20, 180], fill=(230, 230, 230), width=2)
    for y in range(190, 910, 40):
        draw.line([512, y, 512, y + 20], fill=(230, 230, 230), width=2)

    # Original NW settlement
    for r in range(240, 420, 50):
        for c in range(160, 380, 55):
            draw.rectangle([c, r, c + 35, r + 30], fill=(200, 195, 180), outline=(80, 80, 80))

    # MAJOR CHANGE: New South-Central Industrial / Logistics Park (+18.4% built-up expansion)
    draw.rectangle([540, 300, 880, 560], fill=(160, 162, 165)) # Graded concrete apron
    for wy in [330, 410, 490]:
        for wx in [560, 680, 780]:
            draw.rectangle([wx, wy, wx + 90, wy + 55], fill=(235, 238, 242), outline=(50, 50, 55), width=2)

    # South-western commercial block
    for cy in range(580, 850, 70):
        for cx in range(180, 450, 80):
            draw.rectangle([cx, cy, cx + 55, cy + 45], fill=(215, 175, 130), outline=(60, 60, 60))

    # Cleared eastern vegetation (ground cleared for grading)
    draw.rectangle([600, 600, 920, 850], fill=(165, 145, 115))

    # Pond preserved
    draw.ellipse([650, 650, 820, 780], fill=(40, 85, 125))

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-temporal-2025",
        "filename": "urban_expansion_2025.jpg",
        "file_path": str(dest),
        "original_name": "Sentinel2_Urban_Corridor_20250220.tif",
        "width": w,
        "height": h,
        "gsd_meters": 10.0,
        "sensor_type": "Sentinel-2 MSI (Level-2A BOA)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2025-02-20",
        "pair_id": "sample-temporal-2022",
        "title": "Urban Expansion Monitoring (Epoch 2025 - After)",
        "description": "Post-development scene revealing +18.4% built-up expansion, 24 new industrial warehouse structures, and 6-lane arterial highway corridor.",
        "sample_queries": [
            "What changed between these two images?",
            "Has the built-up area increased?",
            "Identify the new construction in the eastern zone.",
            "Estimate road expansion and canopy reduction."
        ]
    }

def create_coastal_optical(dest: Path) -> Dict[str, Any]:
    """Coastal Delta - Optical Image (Sentinel-2 True Color RGB)."""
    w, h = 1024, 1024
    img = Image.new("RGB", (w, h), color=(30, 80, 115)) # Water
    draw = ImageDraw.Draw(img)

    # Coastline / Port Land
    draw.polygon([(0, 0), (520, 0), (460, 1024), (0, 1024)], fill=(120, 135, 110))
    # Quayside concrete
    draw.rectangle([420, 150, 560, 850], fill=(165, 168, 172))
    # Bridge across delta
    draw.line([(350, 500), (950, 500)], fill=(185, 185, 190), width=16)

    # Ships in water
    draw.polygon([(650, 250), (840, 250), (890, 280), (840, 310), (650, 310)], fill=(210, 45, 40))
    draw.polygon([(620, 700), (800, 700), (850, 730), (800, 760), (620, 760)], fill=(35, 40, 45))

    # Thin wispy cloud cover over top right
    cloud = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(cloud)
    cdraw.ellipse([600, 50, 980, 320], fill=(255, 255, 255, 110))
    cdraw.ellipse([700, 150, 1020, 400], fill=(255, 255, 255, 90))
    img.paste(Image.alpha_composite(img.convert("RGBA"), cloud).convert("RGB"))

    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-multimodal-optical",
        "filename": "coastal_harbor_optical.jpg",
        "file_path": str(dest),
        "original_name": "Sentinel2_Coastal_Delta_Optical_RGB.tif",
        "width": w,
        "height": h,
        "gsd_meters": 10.0,
        "sensor_type": "Sentinel-2 MSI (Optical Spectral)",
        "source_type": "sample",
        "modality": "OPTICAL",
        "crs": "EPSG:4326",
        "acquisition_date": "2024-11-10",
        "pair_id": "sample-multimodal-sar",
        "title": "Coastal Delta Harbor (Sentinel-2 Optical)",
        "description": "Multi-spectral optical observation capturing surface reflectance, water turbidity, vegetation, and partial semi-transparent cirrus cloud cover.",
        "sample_queries": [
            "Use optical and SAR data to identify built-up and water-covered regions.",
            "Compare sensor capability through cloud and haze.",
            "Delineate water shoreline boundaries using complementary sensors.",
            "Identify structural double bounce vs optical reflectance."
        ]
    }

def create_coastal_sar(dest: Path) -> Dict[str, Any]:
    """Coastal Delta - SAR Image (Sentinel-1 C-Band Radar Backscatter)."""
    w, h = 1024, 1024
    # Microwave noise background
    arr = np.random.normal(50, 15, (h, w)).clip(20, 90).astype(np.uint8)
    
    # Water has specular reflection: ZERO/MINIMAL backscatter (< -22 dB) -> almost pure dark
    water_mask = np.zeros((h, w), dtype=bool)
    for y in range(h):
        coast_x = int(520 - (y / 1024.0) * 60)
        water_mask[y, coast_x:] = True
    
    arr[water_mask] = np.random.normal(18, 6, (np.sum(water_mask),)).clip(5, 35).astype(np.uint8)
    
    # Quayside concrete: moderate rough diffuse backscatter (110 - 150)
    for y in range(150, 850):
        for x in range(420, 560):
            arr[y, x] = np.random.randint(120, 170)

    # Steel ships & cranes: INTENSE CORNER-REFLECTOR DOUBLE-BOUNCE (240 - 255 bright white)
    # Ship 1
    arr[245:315, 650:890] = np.random.randint(230, 255, (70, 240))
    # Ship 2
    arr[695:765, 620:850] = np.random.randint(235, 255, (70, 230))
    # Bridge (metallic structural span clearly piercing through)
    arr[494:506, 350:950] = np.random.randint(220, 255, (12, 600))

    img = Image.fromarray(arr, mode="L").convert("RGB")
    img.save(dest, "JPEG", quality=92)
    return {
        "id": "sample-multimodal-sar",
        "filename": "coastal_harbor_sar.jpg",
        "file_path": str(dest),
        "original_name": "Sentinel1_Coastal_Delta_SAR_VV_VH.tif",
        "width": w,
        "height": h,
        "gsd_meters": 10.0,
        "sensor_type": "Sentinel-1 C-SAR (C-band Microwave Radar)",
        "source_type": "sample",
        "modality": "SAR",
        "crs": "EPSG:4326",
        "acquisition_date": "2024-11-10",
        "pair_id": "sample-multimodal-optical",
        "title": "Coastal Delta Harbor (Sentinel-1 SAR)",
        "description": "Co-registered C-band Synthetic Aperture Radar backscatter image showing intense double-bounce on ships/bridge and zero backscatter on calm water (unaffected by clouds).",
        "sample_queries": [
            "Use optical and SAR data to identify built-up and water-covered regions.",
            "Compare sensor capability through cloud and haze.",
            "Delineate water shoreline boundaries using complementary sensors.",
            "Identify structural double bounce vs optical reflectance."
        ]
    }

def generate_all_samples() -> List[Dict[str, Any]]:
    init_db()
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
    
    samples_meta = [
        # 1. Primary Demo: Bi-temporal Pair
        create_temporal_before_2022(SAMPLES_DIR / "urban_expansion_2022.jpg"),
        create_temporal_after_2025(SAMPLES_DIR / "urban_expansion_2025.jpg"),
        # 2. Primary Demo: Optical + SAR Pair
        create_coastal_optical(SAMPLES_DIR / "coastal_harbor_optical.jpg"),
        create_coastal_sar(SAMPLES_DIR / "coastal_harbor_sar.jpg"),
        # 3. Benchmark / Specialized Single Scenes
        create_airport_scene(SAMPLES_DIR / "airport_international.jpg"),
        create_harbor_scene(SAMPLES_DIR / "maritime_cargo_port.jpg"),
        create_farm_scene(SAMPLES_DIR / "agricultural_river_delta.jpg"),
        create_urban_scene(SAMPLES_DIR / "urban_metropolitan_center.jpg"),
        create_flood_scene(SAMPLES_DIR / "coastal_flood_inundation.jpg")
    ]
    
    for meta in samples_meta:
        save_image_record(meta)
        
    return samples_meta

if __name__ == "__main__":
    results = generate_all_samples()
    print(f"Generated {len(results)} sample remote sensing scenes in {SAMPLES_DIR}")
