import unittest
from datetime import datetime
from zoneinfo import ZoneInfo

from app.services.context import load_context
from app.services.datetime_resolver import resolve_visit_datetime
from app.services.inventory import get_vehicle, search_inventory


class ContextAndDateTests(unittest.TestCase):
    def test_inventory_loads_and_has_unique_ids(self) -> None:
        inventory = load_context().inventory
        self.assertEqual(len(inventory.vehicles), 9)
        self.assertEqual(len({item.id for item in inventory.vehicles}), 9)

    def test_automatic_sedans_under_15000(self) -> None:
        matches = search_inventory(
            max_price=15_000, body_type="sedan", transmission="Automatic"
        )
        self.assertEqual([item.id for item in matches], ["car-007", "car-002"])

    def test_salvage_title_is_present(self) -> None:
        vehicle = get_vehicle("car-001")
        self.assertIsNotNone(vehicle)
        self.assertEqual(vehicle.title_status, "salvage")

    def test_next_weekday_resolution(self) -> None:
        now = datetime(2026, 11, 6, 12, 0, tzinfo=ZoneInfo("America/Los_Angeles"))
        resolved = resolve_visit_datetime("Monday morning", now=now)
        self.assertIsNotNone(resolved)
        self.assertEqual(resolved.isoformat(), "2026-11-09T10:00:00-08:00")

    def test_past_same_day_rolls_to_next_week(self) -> None:
        now = datetime(2026, 11, 9, 12, 0, tzinfo=ZoneInfo("America/Los_Angeles"))
        resolved = resolve_visit_datetime("Monday at 10 AM", now=now)
        self.assertIsNotNone(resolved)
        self.assertEqual(resolved.date().isoformat(), "2026-11-16")

    def test_invalid_slot_is_not_confirmed(self) -> None:
        now = datetime(2026, 11, 6, 12, 0, tzinfo=ZoneInfo("America/Los_Angeles"))
        self.assertIsNone(resolve_visit_datetime("Monday at 8 AM", now=now))


if __name__ == "__main__":
    unittest.main()
