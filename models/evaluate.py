"""Evaluate deployed weights on each dataset's held-out test split.

    python models/evaluate.py            # all pillars
    python models/evaluate.py energy     # one pillar
Writes models/metrics.json (read by the backend's /api/v1/models endpoint).
"""
import json
import sys
from pathlib import Path

from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent
PILLARS = {
    "energy": ("energy-solar", "solar_best.pt"),
    "agri": ("agri-crop-disease", "agri_best.pt"),
    "rescue": ("rescue-thermal", "thermal_best.pt"),
}


def data_yaml(dataset: str) -> Path:
    """Write an absolute-path copy of data.yaml so evaluation works from any cwd."""
    src = ROOT / "training" / dataset
    names = None
    for line in (src / "data.yaml").read_text().splitlines():
        if line.startswith("names:"):
            names = line.split(":", 1)[1].strip()
    out = src / "data.abs.yaml"
    out.write_text(
        f"path: {src.as_posix()}\ntrain: train/images\nval: valid/images\ntest: test/images\nnames: {names}\n"
    )
    return out


def evaluate(pillar: str) -> dict:
    dataset, weights = PILLARS[pillar]
    model = YOLO(str(ROOT / "weights" / weights))
    res = model.val(data=str(data_yaml(dataset)), split="test", imgsz=640, batch=8, plots=False, verbose=False)
    per_class = {model.names[int(c)]: round(float(res.box.maps[i]), 3) for i, c in enumerate(res.box.ap_class_index)}
    return {
        "weights": weights,
        "split": "test",
        "mAP50": round(float(res.box.map50), 3),
        "mAP50_95": round(float(res.box.map), 3),
        "precision": round(float(res.box.mp), 3),
        "recall": round(float(res.box.mr), 3),
        "per_class_mAP50_95": per_class,
    }


if __name__ == "__main__":
    targets = sys.argv[1:] or list(PILLARS)
    path = ROOT / "metrics.json"
    metrics = json.loads(path.read_text()) if path.exists() else {}
    for p in targets:
        metrics[p] = evaluate(p)
        print(p, json.dumps(metrics[p]))
    path.write_text(json.dumps(metrics, indent=2))
