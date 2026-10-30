"""
LUMINA AI – Streetlight Simulation Engine
==========================================
Simulates multiple streetlight nodes, each with:
  - Ambient light (lux)
  - PIR motion detection
  - Traffic density
  - Current and AI-recommended brightness
  - Power consumption estimates

All values are SOFTWARE-ONLY simulated estimates.
No physical hardware is connected.
"""

import random
import math
import time
from datetime import datetime
from dataclasses import dataclass, field
from typing import List


# ---------------------------------------------------------------------------
# Configuration constants
# ---------------------------------------------------------------------------
NUM_NODES = 8                # Number of simulated streetlight nodes
LAMP_WATTAGE_W = 100.0       # Assumed 100 W equivalent per node
MIN_NIGHT_BRIGHTNESS = 20    # Minimum brightness (%) allowed at night (safety)
MAX_BRIGHTNESS = 100         # Maximum brightness (%)
MOTION_BOOST = 30            # Extra brightness (%) added when motion is detected
TRAFFIC_HIGH_THRESHOLD = 0.7 # Traffic density fraction considered "high"
TRAFFIC_LOW_THRESHOLD = 0.3  # Traffic density fraction considered "low"


# ---------------------------------------------------------------------------
# Simulated node locations (fictional street addresses for a college demo)
# ---------------------------------------------------------------------------
NODE_LOCATIONS = [
    "Main Gate - Junction A",
    "Block B - Parking Entrance",
    "Library Road - Node 3",
    "Sports Complex - North",
    "Hostel Block - East Wing",
    "Admin Block - Roundabout",
    "Science Park - Path 7",
    "Canteen Road - Exit 2",
]


@dataclass
class StreetlightNode:
    """Represents a single simulated streetlight node."""

    node_id: str
    location: str
    ambient_lux: float = 0.0          # Simulated ambient light in lux
    motion_detected: bool = False      # Simulated PIR reading
    traffic_density: float = 0.0      # 0.0 = none  ...  1.0 = heavy
    current_brightness: float = 0.0   # Current brightness % (0-100)
    recommended_brightness: float = 0.0  # AI-recommended brightness %
    power_consumption_w: float = 0.0  # Estimated power draw in Watts
    status: str = "active"            # "active" | "fault" | "offline"
    last_updated: str = ""

    def to_dict(self) -> dict:
        return {
            "node_id": self.node_id,
            "location": self.location,
            "ambient_lux": round(self.ambient_lux, 2),
            "motion_detected": self.motion_detected,
            "traffic_density": round(self.traffic_density, 3),
            "current_brightness": round(self.current_brightness, 1),
            "recommended_brightness": round(self.recommended_brightness, 1),
            "power_consumption_w": round(self.power_consumption_w, 2),
            "status": self.status,
            "last_updated": self.last_updated,
        }


