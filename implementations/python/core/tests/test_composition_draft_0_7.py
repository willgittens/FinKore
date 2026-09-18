# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[4]
SCENARIOS = ROOT / "examples" / "composition" / "draft-0.7" / "scenarios.json"
PROFILES = ROOT / "implementations" / "python" / "examples" / "composition" / "draft-0.7" / "profiles.py"


def load_profiles():
    spec = importlib.util.spec_from_file_location("draft_0_7_profiles", PROFILES)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load Draft 0.7 Python composition profiles")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class CompositionDraft07Tests(unittest.TestCase):
    def test_shared_scenarios_match_expected_observations(self) -> None:
        profiles = load_profiles()
        fixture = json.loads(SCENARIOS.read_text(encoding="utf-8"))
        self.assertEqual(20, len(fixture["scenarios"]))
        for scenario in fixture["scenarios"]:
            with self.subTest(scenario=scenario["id"]):
                actual = profiles.run_scenario(scenario["id"])
                for key, value in scenario["expectedObservation"].items():
                    self.assertEqual(value, actual.get(key), key)


if __name__ == "__main__":
    unittest.main()
