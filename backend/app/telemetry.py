"""Flight telemetry for uploaded frames: golden-demo manifest, else a simulated position."""
import random

# Fixed telemetry for Golden Demo assets (Rajkot, Gujarat: 22.3°N, 70.8°E)
GOLDEN_DEMO_MANIFEST = {
    # Energy Pillar - Lawnmower grid over solar array
    "solar_01.jpg": {"lat": 22.30010, "lng": 70.80010, "alt": 45.0, "heading": 90.0},
    "solar_02.jpg": {"lat": 22.30010, "lng": 70.80020, "alt": 45.0, "heading": 90.0},
    "solar_03.jpg": {"lat": 22.30010, "lng": 70.80030, "alt": 45.0, "heading": 90.0},
    "solar_04.jpg": {"lat": 22.30002, "lng": 70.80030, "alt": 45.0, "heading": 270.0},
    "solar_05.jpg": {"lat": 22.30002, "lng": 70.80020, "alt": 45.0, "heading": 270.0},
    # Agri Pillar - Multispectral crop sweep
    "agri_01.jpg": {"lat": 22.30500, "lng": 70.80500, "alt": 60.0, "heading": 0.0},
    "agri_02.jpg": {"lat": 22.30510, "lng": 70.80500, "alt": 60.0, "heading": 0.0},
    # Rescue Pillar - Thermal perimeter sweep
    "thermal_01.jpg": {"lat": 22.31000, "lng": 70.81000, "alt": 35.0, "heading": 45.0},
    "thermal_02.jpg": {"lat": 22.31010, "lng": 70.81010, "alt": 35.0, "heading": 45.0},
}


def get_telemetry(filename: str) -> dict:
    """Manifest telemetry when the filename is known; otherwise a simulated offset around Rajkot."""
    if filename in GOLDEN_DEMO_MANIFEST:
        return {**GOLDEN_DEMO_MANIFEST[filename], "source": "manifest"}
    rng = random.Random(filename)  # same file -> same simulated position
    return {
        "lat": round(22.3000 + rng.uniform(-0.005, 0.005), 6),
        "lng": round(70.8000 + rng.uniform(-0.005, 0.005), 6),
        "alt": round(rng.uniform(30.0, 70.0), 1),
        "heading": round(rng.uniform(0.0, 360.0), 1),
        "source": "simulated",
    }
