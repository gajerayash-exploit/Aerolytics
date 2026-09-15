"""YOLO model registry: lazy, thread-safe loading and in-memory prediction."""
import io
import threading
import time

from PIL import Image

from . import config

_models: dict = {}
_lock = threading.Lock()


class ModelUnavailable(RuntimeError):
    pass


def get_model(pillar: str):
    if pillar in _models:
        return _models[pillar]
    with _lock:
        if pillar not in _models:
            path = config.WEIGHTS_DIR / config.PILLAR_WEIGHTS[pillar]
            if not path.exists():
                raise ModelUnavailable(f"Weights not found: {path.name}")
            from ultralytics import YOLO  # heavy import, deferred

            _models[pillar] = YOLO(str(path))
    return _models[pillar]


def model_info() -> list[dict]:
    out = []
    for pillar, filename in config.PILLAR_WEIGHTS.items():
        path = config.WEIGHTS_DIR / filename
        entry = {
            "pillar": pillar,
            "weights": filename,
            "available": path.exists(),
            "loaded": pillar in _models,
            "size_bytes": path.stat().st_size if path.exists() else None,
        }
        if pillar in _models:
            entry["classes"] = list(_models[pillar].names.values())
        out.append(entry)
    return out


def decode_image(data: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(data))
    img.load()
    return img.convert("RGB")


def predict(pillar: str, img: Image.Image, conf: float | None = None) -> dict:
    model = get_model(pillar)
    start = time.perf_counter()
    result = model.predict(
        source=img,
        conf=config.CONF_THRESHOLD if conf is None else conf,
        iou=config.IOU_THRESHOLD,
        imgsz=config.IMG_SIZE,
        device=config.DEVICE,
        verbose=False,
    )[0]
    elapsed_ms = (time.perf_counter() - start) * 1000

    detections = []
    for box in result.boxes:
        cls_id = int(box.cls[0].item())
        detections.append({
            "class": model.names[cls_id],
            "confidence": round(float(box.conf[0].item()), 3),
            "bbox_xyxy": [round(float(c), 2) for c in box.xyxy[0].tolist()],
        })
    detections.sort(key=lambda d: d["confidence"], reverse=True)
    return {"detections": detections, "inference_time_ms": round(elapsed_ms, 2)}
