"""Runtime settings, overridable through AERO_* environment variables."""
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def _env_list(name: str, default: str) -> list[str]:
    return [v.strip() for v in os.getenv(name, default).split(",") if v.strip()]


WEIGHTS_DIR = Path(os.getenv("AERO_WEIGHTS_DIR", REPO_ROOT / "models" / "weights"))

# pillar -> weights file
PILLAR_WEIGHTS = {
    "energy": "solar_best.pt",
    "agri": "agri_best.pt",
    "rescue": "thermal_best.pt",
}

CONF_THRESHOLD = float(os.getenv("AERO_CONF", "0.25"))
IOU_THRESHOLD = float(os.getenv("AERO_IOU", "0.5"))
IMG_SIZE = int(os.getenv("AERO_IMGSZ", "640"))
DEVICE = os.getenv("AERO_DEVICE") or None  # None lets ultralytics pick cuda:0 when available
MAX_UPLOAD_MB = float(os.getenv("AERO_MAX_UPLOAD_MB", "25"))
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
CORS_ORIGINS = _env_list("AERO_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
# Load all models at startup (slower boot, no first-request latency). Tests turn this off.
PRELOAD_MODELS = os.getenv("AERO_PRELOAD", "1") == "1"
