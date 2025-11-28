"""Invoice text layout + PDF export."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, List

from .models import EstimateResult
from .pdf_utils import write_pdf


def _section(title: str, lines: Iterable[str]) -> List[str]:
    output = [title.upper()]
    output.extend(lines)
    output.append("")
    return output


def _format_currency(value: float) -> str:
    return f"$ {value:,.2f}"


def _build_lines(estimate: EstimateResult) -> List[str]:
    business = estimate.business
    client = estimate.client
    scope = estimate.job_scope

    lines: List[str] = []
    lines.extend(_section(
        f"{business.name} | {business.phone} | {business.email}",
        [
            business.address,
            (business.website or "").strip(),
        ],
    ))

    lines.extend(
        _section(
            "Invoice Details",
            [
                f"Invoice #: {estimate.estimate.number}",
                f"Date: {estimate.estimate.date}",
            ],
        )
    )

    lines.extend(
        _section(
            "Bill To",
            [
                client.name,
                client.project_address,
                f"{client.phone} | {client.email}",
            ],
        )
    )

    scope_lines = [
        f"Project Type: {scope.project_type}",
        f"Rooms/Zones: {', '.join(scope.rooms) or 'N/A'}",
        f"Surfaces: {', '.join(scope.surfaces) or 'N/A'}",
        f"Prep Level: {scope.prep_level} | Coats: {scope.coats}",
        f"Height Level: {scope.height_level} | Condition: {scope.surface_condition}",
        f"Color Change: {scope.color_change}",
        f"Description: {scope.description or 'N/A'}",
    ]
    lines.extend(_section("Description of Work", scope_lines))

    rows = [
        ("Labor", estimate.labor_total),
        ("Materials", estimate.materials_total),
        ("Equipment", estimate.equipment_total),
        (f"Overhead ({estimate.overhead_percent:.1f}%)", estimate.overhead_total),
        (f"Profit ({estimate.profit_percent:.1f}%)", estimate.profit_total),
        ("Grand Total", estimate.grand_total),
    ]
    lines.extend(
        _section(
            "Cost Breakdown",
            [f"{label}: {_format_currency(value)}" for label, value in rows],
        )
    )

    lines.extend(
        _section(
            "Payment Terms",
            [
                "Deposit: 30–50% due upon acceptance",
                "Balance due upon completion",
                "Change orders billed separately",
            ],
        )
    )

    lines.extend(
        _section(
            "Signatures",
            [
                "Contractor: ____________________",
                "Client: ________________________",
            ],
        )
    )
    return lines


def create_invoice_pdf(estimate: EstimateResult, output_dir: Path) -> Path:
    lines = _build_lines(estimate)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"invoice_{estimate.estimate.number}.pdf"
    return write_pdf(lines, output_path)
