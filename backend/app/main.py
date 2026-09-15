"""Aerolytics inference API."""
import logging
from contextlib import asynccontextmanager
from pathlib import PurePath
from typing import Literal

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel

from . import config, inference
from .telemetry import get_telemetry

log = logging.getLogger("aerolytics")
Pillar = Literal["energy", "agri", "rescue"]


class Telemetry(BaseModel):
    lat: float
    lng: float
    alt: float
    heading: float
    source: Literal["manifest", "simulated"]


class InferenceResponse(BaseModel):
    pillar: Pillar
    filename: str
    image: dict
    telemetry: Telemetry
    detections: list[dict]
    inference_time_ms: float


@asynccontextmanager
async def lifespan(app: FastAPI):
    if config.PRELOAD_MODELS:
        for pillar in config.PILLAR_WEIGHTS:
            try:
                await run_in_threadpool(inference.get_model, pillar)
                log.info("loaded %s model", pillar)
            except inference.ModelUnavailable as e:
                log.warning("%s", e)
    yield


app = FastAPI(title="Aerolytics API", version="1.1", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "models": inference.model_info()}


@app.get("/api/v1/models")
def models():
    return inference.model_info()


@app.post("/api/v1/infer/{pillar}", response_model=InferenceResponse)
async def infer_pillar(
    pillar: Pillar,
    file: UploadFile = File(...),
    conf: float | None = Query(None, ge=0.01, le=0.99),
):
    if file.content_type not in config.ALLOWED_TYPES:
        raise HTTPException(415, f"Unsupported file type: {file.content_type}")
    data = await file.read(int(config.MAX_UPLOAD_MB * 1024 * 1024) + 1)
    if len(data) > config.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"File larger than {config.MAX_UPLOAD_MB:g} MB")
    if not data:
        raise HTTPException(400, "Empty file")

    try:
        img = inference.decode_image(data)
    except Exception:
        raise HTTPException(400, "File is not a readable image")

    try:
        result = await run_in_threadpool(inference.predict, pillar, img, conf)
    except inference.ModelUnavailable as e:
        raise HTTPException(503, str(e))

    filename = PurePath(file.filename or "upload").name  # never trust client paths
    return {
        "pillar": pillar,
        "filename": filename,
        "image": {"width": img.width, "height": img.height},
        "telemetry": get_telemetry(filename),
        **result,
    }
