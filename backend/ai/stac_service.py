import math
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
import requests
import numpy as np

logger = logging.getLogger("satquery.stac")

PLANETARY_COMPUTER_STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"
AWS_EARTH_SEARCH_STAC = "https://earth-search.aws.element84.com/v1"
CDSE_STAC = "https://catalogue.dataspace.copernicus.eu/stac"

class STACService:
    """
    Real satellite data retrieval service connecting to open Earth Observation STAC catalogs.
    Queries Sentinel-2 L2A (Multispectral Optical) and Sentinel-1 GRD (SAR).
    """

    def __init__(self, custom_stac_endpoint: Optional[str] = None):
        self.endpoint = custom_stac_endpoint or PLANETARY_COMPUTER_STAC
        self.fallback_endpoint = AWS_EARTH_SEARCH_STAC

    def search_scenes(
        self,
        bbox: List[float], # [min_lon, min_lat, max_lon, max_lat]
        start_date: str,
        end_date: str,
        satellite: str = "Sentinel-2",
        max_cloud_cover: float = 40.0,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for real Sentinel-1 or Sentinel-2 satellite acquisitions within bounding box and datetime range.
        Returns authentic scene metadata.
        """
        collection = "sentinel-2-l2a" if "sentinel-2" in satellite.lower() else "sentinel-1-grd"
        datetime_range = f"{start_date}T00:00:00Z/{end_date}T23:59:59Z"
        
        search_payload = {
            "bbox": bbox,
            "datetime": datetime_range,
            "collections": [collection],
            "limit": limit
        }

        # For Sentinel-2 optical, filter cloud cover
        if "sentinel-2" in satellite.lower() and max_cloud_cover < 100:
            search_payload["query"] = {
                "eo:cloud_cover": {"lt": max_cloud_cover}
            }

        headers = {"User-Agent": "SatQuery-EarthObservation/1.0"}

        items = []
        # Try primary endpoint first
        try:
            resp = requests.post(f"{self.endpoint}/search", json=search_payload, headers=headers, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                items = data.get("features", [])
        except Exception as e:
            logger.warning(f"Primary STAC search failed: {e}. Trying fallback STAC...")

        # If primary failed or returned 0, try AWS Earth Search fallback
        if not items and self.endpoint != self.fallback_endpoint:
            try:
                fallback_payload = dict(search_payload)
                if collection == "sentinel-2-l2a":
                    fallback_payload["collections"] = ["sentinel-2-l2a"]
                resp = requests.post(f"{self.fallback_endpoint}/search", json=fallback_payload, headers=headers, timeout=12)
                if resp.status_code == 200:
                    items = resp.json().get("features", [])
            except Exception as e:
                logger.error(f"Fallback STAC search error: {e}")

        parsed_scenes = []
        for item in items:
            props = item.get("properties", {})
            assets = item.get("assets", {})
            
            # Extract standard band URLs or visual assets
            scene_info = {
                "id": item.get("id"),
                "collection": item.get("collection"),
                "datetime": props.get("datetime") or props.get("start_datetime"),
                "cloud_cover": props.get("eo:cloud_cover", 0.0),
                "platform": props.get("platform", satellite),
                "constellation": props.get("constellation", "Sentinel"),
                "bbox": item.get("bbox", bbox),
                "geometry": item.get("geometry"),
                "assets": {
                    k: {
                        "href": v.get("href"),
                        "title": v.get("title", k),
                        "type": v.get("type", "")
                    }
                    for k, v in assets.items()
                    if k in ["rendered_preview", "visual", "thumbnail", "overview", "B02", "B03", "B04", "B08", "B11", "B12", "vv", "vh"]
                }
            }
            parsed_scenes.append(scene_info)

        return parsed_scenes

    def fetch_scene_bands_or_preview(
        self,
        scene: Dict[str, Any],
        bbox: List[float]
    ) -> Dict[str, Any]:
        """
        Extracts real image stream or COG preview for the specified scene and bounding box.
        """
        assets = scene.get("assets", {})
        preview_url = None
        for key in ["rendered_preview", "visual", "thumbnail", "overview"]:
            if key in assets and assets[key].get("href"):
                preview_url = assets[key]["href"]
                break

        image_bytes = None
        if preview_url:
            try:
                r = requests.get(preview_url, timeout=15)
                if r.status_code == 200:
                    image_bytes = r.content
            except Exception as e:
                logger.error(f"Failed to fetch preview image: {e}")

        return {
            "scene_id": scene.get("id"),
            "acquisition_date": scene.get("datetime"),
            "cloud_cover": scene.get("cloud_cover", 0.0),
            "platform": scene.get("platform"),
            "preview_url": preview_url,
            "has_raw_bytes": image_bytes is not None,
            "image_bytes": image_bytes
        }

stac_service = STACService()
