"""Core data models for the PaintPro Estimator."""

from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class BusinessProfile:
    """Represents the business level defaults and contact information."""

    name: str
    owner: str
    phone: str
    email: str
    address: str
    website: Optional[str] = None
    logo_path: Optional[str] = None
    labor_rate: float = 55.0
    productivity_rate_sqft_per_hour: float = 350.0
    paint_coverage_sqft_per_gallon: float = 375.0
    paint_cost_per_gallon: float = 48.0
    overhead_percent: float = 10.0
    profit_percent: float = 15.0

    def serialize(self) -> Dict:
        data = asdict(self)
        return data

    @staticmethod
    def from_dict(data: Dict) -> "BusinessProfile":
        return BusinessProfile(**data)


@dataclass
class ClientProfile:
    name: str
    project_address: str
    phone: str
    email: str

    def serialize(self) -> Dict:
        return asdict(self)


@dataclass
class JobScope:
    project_type: str
    rooms: List[str]
    surfaces: List[str]
    prep_level: str
    coats: int
    height_level: str
    surface_condition: str
    color_change: str
    description: str

    def serialize(self) -> Dict:
        return asdict(self)

    @property
    def difficulty_multiplier(self) -> float:
        height_multiplier = {
            "8ft": 1.0,
            "10ft": 1.05,
            "12ft+": 1.1,
            "20ft+": 1.25,
        }.get(self.height_level, 1.0)

        prep_multiplier = {
            "basic": 1.0,
            "standard": 1.05,
            "premium": 1.15,
        }.get(self.prep_level, 1.0)

        condition_multiplier = {
            "clean": 1.0,
            "dirty": 1.08,
            "peeling": 1.15,
            "stained": 1.12,
        }.get(self.surface_condition, 1.0)

        color_multiplier = {
            "same color": 1.0,
            "minor change": 1.04,
            "dark-to-light": 1.1,
        }.get(self.color_change, 1.0)

        return height_multiplier * prep_multiplier * condition_multiplier * color_multiplier


@dataclass
class EstimateMeta:
    number: str
    date: str

    @staticmethod
    def auto(number_prefix: str = "EST") -> "EstimateMeta":
        now = datetime.now()
        return EstimateMeta(
            number=f"{number_prefix}-{now.strftime('%Y%m%d%H%M%S')}",
            date=now.strftime("%Y-%m-%d"),
        )


@dataclass
class LaborInputs:
    area_sqft: float
    productivity_rate: Optional[float] = None
    labor_rate: Optional[float] = None
    difficulty_override: Optional[float] = None
    painters: int = 1

    def serialize(self) -> Dict:
        return asdict(self)


@dataclass
class MaterialInputs:
    area_sqft: float
    coats: Optional[int] = None
    coverage_rate: Optional[float] = None
    cost_per_gallon: Optional[float] = None
    markup_percent: float = 10.0

    def serialize(self) -> Dict:
        return asdict(self)


@dataclass
class EquipmentLine:
    label: str
    daily_cost: float
    days: int = 1

    def total(self) -> float:
        return self.daily_cost * self.days

    def serialize(self) -> Dict:
        data = asdict(self)
        data["total"] = self.total()
        return data


@dataclass
class EstimateResult:
    business: BusinessProfile
    client: ClientProfile
    job_scope: JobScope
    estimate: EstimateMeta
    labor_inputs: LaborInputs
    material_inputs: MaterialInputs
    equipment: List[EquipmentLine]
    overhead_percent: float
    profit_percent: float
    labor_total: float
    labor_hours: float
    materials_total: float
    materials_gallons: float
    equipment_total: float
    overhead_total: float
    profit_total: float
    grand_total: float

    def serialize(self) -> Dict:
        return {
            "business": self.business.serialize(),
            "client": self.client.serialize(),
            "job_scope": self.job_scope.serialize(),
            "estimate": asdict(self.estimate),
            "labor": {
                **self.labor_inputs.serialize(),
                "hours": round(self.labor_hours, 2),
                "total": round(self.labor_total, 2),
            },
            "materials": {
                **self.material_inputs.serialize(),
                "gallons": round(self.materials_gallons, 2),
                "total": round(self.materials_total, 2),
            },
            "equipment": [line.serialize() for line in self.equipment],
            "equipment_total": round(self.equipment_total, 2),
            "overhead_percent": self.overhead_percent,
            "overhead_total": round(self.overhead_total, 2),
            "profit_percent": self.profit_percent,
            "profit_total": round(self.profit_total, 2),
            "grand_total": round(self.grand_total, 2),
        }

    def save_summary(self, output_dir: Path) -> Path:
        output_dir.mkdir(parents=True, exist_ok=True)
        path = output_dir / f"estimate_{self.estimate.number}.json"
        import json

        with path.open("w", encoding="utf-8") as fh:
            json.dump(self.serialize(), fh, indent=2)
        return path
