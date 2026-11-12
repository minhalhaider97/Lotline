import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from app.models.inventory import InventoryCatalog


DATA_DIR = Path(__file__).resolve().parents[2] / "data"


@dataclass(frozen=True)
class DealershipContext:
    inventory: InventoryCatalog
    policy_markdown: str


@lru_cache(maxsize=1)
def load_context() -> DealershipContext:
    inventory_path = DATA_DIR / "inventory.json"
    policy_path = DATA_DIR / "dealership.md"

    inventory_data = json.loads(inventory_path.read_text(encoding="utf-8"))
    inventory = InventoryCatalog.model_validate(inventory_data)
    policy = policy_path.read_text(encoding="utf-8").strip()
    if not policy:
        raise ValueError("Dealership policy is empty")

    ids = [vehicle.id for vehicle in inventory.vehicles]
    if len(ids) != len(set(ids)):
        raise ValueError("Inventory contains duplicate vehicle IDs")

    return DealershipContext(inventory=inventory, policy_markdown=policy)


def inventory_prompt_json() -> str:
    context = load_context()
    payload = [vehicle.model_dump(mode="json") for vehicle in context.inventory.vehicles]
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
