import sqlite3
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from backend.config import DB_PATH

def get_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Images table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        original_name TEXT NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        gsd_meters REAL DEFAULT 10.0,
        sensor_type TEXT DEFAULT 'Sentinel-2 MSI',
        source_type TEXT DEFAULT 'upload',
        modality TEXT DEFAULT 'OPTICAL',
        crs TEXT DEFAULT 'EPSG:4326',
        acquisition_date TEXT DEFAULT '2025-02-20',
        pair_id TEXT,
        title TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Analysis records table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        image_id TEXT NOT NULL,
        pair_image_id TEXT,
        query TEXT NOT NULL,
        analysis_mode TEXT NOT NULL,
        answer TEXT NOT NULL,
        confidence REAL NOT NULL,
        detected_objects TEXT NOT NULL,
        land_cover_stats TEXT NOT NULL,
        visual_evidence TEXT NOT NULL,
        spectral_metrics TEXT,
        execution_trace TEXT,
        key_findings TEXT,
        confidence_breakdown TEXT,
        selected_models TEXT,
        model_used TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Real Satellite Geospatial Analyses table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS satellite_analyses (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        task_type TEXT NOT NULL,
        satellite TEXT NOT NULL,
        bbox TEXT NOT NULL,
        scene_id TEXT,
        acquisition_date TEXT,
        metrics TEXT NOT NULL,
        geojson TEXT NOT NULL,
        natural_language_summary TEXT NOT NULL,
        model_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Check and add any missing columns in existing tables for safe migrations
    try:
        cursor.execute("PRAGMA table_info(images)")
        img_cols = [c[1] for c in cursor.fetchall()]
        if "modality" not in img_cols:
            cursor.execute("ALTER TABLE images ADD COLUMN modality TEXT DEFAULT 'OPTICAL'")
        if "crs" not in img_cols:
            cursor.execute("ALTER TABLE images ADD COLUMN crs TEXT DEFAULT 'EPSG:4326'")
        if "acquisition_date" not in img_cols:
            cursor.execute("ALTER TABLE images ADD COLUMN acquisition_date TEXT DEFAULT '2025-02-20'")
        if "pair_id" not in img_cols:
            cursor.execute("ALTER TABLE images ADD COLUMN pair_id TEXT")

        cursor.execute("PRAGMA table_info(analyses)")
        ana_cols = [c[1] for c in cursor.fetchall()]
        if "pair_image_id" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN pair_image_id TEXT")
        if "execution_trace" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN execution_trace TEXT")
        if "key_findings" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN key_findings TEXT")
        if "confidence_breakdown" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN confidence_breakdown TEXT")
        if "selected_models" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN selected_models TEXT")
        if "overlays" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN overlays TEXT")
        if "intent" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN intent TEXT")
        if "task_identified" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN task_identified TEXT")
        if "mode" not in ana_cols:
            cursor.execute("ALTER TABLE analyses ADD COLUMN mode TEXT DEFAULT 'demo'")
    except Exception as e:
        print(f"[DB INIT] Column migration check: {e}")

    conn.commit()
    conn.close()

def save_image_record(data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO images (
            id, filename, file_path, original_name, width, height, 
            gsd_meters, sensor_type, source_type, modality, crs,
            acquisition_date, pair_id, title, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['id'], data['filename'], data['file_path'], data['original_name'],
        data['width'], data['height'], data.get('gsd_meters', 10.0),
        data.get('sensor_type', 'Sentinel-2 MSI'),
        data.get('source_type', 'upload'),
        data.get('modality', 'OPTICAL'),
        data.get('crs', 'EPSG:4326'),
        data.get('acquisition_date', '2025-02-20'),
        data.get('pair_id', None),
        data.get('title', ''), data.get('description', '')
    ))
    conn.commit()
    conn.close()

def get_image_record(image_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM images WHERE id = ?", (image_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def get_all_images(source_type: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    if source_type:
        cursor.execute("SELECT * FROM images WHERE source_type = ? ORDER BY created_at ASC", (source_type,))
    else:
        cursor.execute("SELECT * FROM images ORDER BY created_at ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def save_analysis_record(data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO analyses (
            id, image_id, pair_image_id, query, analysis_mode, answer, confidence,
            detected_objects, land_cover_stats, visual_evidence, spectral_metrics,
            execution_trace, key_findings, confidence_breakdown, selected_models, model_used,
            overlays, intent, task_identified, mode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['id'], data['image_id'], data.get('pair_image_id'), data['query'], data.get('analysis_mode', 'vqa'),
        data['answer'], data['confidence'],
        json.dumps(data.get('detected_objects', [])),
        json.dumps(data.get('land_cover_stats', {})),
        json.dumps(data.get('visual_evidence', [])),
        json.dumps(data.get('spectral_metrics', {})),
        json.dumps(data.get('execution_trace', [])),
        json.dumps(data.get('key_findings', [])),
        json.dumps(data.get('confidence_breakdown', {})),
        json.dumps(data.get('selected_models', [])),
        data.get('model_used', 'SatQuery Agentic Ensemble'),
        json.dumps(data.get('overlays', [])),
        json.dumps(data.get('intent', {})),
        data.get('task_identified', 'Remote-Sensing VQA'),
        data.get('mode', 'demo')
    ))
    conn.commit()
    conn.close()

def get_analysis_history(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, i.filename, i.original_name, i.title as image_title
        FROM analyses a
        LEFT JOIN images i ON a.image_id = i.id
        ORDER BY a.created_at DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        try:
            d['detected_objects'] = json.loads(d.get('detected_objects') or '[]')
            d['land_cover_stats'] = json.loads(d.get('land_cover_stats') or '{}')
            d['visual_evidence'] = json.loads(d.get('visual_evidence') or '[]')
            d['spectral_metrics'] = json.loads(d.get('spectral_metrics') or '{}')
            d['execution_trace'] = json.loads(d.get('execution_trace') or '[]')
            d['key_findings'] = json.loads(d.get('key_findings') or '[]')
            d['confidence_breakdown'] = json.loads(d.get('confidence_breakdown') or '{}')
            d['selected_models'] = json.loads(d.get('selected_models') or '[]')
            d['overlays'] = json.loads(d.get('overlays') or '[]')
            d['intent'] = json.loads(d.get('intent') or '{}')
        except Exception:
            pass
        results.append(d)
    return results

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.*, i.filename, i.original_name, i.title as image_title
        FROM analyses a
        LEFT JOIN images i ON a.image_id = i.id
        WHERE a.id = ?
    """, (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    try:
        d['detected_objects'] = json.loads(d.get('detected_objects') or '[]')
        d['land_cover_stats'] = json.loads(d.get('land_cover_stats') or '{}')
        d['visual_evidence'] = json.loads(d.get('visual_evidence') or '[]')
        d['spectral_metrics'] = json.loads(d.get('spectral_metrics') or '{}')
        d['execution_trace'] = json.loads(d.get('execution_trace') or '[]')
        d['key_findings'] = json.loads(d.get('key_findings') or '[]')
        d['confidence_breakdown'] = json.loads(d.get('confidence_breakdown') or '{}')
        d['selected_models'] = json.loads(d.get('selected_models') or '[]')
        d['overlays'] = json.loads(d.get('overlays') or '[]')
        d['intent'] = json.loads(d.get('intent') or '{}')
    except Exception:
        pass
    return d

def delete_analysis(analysis_id: str) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def save_satellite_analysis(data: Dict[str, Any]):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO satellite_analyses (
            id, query, task_type, satellite, bbox, scene_id,
            acquisition_date, metrics, geojson, natural_language_summary, model_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data['id'],
        data['query'],
        data.get('task_type', 'land_cover_classification'),
        data.get('satellite', 'Sentinel-2'),
        json.dumps(data.get('bbox', [])),
        data.get('scene_metadata', {}).get('id') if isinstance(data.get('scene_metadata'), dict) else data.get('scene_id'),
        data.get('scene_metadata', {}).get('datetime') if isinstance(data.get('scene_metadata'), dict) else data.get('acquisition_date'),
        json.dumps(data.get('metrics', {})),
        json.dumps(data.get('geojson', {})),
        data.get('natural_language_summary', ''),
        data.get('model_info', {}).get('name', 'SatQuery PyTorch Model') if isinstance(data.get('model_info'), dict) else data.get('model_name', 'SatQuery PyTorch Model')
    ))
    conn.commit()
    conn.close()

def get_satellite_analyses(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM satellite_analyses ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        try:
            d['bbox'] = json.loads(d.get('bbox') or '[]')
            d['metrics'] = json.loads(d.get('metrics') or '{}')
            d['geojson'] = json.loads(d.get('geojson') or '{}')
        except Exception:
            pass
        results.append(d)
    return results

def get_satellite_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM satellite_analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    try:
        d['bbox'] = json.loads(d.get('bbox') or '[]')
        d['metrics'] = json.loads(d.get('metrics') or '{}')
        d['geojson'] = json.loads(d.get('geojson') or '{}')
    except Exception:
        pass
    return d

