import os
import base64
import json
from typing import Dict, Any, Optional
from backend.ai.interfaces import BaseVisionLanguageModel
from backend.db.models import AnalysisResult, QueryRequest, BoundingBox, LandCoverStats, SpectralMetrics, VisualEvidence
from backend.ai.rs_engine import RemoteSensingEngine

class GeminiVLMAdapter(BaseVisionLanguageModel):
    """Google Gemini Vision multimodal remote-sensing adapter."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.fallback_engine = RemoteSensingEngine()
        
    async def analyze(
        self,
        image_path: str,
        image_metadata: Dict[str, Any],
        request: QueryRequest
    ) -> AnalysisResult:
        if not self.api_key:
            # Fall back to RS Engine gracefully with explanatory note
            res = await self.fallback_engine.analyze(image_path, image_metadata, request)
            res.model_used = "RS-VLM Core (Gemini API key not configured - local engine engaged)"
            return res
        
        try:
            import httpx
            # Encode image to base64
            with open(image_path, "rb") as f:
                img_bytes = f.read()
                b64_data = base64.b64encode(img_bytes).decode("utf-8")
                
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            prompt = (
                f"You are SATQUERY AI, an expert Remote Sensing and Geospatial Intelligence Vision-Language Model. "
                f"Analyze this satellite image and answer the user query: '{request.query}'. "
                f"Provide your answer in clear, expert remote-sensing terminology."
            )
            payload = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": "image/jpeg", "data": b64_data}}
                    ]
                }]
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    base_res = await self.fallback_engine.analyze(image_path, image_metadata, request)
                    base_res.answer = raw_text
                    base_res.confidence = 0.97
                    base_res.model_used = "Google Gemini 1.5 Flash (Vision)"
                    return base_res
                else:
                    res = await self.fallback_engine.analyze(image_path, image_metadata, request)
                    res.model_used = f"RS-VLM Engine (Gemini fallback: HTTP {resp.status_code})"
                    return res
        except Exception as e:
            res = await self.fallback_engine.analyze(image_path, image_metadata, request)
            res.model_used = f"RS-VLM Engine (Gemini fallback: {str(e)[:40]})"
            return res

class OpenAIVLMAdapter(BaseVisionLanguageModel):
    """OpenAI GPT-4o / GPT-4 Vision multimodal adapter."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.fallback_engine = RemoteSensingEngine()
        
    async def analyze(
        self,
        image_path: str,
        image_metadata: Dict[str, Any],
        request: QueryRequest
    ) -> AnalysisResult:
        if not self.api_key:
            res = await self.fallback_engine.analyze(image_path, image_metadata, request)
            res.model_used = "RS-VLM Core (OpenAI API key not configured - local engine engaged)"
            return res
            
        try:
            import httpx
            with open(image_path, "rb") as f:
                img_bytes = f.read()
                b64_data = base64.b64encode(img_bytes).decode("utf-8")
                
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": f"You are SATQUERY AI, a remote sensing vision-language model. Query: '{request.query}'"},
                            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_data}"}}
                        ]
                    }
                ],
                "max_tokens": 500
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    answer_text = data["choices"][0]["message"]["content"]
                    base_res = await self.fallback_engine.analyze(image_path, image_metadata, request)
                    base_res.answer = answer_text
                    base_res.confidence = 0.98
                    base_res.model_used = "OpenAI GPT-4o-mini (Vision)"
                    return base_res
                else:
                    res = await self.fallback_engine.analyze(image_path, image_metadata, request)
                    res.model_used = f"RS-VLM Engine (OpenAI fallback: HTTP {resp.status_code})"
                    return res
        except Exception as e:
            res = await self.fallback_engine.analyze(image_path, image_metadata, request)
            res.model_used = f"RS-VLM Engine (OpenAI fallback: {str(e)[:40]})"
            return res
