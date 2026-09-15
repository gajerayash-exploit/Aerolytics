"""Fine-tune a pillar model and deploy it only if it beats the current weights on the test split.

    python models/train.py energy --epochs 60
    python models/train.py agri --epochs 50 --model yolov8s.pt --batch 8

Sized for a 4 GB GPU (batch 8-16 at 640 px). Training resumes from the deployed weights by default,
so extra epochs build on the existing model instead of starting from COCO.
"""
import argparse
import json
import shutil
from pathlib import Path

from ultralytics import YOLO

from evaluate import PILLARS, ROOT, data_yaml, evaluate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pillar", choices=list(PILLARS))
    ap.add_argument("--epochs", type=int, default=50)
    ap.add_argument("--batch", type=int, default=16)
    ap.add_argument("--imgsz", type=int, default=640)
    ap.add_argument("--model", default=None, help="start weights (default: deployed weights)")
    ap.add_argument("--patience", type=int, default=15)
    args = ap.parse_args()

    dataset, weights = PILLARS[args.pillar]
    deployed = ROOT / "weights" / weights
    start = args.model or str(deployed)

    before = evaluate(args.pillar)
    print("current test metrics:", json.dumps(before))

    model = YOLO(start)
    model.train(
        data=str(data_yaml(dataset)),
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        patience=args.patience,
        cos_lr=True,
        close_mosaic=10,
        project=str(ROOT / "training" / dataset / "runs"),
        name=f"retrain-{args.pillar}",
        exist_ok=True,
        workers=2,
        plots=True,
    )
    best = Path(model.trainer.best)

    candidate = YOLO(str(best))
    res = candidate.val(data=str(data_yaml(dataset)), split="test", imgsz=args.imgsz, batch=8, plots=False, verbose=False)
    after = {"mAP50": round(float(res.box.map50), 3), "mAP50_95": round(float(res.box.map), 3)}
    print("candidate test metrics:", json.dumps(after))

    if after["mAP50_95"] > before["mAP50_95"]:
        backup = deployed.with_suffix(".prev.pt")
        shutil.copy2(deployed, backup)
        shutil.copy2(best, deployed)
        print(f"deployed new weights ({before['mAP50_95']} -> {after['mAP50_95']} mAP50-95); previous saved as {backup.name}")
        # refresh metrics.json for the deployed model
        path = ROOT / "metrics.json"
        metrics = json.loads(path.read_text()) if path.exists() else {}
        metrics[args.pillar] = evaluate(args.pillar)
        path.write_text(json.dumps(metrics, indent=2))
    else:
        print("kept the current weights: candidate did not improve mAP50-95 on the test split")


if __name__ == "__main__":
    main()