class StreetlightSimulator:
    """
    Manages the fleet of simulated streetlight nodes.
    Sensor values drift realistically with time-of-day patterns.
    """

    def __init__(self):
        self.nodes: List[StreetlightNode] = []
        self._init_nodes()

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------
    def _init_nodes(self):
        for i in range(NUM_NODES):
            node = StreetlightNode(
                node_id=f"SL-{i + 1:03d}",
                location=NODE_LOCATIONS[i % len(NODE_LOCATIONS)],
            )
            self.nodes.append(node)
        self.update_all()   # Populate with realistic initial values

    # ------------------------------------------------------------------
    # Sensor simulation helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _time_of_day_fraction() -> float:
        """
        Returns a float 0-1 representing how 'daytime-like' this moment is.
        1.0 = brightest midday, 0.0 = darkest midnight.
        """
        now = datetime.now()
        hour = now.hour + now.minute / 60.0
        # Simple sinusoidal model: peak at 12:00, trough at 00:00
        fraction = (math.sin(math.pi * (hour - 6) / 12) + 1) / 2
        return max(0.0, min(1.0, fraction))

    @staticmethod
    def _simulate_ambient_lux(tod: float) -> float:
        """
        tod (time-of-day fraction): 0 = night, 1 = full daylight.
        Adds random noise to make values look realistic.
        """
        # Full daylight ~100 000 lux, deep night ~0.001 lux
        base = tod * 80_000  # Simplified range for urban streetlight context
        noise = random.uniform(-500, 500)
        return max(0.0, base + noise)

    @staticmethod
    def _simulate_motion(tod: float) -> bool:
        """
        Pedestrian activity is higher at dusk/dawn and evening hours.
        Returns True / False with a plausible probability.
        """
        # Higher motion probability in the evening (tod approx 0.3-0.6)
        evening_factor = 1.0 - abs(tod - 0.4) * 2  # peaks around tod=0.4
        probability = max(0.05, min(0.8, evening_factor * 0.6))
        return random.random() < probability

    @staticmethod
    def _simulate_traffic(tod: float) -> float:
        """
        Traffic peaks during morning rush (tod approx 0.5) and evening rush (tod approx 0.6).
        Returns a fraction 0-1.
        """
        morning_rush = math.exp(-((tod - 0.5) ** 2) / 0.005)
        evening_rush = math.exp(-((tod - 0.65) ** 2) / 0.005)
        base = max(morning_rush, evening_rush)
        noise = random.uniform(-0.05, 0.05)
        return max(0.0, min(1.0, base + noise))

    # ------------------------------------------------------------------
    # Core update logic
    # ------------------------------------------------------------------
    def _compute_brightness(
        self,
        ambient_lux: float,
        motion: bool,
        traffic: float,
        recommended: float,
    ) -> float:
        """
        Applies safety and control rules on top of the AI recommendation.
        Rules:
          - Daytime (lux > 5000): override to 0 % (lights off)
          - Night baseline: MIN_NIGHT_BRIGHTNESS
          - Motion boost: +MOTION_BOOST %
          - Low traffic + no motion: reduce by 20 %
          - Clamp to [MIN_NIGHT_BRIGHTNESS, MAX_BRIGHTNESS] at night
        """
        is_daytime = ambient_lux > 5_000

        if is_daytime:
            return 0.0  # Streetlights off during bright daylight

        # Start from AI recommendation but enforce night floor
        brightness = max(MIN_NIGHT_BRIGHTNESS, recommended)

        # Motion boost
        if motion:
            brightness = min(MAX_BRIGHTNESS, brightness + MOTION_BOOST)

        # Dim when quiet
        if not motion and traffic < TRAFFIC_LOW_THRESHOLD:
            brightness = max(MIN_NIGHT_BRIGHTNESS, brightness - 20)

        return round(min(MAX_BRIGHTNESS, brightness), 1)

    def _estimate_power(self, brightness: float) -> float:
        """Proportional power estimate: 100 % brightness = LAMP_WATTAGE_W."""
        return round(LAMP_WATTAGE_W * (brightness / 100.0), 2)

    def update_all(self, ai_recommendations: dict = None):
        """
        Refresh simulated sensor values for every node.
        If ai_recommendations dict is supplied (keyed by node_id),
        those brightness values are used; otherwise a simple heuristic is used.
        """
        tod = self._time_of_day_fraction()
        ts = datetime.now().isoformat(timespec="seconds")

        for node in self.nodes:
            node.ambient_lux = self._simulate_ambient_lux(tod)
            node.motion_detected = self._simulate_motion(tod)
            node.traffic_density = self._simulate_traffic(tod)

            # AI recommendation (or simple rule if model not ready yet)
            if ai_recommendations and node.node_id in ai_recommendations:
                rec = float(ai_recommendations[node.node_id])
            else:
                # Heuristic fallback while the model warms up
                rec = 80.0 if tod < 0.3 else (40.0 if tod > 0.7 else 60.0)

            node.recommended_brightness = round(rec, 1)
            node.current_brightness = self._compute_brightness(
                node.ambient_lux, node.motion_detected, node.traffic_density, rec
            )
            node.power_consumption_w = self._estimate_power(node.current_brightness)
            node.last_updated = ts

    # ------------------------------------------------------------------
    # Accessors
    # ------------------------------------------------------------------
    def get_all_nodes(self) -> List[dict]:
        return [n.to_dict() for n in self.nodes]

    def get_node(self, node_id: str):
        for n in self.nodes:
            if n.node_id == node_id:
                return n.to_dict()
        return None

    def get_sensor_readings(self) -> dict:
        """Aggregate sensor snapshot across all nodes."""
        lux_values = [n.ambient_lux for n in self.nodes]
        motion_count = sum(1 for n in self.nodes if n.motion_detected)
        traffic_avg = sum(n.traffic_density for n in self.nodes) / len(self.nodes)
        return {
            "avg_ambient_lux": round(sum(lux_values) / len(lux_values), 2),
            "max_ambient_lux": round(max(lux_values), 2),
            "min_ambient_lux": round(min(lux_values), 2),
            "motion_detected_count": motion_count,
            "avg_traffic_density": round(traffic_avg, 3),
            "timestamp": datetime.now().isoformat(timespec="seconds"),
        }

    def get_energy_stats(self) -> dict:
        """
        Returns energy consumption statistics.
        All values are SIMULATED ESTIMATES based on assumed 100 W lamps.
        """
        current_power_w = sum(n.power_consumption_w for n in self.nodes)
        baseline_power_w = LAMP_WATTAGE_W * NUM_NODES  # all at 100 %

        # Energy per simulated hour
        current_energy_kwh = current_power_w / 1000.0
        baseline_energy_kwh = baseline_power_w / 1000.0
        saved_energy_kwh = baseline_energy_kwh - current_energy_kwh
        savings_pct = (saved_energy_kwh / baseline_energy_kwh * 100) if baseline_energy_kwh > 0 else 0

        active_nodes = sum(1 for n in self.nodes if n.current_brightness > 0)

        return {
            "total_nodes": NUM_NODES,
            "active_nodes": active_nodes,
            "current_power_w": round(current_power_w, 2),
            "baseline_power_w": round(baseline_power_w, 2),
            "current_energy_kwh_per_hour": round(current_energy_kwh, 4),
            "baseline_energy_kwh_per_hour": round(baseline_energy_kwh, 4),
            "saved_energy_kwh_per_hour": round(saved_energy_kwh, 4),
            "savings_percentage": round(savings_pct, 2),
            "note": "Simulated estimates only. Assumes 100 W equivalent lamp per node.",
            "timestamp": datetime.now().isoformat(timespec="seconds"),
        }

    def get_feature_vectors(self) -> list:
        """
        Returns a list of feature dicts suitable for the ML model to predict on.
        """
        tod = self._time_of_day_fraction()
        hour = datetime.now().hour
        vectors = []
        for node in self.nodes:
            vectors.append({
                "node_id": node.node_id,
                "ambient_lux": node.ambient_lux,
                "motion_detected": int(node.motion_detected),
                "traffic_density": node.traffic_density,
                "hour_of_day": hour,
                "time_of_day_fraction": round(tod, 4),
            })
        return vectors


# ---------------------------------------------------------------------------
# Singleton instance shared across the application
# ---------------------------------------------------------------------------
simulator = StreetlightSimulator()
