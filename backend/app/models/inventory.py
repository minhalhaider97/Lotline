from pydantic import BaseModel, ConfigDict, Field


class Vehicle(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    year: int
    make: str
    model: str
    trim: str | None = None
    body_type: str
    price_usd: int = Field(ge=0)
    mileage_miles: int | None = Field(default=None, ge=0)
    exterior_color: str
    interior_color: str
    fuel_type: str
    transmission: str | None = None
    vin: str | None = None
    vin_partial: str | None = None
    title_status: str | None = None
    features: list[str] = Field(default_factory=list)
    seller_notes: str
    availability: str

    @property
    def display_name(self) -> str:
        parts = [str(self.year), self.make, self.model]
        if self.trim:
            parts.append(self.trim)
        return " ".join(parts)


class InventoryCatalog(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dealership: str
    location: str
    data_source: str
    inventory_status: str
    notice: str
    vehicles: list[Vehicle]
