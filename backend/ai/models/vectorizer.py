import math
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from shapely.geometry import Polygon, MultiPolygon, shape, mapping
from shapely.ops import unary_union
from scipy.ndimage import label, find_objects

class GeospatialVectorizer:
    """
    Converts 2D spatial raster prediction masks into valid GeoJSON polygons
    with real-world WGS84 (EPSG:4326) coordinates and calculates accurate geodesic physical areas.
    """

    @staticmethod
    def calculate_geodesic_area_km2(bbox: List[float], mask: np.ndarray) -> Tuple[float, float, float]:
        """
        Calculates:
        - total bounding box area in km²
        - detected positive mask area in km²
        - detected area in hectares (1 km² = 100 ha)
        Uses WGS84 ellipsoidal / geodesic approximation based on latitude.
        """
        min_lon, min_lat, max_lon, max_lat = bbox
        
        # Mean latitude in radians
        mean_lat_rad = math.radians((min_lat + max_lat) / 2.0)
        
        # Length of 1 degree latitude (~111.139 km)
        lat_km_per_deg = 111.139
        # Length of 1 degree longitude depends on cosine of latitude
        lon_km_per_deg = 111.139 * math.cos(mean_lat_rad)

        width_km = abs(max_lon - min_lon) * lon_km_per_deg
        height_km = abs(max_lat - min_lat) * lat_km_per_deg
        total_bbox_area_km2 = max(0.0001, width_km * height_km)

        total_pixels = mask.size
        positive_pixels = int(np.count_nonzero(mask))
        fraction = positive_pixels / float(total_pixels) if total_pixels > 0 else 0.0

        detected_area_km2 = total_bbox_area_km2 * fraction
        detected_area_ha = detected_area_km2 * 100.0

        return total_bbox_area_km2, detected_area_km2, detected_area_ha

    @staticmethod
    def mask_to_geojson_features(
        mask: np.ndarray,
        bbox: List[float],
        class_name: str,
        confidence: float,
        properties: Optional[Dict[str, Any]] = None,
        max_polygons: int = 40,
        min_pixel_size: int = 6
    ) -> List[Dict[str, Any]]:
        """
        Extracts contiguous connected components from binary mask and maps them to GeoJSON features.
        """
        min_lon, min_lat, max_lon, max_lat = bbox
        h, w = mask.shape
        
        labeled_array, num_features = label(mask.astype(np.uint8))
        if num_features == 0:
            return []

        features = []
        slices = find_objects(labeled_array)
        
        # Calculate pixel resolution in geographic degrees
        d_lon = (max_lon - min_lon) / float(w)
        d_lat = (max_lat - min_lat) / float(h)

        # Sort components by pixel count (largest first)
        component_sizes = []
        for i, sl in enumerate(slices):
            if sl is None:
                continue
            comp_mask = (labeled_array[sl] == (i + 1))
            pixel_count = np.count_nonzero(comp_mask)
            if pixel_count >= min_pixel_size:
                component_sizes.append((pixel_count, i, sl))

        component_sizes.sort(key=lambda x: x[0], reverse=True)
        top_components = component_sizes[:max_polygons]

        mean_lat_rad = math.radians((min_lat + max_lat) / 2.0)
        km2_per_pixel = ((d_lon * 111.139 * math.cos(mean_lat_rad)) * (d_lat * 111.139))

        for pixel_count, idx, sl in top_components:
            y_slice, x_slice = sl
            y_min, y_max = y_slice.start, y_slice.stop
            x_min, x_max = x_slice.start, x_slice.stop

            # Convert bounding sub-grid to polygon coordinates
            # Note: image top (y=0) corresponds to max_lat (North)
            lon1 = min_lon + x_min * d_lon
            lon2 = min_lon + x_max * d_lon
            lat_top = max_lat - y_min * d_lat
            lat_bottom = max_lat - y_max * d_lat

            # Form bounding rectangle for this component
            poly_coords = [
                [round(lon1, 6), round(lat_top, 6)],
                [round(lon2, 6), round(lat_top, 6)],
                [round(lon2, 6), round(lat_bottom, 6)],
                [round(lon1, 6), round(lat_bottom, 6)],
                [round(lon1, 6), round(lat_top, 6)]
            ]

            comp_area_km2 = pixel_count * km2_per_pixel
            comp_area_ha = comp_area_km2 * 100.0

            feat_props = {
                "class": class_name,
                "confidence": round(confidence, 3),
                "pixel_count": int(pixel_count),
                "area_km2": round(comp_area_km2, 4),
                "area_ha": round(comp_area_ha, 2)
            }
            if properties:
                feat_props.update(properties)

            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [poly_coords]
                },
                "properties": feat_props
            })

        return features

vectorizer = GeospatialVectorizer()
