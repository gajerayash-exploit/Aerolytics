# Aerolytics API (FastAPI + YOLOv8)

```
backend/
  main.py            entry point kept for `uvicorn main:app`
  app/
    main.py          routes, validation, CORS, model preload
    inference.py     lazy thread-safe model registry, in-memory prediction
    telemetry.py     golden-demo manifest, deterministic simulated fallback
    config.py        AERO_* environment settings
  tests/test_api.py  API contract tests against the real weights
```

## Setup (Windows, NVIDIA GPU)

```bash
python -m venv .venv
.venv\Scripts\python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu126
.venv\Scripts\python -m pip install -r requirements-dev.txt
```

## Run

```bash
.venv\Scripts\python -m uvicorn main:app --port 8000
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/health` | status and per-model availability |
| GET | `/api/v1/models` | weights, loaded state, classes |
| POST | `/api/v1/infer/{energy\|agri\|rescue}` | multipart `file` (+ optional `?conf=`) → detections |

Inference response:

```json
{
  "pillar": "rescue", "filename": "thermal_01.jpg",
  "image": {"width": 640, "height": 512},
  "telemetry": {"lat": 22.31, "lng": 70.81, "alt": 35.0, "heading": 45.0, "source": "manifest"},
  "detections": [{"class": "person", "confidence": 0.91, "bbox_xyxy": [x1, y1, x2, y2]}],
  "inference_time_ms": 12.4
}
```

`telemetry.source` is `manifest` for golden-demo filenames and `simulated` otherwise.

## Settings

| Variable | Default | |
|---|---|---|
| `AERO_CONF` | `0.25` | confidence threshold |
| `AERO_IOU` | `0.5` | NMS IoU |
| `AERO_DEVICE` | auto | e.g. `cpu`, `0` |
| `AERO_MAX_UPLOAD_MB` | `25` | upload limit |
| `AERO_CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | allowed frontends |
| `AERO_PRELOAD` | `1` | load all models at startup |

## Tests

```bash
.venv\Scripts\python -m pytest -q
```

## Models

`models/evaluate.py` scores the deployed weights on each test split and writes `models/metrics.json`.
`models/train.py <pillar>` fine-tunes and replaces the weights only when test mAP50-95 improves.
