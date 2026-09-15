"""API tests. Uses the real weights in models/weights (skipped when ultralytics is missing)."""
import io
import os

os.environ.setdefault("AERO_PRELOAD", "0")

import pytest
from fastapi.testclient import TestClient
from PIL import Image

pytest.importorskip("ultralytics")
from app.main import app  # noqa: E402

client = TestClient(app)


def _jpeg(color=(40, 90, 160), size=(640, 480)):
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, "JPEG")
    return buf.getvalue()


def test_health_lists_all_models():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    pillars = {m["pillar"]: m for m in r.json()["models"]}
    assert set(pillars) == {"energy", "agri", "rescue"}
    assert all(m["available"] for m in pillars.values())


@pytest.mark.parametrize("pillar", ["energy", "agri", "rescue"])
def test_infer_returns_contract(pillar):
    r = client.post(f"/api/v1/infer/{pillar}", files={"file": ("solar_01.jpg", _jpeg(), "image/jpeg")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["pillar"] == pillar
    assert body["image"] == {"width": 640, "height": 480}
    assert body["telemetry"]["source"] == "manifest"
    assert body["inference_time_ms"] > 0
    for d in body["detections"]:
        assert set(d) == {"class", "confidence", "bbox_xyxy"} and len(d["bbox_xyxy"]) == 4


def test_unknown_pillar_rejected():
    r = client.post("/api/v1/infer/space", files={"file": ("a.jpg", _jpeg(), "image/jpeg")})
    assert r.status_code == 422


def test_non_image_rejected():
    r = client.post("/api/v1/infer/energy", files={"file": ("a.txt", b"hello", "text/plain")})
    assert r.status_code == 415


def test_corrupt_image_rejected():
    r = client.post("/api/v1/infer/energy", files={"file": ("a.jpg", b"not a jpeg", "image/jpeg")})
    assert r.status_code == 400


def test_path_in_filename_is_stripped():
    r = client.post("/api/v1/infer/rescue", files={"file": ("../../evil.jpg", _jpeg(), "image/jpeg")})
    assert r.status_code == 200 and r.json()["filename"] == "evil.jpg"


def test_simulated_telemetry_is_stable():
    a = client.post("/api/v1/infer/agri", files={"file": ("x.jpg", _jpeg(), "image/jpeg")}).json()
    b = client.post("/api/v1/infer/agri", files={"file": ("x.jpg", _jpeg(), "image/jpeg")}).json()
    assert a["telemetry"] == b["telemetry"] and a["telemetry"]["source"] == "simulated"
