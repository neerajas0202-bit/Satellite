import os
import uuid
import math
import numpy as np
from PIL import Image, ExifTags
from typing import Dict, Any, Optional, Tuple, List
from pathlib import Path

class ImageMetadataExtractor:
    """
    Extracts spatial and sensor metadata from uploaded satellite and aerial imagery.
    Detects embedded GeoTIFF tags, WGS84 coordinates, dimensions, channels, and GSD.
    """

    @staticmethod
    def process_uploaded_image(file_bytes: bytes, filename: str, save_path: Path) -> Dict[str, Any]:
        """
        Saves uploaded file and inspects metadata.
        """
        # Save raw file
        with open(save_path, "wb") as f:
            f.write(file_bytes)

        img = Image.open(save_path)
        width, height = img.size
        mode = img.mode
        channels = len(img.getbands())

        # Check for TIFF / GeoTIFF tags or embedded geographic metadata
        is_georeferenced = False
        crs = "None (Image-Space)"
        bbox = None # [min_lon, min_lat, max_lon, max_lat]
        gsd_meters = None

        # Check TIFF tags if available
        if hasattr(img, "tag_v2") and img.tag_v2:
            tags = img.tag_v2
            # ModelTiepointTag (33922) or GeoKeyDirectoryTag (34735) or ModelPixelScaleTag (33550)
            if 33922 in tags or 34735 in tags or 33550 in tags:
                is_georeferenced = True
                crs = "EPSG:4326 (WGS84)"
                # Extract pixel scale / tie point if available
                if 33550 in tags:
                    scales = tags[33550]
                    gsd_meters = float(scales[0]) if len(scales) > 0 else 10.0
                if 33922 in tags:
                    tiepoints = tags[33922]
                    if len(tiepoints) >= 6:
                        origin_x, origin_y = float(tiepoints[3]), float(tiepoints[4])
                        # If scale is present, compute bbox
                        if 33550 in tags:
                            dx = float(tags[33550][0]) * width
                            dy = float(tags[33550][1]) * height
                            bbox = [round(origin_x, 6), round(origin_y - dy, 6), round(origin_x + dx, 6), round(origin_y, 6)]

        # Check for GPS Info in EXIF (for drone / aerial photos)
        if not is_georeferenced and hasattr(img, "_getexif"):
            exif = img._getexif()
            if exif:
                for tag, value in exif.items():
                    tag_name = ExifTags.TAGS.get(tag, tag)
                    if tag_name == "GPSInfo":
                        is_georeferenced = True
                        crs = "EPSG:4326 (GPS)"
                        break

        # Generate a web-friendly preview image (PNG) if GeoTIFF/TIFF
        preview_filename = f"preview_{Path(filename).stem}.png"
        preview_path = save_path.parent / preview_filename

        rgb_img = img.convert("RGB")
        # Resize to max 1024x1024 for snappy web preview if very large
        max_dim = max(width, height)
        if max_dim > 1024:
            scale_factor = 1024.0 / max_dim
            preview_img = rgb_img.resize((int(width * scale_factor), int(height * scale_factor)), Image.Resampling.BILINEAR)
        else:
            preview_img = rgb_img

        preview_img.save(preview_path, format="PNG")

        return {
            "id": str(uuid.uuid4()),
            "filename": filename,
            "preview_filename": preview_filename,
            "file_path": str(save_path),
            "preview_url": f"/static/uploads/{preview_filename}",
            "width": width,
            "height": height,
            "channels": channels,
            "mode": mode,
            "is_georeferenced": is_georeferenced,
            "crs": crs,
            "bbox": bbox,
            "gsd_meters": gsd_meters or 10.0,
            "file_size_kb": round(len(file_bytes) / 1024.0, 2)
        }

image_processor = ImageMetadataExtractor()
