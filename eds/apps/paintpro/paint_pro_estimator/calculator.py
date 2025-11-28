"""Estimation logic for PaintPro."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable, Tuple

from .models import (
    BusinessProfile,
    ClientProfile,
    EquipmentLine,
    EstimateMeta,
    EstimateResult,
    JobScope,
    LaborInputs,
    MaterialInputs,
)


def _load_business(path: Path) -> BusinessProfile:
    import json

    with path.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    return BusinessProfile.from_dict(data)


def _load_job(path: Path) -> Dict:
    import json

    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def load_records(business_path: Path, job_path: Path) -> Tuple[BusinessProfile, Dict]:
    return _load_business(business_path), _load_job(job_path)


def _parse_client(data: Dict) -> ClientProfile:
    return ClientProfile(
        name=data["name"],
        project_address=data["project_address"],
        phone=data["phone"],
        email=data["email"],
    )


def _parse_scope(data: Dict) -> JobScope:
    return JobScope(
        project_type=data.get("project_type", "Interior"),
        rooms=data.get("rooms", []),
        surfaces=data.get("surfaces", []),
        prep_level=data.get("prep_level", "standard"),
        coats=data.get("coats", 2),
        height_level=data.get("height_level", "8ft"),
        surface_condition=data.get("surface_condition", "clean"),
        color_change=data.get("color_change", "same color"),
        description=data.get("description", ""),
    )


def _parse_labor(data: Dict, business: BusinessProfile, scope: JobScope) -> Tuple[LaborInputs, float, float]:
    labor = LaborInputs(
        area_sqft=data.get("area_sqft", 0),
        productivity_rate=data.get("productivity_rate"),
        labor_rate=data.get("labor_rate"),
        difficulty_override=data.get("difficulty_multiplier"),
        painters=data.get("painters", 1),
    )
    productivity = labor.productivity_rate or business.productivity_rate_sqft_per_hour
    labor_rate = labor.labor_rate or business.labor_rate
    difficulty = labor.difficulty_override or scope.difficulty_multiplier
    base_hours = labor.area_sqft / max(productivity, 1)
    base_hours *= difficulty
    base_hours = max(base_hours, 0)
    hours = base_hours / max(labor.painters, 1)
    labor_total = hours * labor_rate * max(labor.painters, 1)
    return labor, hours, labor_total


def _parse_materials(data: Dict, business: BusinessProfile, scope: JobScope) -> Tuple[MaterialInputs, float, float]:
    mats = MaterialInputs(
        area_sqft=data.get("area_sqft", 0),
        coats=data.get("coats"),
        coverage_rate=data.get("coverage_rate"),
        cost_per_gallon=data.get("cost_per_gallon"),
        markup_percent=data.get("markup_percent", 10.0),
    )
    coats = mats.coats or scope.coats
    coverage = mats.coverage_rate or business.paint_coverage_sqft_per_gallon
    gallons = (mats.area_sqft * max(coats, 1)) / max(coverage, 1)
    cost_per_gallon = mats.cost_per_gallon or business.paint_cost_per_gallon
    raw_cost = gallons * cost_per_gallon
    total = raw_cost * (1 + mats.markup_percent / 100)
    return mats, gallons, total


def _parse_equipment(data: Iterable[Dict]) -> Tuple[Tuple[EquipmentLine, ...], float]:
    equipment = tuple(
        EquipmentLine(
            label=item["label"],
            daily_cost=item.get("daily_cost", 0),
            days=item.get("days", 1),
        )
        for item in data
    )
    total = sum(item.total() for item in equipment)
    return equipment, total


def build_estimate(
    business: BusinessProfile,
    job_data: Dict,
    *,
    estimate_number_prefix: str = "EST",
) -> EstimateResult:
    client = _parse_client(job_data["client"])
    scope = _parse_scope(job_data["job_scope"])

    estimate_dict = job_data.get("estimate", {})
    auto_meta = EstimateMeta.auto(estimate_number_prefix)
    estimate = EstimateMeta(
        number=estimate_dict.get("number") or auto_meta.number,
        date=estimate_dict.get("date") or auto_meta.date,
    )

    labor_inputs, labor_hours, labor_total = _parse_labor(job_data.get("labor", {}), business, scope)
    material_inputs, gallons, materials_total = _parse_materials(
        job_data.get("materials", {}), business, scope
    )
    equipment_lines, equipment_total = _parse_equipment(job_data.get("equipment", []))

    overhead_percent = job_data.get("overhead_percent", business.overhead_percent)
    profit_percent = job_data.get("profit_percent", business.profit_percent)

    subtotal = labor_total + materials_total + equipment_total
    overhead_total = subtotal * (overhead_percent / 100)
    profit_base = subtotal + overhead_total
    profit_total = profit_base * (profit_percent / 100)
    grand_total = subtotal + overhead_total + profit_total

    return EstimateResult(
        business=business,
        client=client,
        job_scope=scope,
        estimate=estimate,
        labor_inputs=labor_inputs,
        material_inputs=material_inputs,
        equipment=list(equipment_lines),
        overhead_percent=overhead_percent,
        profit_percent=profit_percent,
        labor_total=labor_total,
        labor_hours=labor_hours,
        materials_total=materials_total,
        materials_gallons=gallons,
        equipment_total=equipment_total,
        overhead_total=overhead_total,
        profit_total=profit_total,
        grand_total=grand_total,
    )
