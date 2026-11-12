import re

from app.models.inventory import Vehicle
from app.services.context import load_context


def all_vehicles() -> list[Vehicle]:
    return list(load_context().inventory.vehicles)


def get_vehicle(vehicle_id: str) -> Vehicle | None:
    return next((item for item in all_vehicles() if item.id == vehicle_id), None)


def detect_vehicle(texts: list[str]) -> Vehicle | None:
    """Find one unambiguous vehicle, preferring the most recent text."""
    vehicles = all_vehicles()
    for raw_text in texts:
        text = raw_text.casefold()

        id_matches = [vehicle for vehicle in vehicles if vehicle.id.casefold() in text]
        if len(id_matches) == 1:
            return id_matches[0]

        full_matches = []
        for vehicle in vehicles:
            tokens = [str(vehicle.year), vehicle.make.casefold(), vehicle.model.casefold()]
            if all(token in text for token in tokens):
                full_matches.append(vehicle)
        if len(full_matches) == 1:
            return full_matches[0]

        model_matches = [
            vehicle
            for vehicle in vehicles
            if re.search(rf"\b{re.escape(vehicle.model.casefold())}\b", text)
        ]
        unique_models = {vehicle.model.casefold() for vehicle in model_matches}
        if len(model_matches) == 1 or len(unique_models) == 1 and len(model_matches) == 1:
            return model_matches[0]

        make_model_matches = [
            vehicle
            for vehicle in vehicles
            if vehicle.make.casefold() in text and vehicle.model.casefold() in text
        ]
        if len(make_model_matches) == 1:
            return make_model_matches[0]
    return None


def search_inventory(
    *,
    max_price: int | None = None,
    body_type: str | None = None,
    make: str | None = None,
    transmission: str | None = None,
    max_mileage: int | None = None,
    limit: int = 3,
) -> list[Vehicle]:
    matches = []
    for vehicle in all_vehicles():
        if vehicle.availability in {"sold", "unavailable"}:
            continue
        if max_price is not None and vehicle.price_usd > max_price:
            continue
        if body_type and body_type.casefold() not in vehicle.body_type.casefold():
            continue
        if make and make.casefold() != vehicle.make.casefold():
            continue
        if transmission and (
            not vehicle.transmission
            or transmission.casefold() != vehicle.transmission.casefold()
        ):
            continue
        if max_mileage is not None and (
            vehicle.mileage_miles is None or vehicle.mileage_miles > max_mileage
        ):
            continue
        matches.append(vehicle)
    return sorted(matches, key=lambda item: (item.price_usd, item.year), reverse=False)[:limit]
