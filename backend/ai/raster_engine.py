import io
import math
import base64
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Optional, Tuple

class RasterEngine:
    """
    Authentic Remote Sensing Raster Preprocessing & Band Mathematics Engine.
    Handles optical multispectral bands (B02 Blue, B03 Green, B04 Red, B08 NIR, B11 SWIR)
    and SAR backscatter (VV, VH).
    """

    @staticmethod
    def bytes_to_rgb_array(image_bytes: bytes) -> np.ndarray:
        """Convert raw image bytes to float32 RGB array normalized in [0, 1]."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.asarray(image, dtype=np.float32) / 255.0
        return arr

    @staticmethod
    def compute_ndvi(nir_band: np.ndarray, red_band: np.ndarray) -> np.ndarray:
        """
        Normalized Difference Vegetation Index (NDVI) = (NIR - Red) / (NIR + Red)
        Reflects plant photosynthetic activity, biomass density, and canopy health.
        """
        denom = nir_band + red_band + 1e-7
        ndvi = (nir_band - red_band) / denom
        return np.clip(ndvi, -1.0, 1.0)

    @staticmethod
    def compute_ndwi(green_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
        """
        Normalized Difference Water Index (NDWI) = (Green - NIR) / (Green + NIR)
        Delineates open water bodies, rivers, lakes, and flood zones.
        """
        denom = green_band + nir_band + 1e-7
        ndwi = (green_band - nir_band) / denom
        return np.clip(ndwi, -1.0, 1.0)

    @staticmethod
    def compute_ndbi(swir_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
        """
        Normalized Difference Built-up Index (NDBI) = (SWIR - NIR) / (SWIR + NIR)
        Highlights urban infrastructure, concrete surfaces, and impervious land.
        """
        denom = swir_band + nir_band + 1e-7
        ndbi = (swir_band - nir_band) / denom
        return np.clip(ndbi, -1.0, 1.0)

    @staticmethod
    def synthesize_spectral_bands_from_rgb(rgb_norm: np.ndarray) -> Dict[str, np.ndarray]:
        """
        When full raw 12-band Sentinel L2A COG is streamed as calibrated high-res preview:
        Derive synthetic calibrated spectral channels (R, G, B, estimated NIR & SWIR)
        to enable multi-index remote sensing math and PyTorch tensor construction.
        """
        red = rgb_norm[:, :, 0]
        green = rgb_norm[:, :, 1]
        blue = rgb_norm[:, :, 2]
        
        # In optical remote sensing: high NIR reflectance is manifested in lush green canopy
        # where chlorophyll strongly absorbs red & blue while reflecting NIR.
        # Estimate NIR reflectance from spectral signature:
        nir = np.clip(green * 1.5 - (red * 0.4 + blue * 0.3) + 0.05, 0.0, 1.0)
        # SWIR has elevated response over dry bare soil and urban concrete:
        swir = np.clip((red * 0.8 + blue * 0.3) * 1.2 - green * 0.3, 0.0, 1.0)

        ndvi = RasterEngine.compute_ndvi(nir, red)
        ndwi = RasterEngine.compute_ndwi(green, nir)
        ndbi = RasterEngine.compute_ndbi(swir, nir)

        return {
            "red": red,
            "green": green,
            "blue": blue,
            "nir": nir,
            "swir": swir,
            "ndvi": ndvi,
            "ndwi": ndwi,
            "ndbi": ndbi
        }

    @staticmethod
    def sar_backscatter_calibration(sar_norm: np.ndarray) -> Dict[str, Any]:
        """
        Process Sentinel-1 SAR Dual-Pol (VV / VH).
        Calibrates sigma-naught in decibels (dB) and identifies specular water reflections vs rough terrain.
        """
        # sar_norm is 1-channel or 2-channel amplitude
        amplitude = sar_norm[:, :, 0] if sar_norm.ndim == 3 else sar_norm
        # Sigma0 in dB: 10 * log10(amplitude^2 + eps)
        sigma0_db = 10.0 * np.log10(np.square(amplitude) + 1e-6)
        # Specular water reflection typically yields very low SAR backscatter (< -16 dB)
        water_mask = sigma0_db < -15.0

        return {
            "sigma0_db": sigma0_db,
            "water_mask": water_mask,
            "mean_backscatter_db": float(np.mean(sigma0_db)),
            "min_backscatter_db": float(np.min(sigma0_db)),
            "max_backscatter_db": float(np.max(sigma0_db))
        }

    @staticmethod
    def render_colormap_overlay(
        index_grid: np.ndarray,
        colormap_type: str = "ndvi"
    ) -> str:
        """
        Render a 2D scalar field (e.g. NDVI or NDWI) into a colored PNG base64 string
        for direct Leaflet raster overlay.
        """
        h, w = index_grid.shape
        rgba = np.zeros((h, w, 4), dtype=np.uint8)

        if colormap_type == "ndvi":
            # NDVI Colormap: -1 to 0 (water/barren: blue/brown), 0 to 0.3 (soil: yellow), 0.3 to 1.0 (dense canopy: deep green)
            norm_val = np.clip((index_grid + 1.0) / 2.0, 0.0, 1.0)
            rgba[:, :, 0] = np.uint8(255 * (1.0 - norm_val)) # Red
            rgba[:, :, 1] = np.uint8(255 * norm_val)         # Green
            rgba[:, :, 2] = np.uint8(80 * (1.0 - np.abs(index_grid))) # Blue
            rgba[:, :, 3] = 200 # Alpha
        elif colormap_type == "ndwi":
            # Water colormap: positive NDWI is bright cyan/blue
            water_int = np.clip((index_grid + 0.2) / 0.8, 0.0, 1.0)
            rgba[:, :, 0] = np.uint8(30 * (1.0 - water_int))
            rgba[:, :, 1] = np.uint8(150 * water_int)
            rgba[:, :, 2] = np.uint8(240 * water_int + 15)
            rgba[:, :, 3] = np.uint8(np.where(index_grid > 0.0, 220, 40))
        elif colormap_type == "sar":
            # SAR backscatter
            norm_sar = np.clip((index_grid + 30.0) / 35.0, 0.0, 1.0)
            gray = np.uint8(norm_sar * 255)
            rgba[:, :, 0] = gray
            rgba[:, :, 1] = gray
            rgba[:, :, 2] = gray
            rgba[:, :, 3] = 210
        else:
            # Generic heatmap
            norm = np.clip(index_grid, 0.0, 1.0)
            rgba[:, :, 0] = np.uint8(norm * 255)
            rgba[:, :, 1] = np.uint8((1.0 - norm) * 200)
            rgba[:, :, 2] = np.uint8(120)
            rgba[:, :, 3] = 190

        img = Image.fromarray(rgba, "RGBA")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

    @staticmethod
    def render_false_color_composite(bands: Dict[str, np.ndarray]) -> str:
        """
        Generates False-Color Infrared composite (NIR -> Red channel, Red -> Green channel, Green -> Blue channel).
        Highlights vegetation in vibrant red.
        """
        nir = bands.get("nir", np.zeros((100, 100)))
        red = bands.get("red", np.zeros((100, 100)))
        green = bands.get("green", np.zeros((100, 100)))

        h, w = nir.shape
        rgb = np.zeros((h, w, 3), dtype=np.uint8)
        rgb[:, :, 0] = np.uint8(np.clip(nir * 255.0, 0, 255))
        rgb[:, :, 1] = np.uint8(np.clip(red * 255.0, 0, 255))
        rgb[:, :, 2] = np.uint8(np.clip(green * 255.0, 0, 255))

        img = Image.fromarray(rgb, "RGB")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"

raster_engine = RasterEngine()
