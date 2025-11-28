"""Command line interface for the PaintPro estimator."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict

from . import calculator
from .invoice import create_invoice_pdf


def _write_json(path: Path, payload: Dict[str, Any]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)
    return path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="PaintPro Estimator + Invoice System")
    subparsers = parser.add_subparsers(dest="command", required=True)

    estimate_parser = subparsers.add_parser("estimate", help="Generate an estimate + invoice")
    estimate_parser.add_argument(
        "--business-profile",
        required=True,
        type=Path,
        help="Path to the business profile JSON",
    )
    estimate_parser.add_argument(
        "--job",
        required=True,
        type=Path,
        help="Path to the job scope JSON",
    )
    estimate_parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("estimates/records"),
        help="Where to write the estimate summary JSON",
    )
    estimate_parser.add_argument(
        "--invoice-dir",
        type=Path,
        default=Path("estimates/invoices"),
        help="Where to write the invoice PDF",
    )
    estimate_parser.add_argument(
        "--estimate-prefix",
        default="EST",
        help="Prefix for auto-generated estimate numbers",
    )
    estimate_parser.add_argument(
        "--no-pdf",
        action="store_true",
        help="Skip PDF invoice generation",
    )

    profile_parser = subparsers.add_parser("init-profile", help="Create a starter business profile")
    profile_parser.add_argument(
        "--output",
        type=Path,
        default=Path("business_profile.json"),
        help="Where to save the starter profile",
    )

    job_parser = subparsers.add_parser("init-job", help="Create a starter job scope file")
    job_parser.add_argument(
        "--output",
        type=Path,
        default=Path("job_scope.json"),
        help="Where to save the starter job file",
    )

    return parser


def run_estimate(args: argparse.Namespace) -> Dict[str, Any]:
    business, job = calculator.load_records(args.business_profile, args.job)
    estimate = calculator.build_estimate(business, job, estimate_number_prefix=args.estimate_prefix)
    summary_path = estimate.save_summary(args.output_dir)
    invoice_path = None
    if not args.no_pdf:
        invoice_path = create_invoice_pdf(estimate, args.invoice_dir)
    summary = estimate.serialize()
    summary["summary_path"] = str(summary_path)
    if invoice_path:
        summary["invoice_pdf"] = str(invoice_path)
    return summary


def init_business_profile(path: Path) -> Path:
    template = {
        "name": "Your Business Name",
        "owner": "Owner Name",
        "phone": "555-123-4567",
        "email": "info@example.com",
        "address": "123 Main St, City, ST",
        "website": "https://example.com",
        "logo_path": "./logo.png",
        "labor_rate": 55.0,
        "productivity_rate_sqft_per_hour": 325.0,
        "paint_coverage_sqft_per_gallon": 350.0,
        "paint_cost_per_gallon": 42.0,
        "overhead_percent": 12.0,
        "profit_percent": 15.0,
    }
    return _write_json(path, template)


def init_job_scope(path: Path) -> Path:
    template = {
        "client": {
            "name": "Client Name",
            "project_address": "456 Client Ave, City, ST",
            "phone": "555-987-6543",
            "email": "client@example.com",
        },
        "estimate": {
            "description": "Interior repaint",
        },
        "job_scope": {
            "project_type": "Interior",
            "rooms": ["Living Room", "Kitchen"],
            "surfaces": ["Walls", "Ceiling", "Trim"],
            "prep_level": "standard",
            "coats": 2,
            "height_level": "10ft",
            "surface_condition": "clean",
            "color_change": "minor change",
            "description": "Includes prep, masking, and cleanup",
        },
        "labor": {
            "area_sqft": 1800,
            "productivity_rate": 325,
            "labor_rate": 55,
            "painters": 2,
        },
        "materials": {
            "area_sqft": 1800,
            "coats": 2,
            "coverage_rate": 350,
            "cost_per_gallon": 48,
            "markup_percent": 12,
        },
        "equipment": [
            {"label": "Masking + PPE", "daily_cost": 75, "days": 2},
            {"label": "Lift Rental", "daily_cost": 180, "days": 1},
        ],
        "overhead_percent": 10,
        "profit_percent": 15,
    }
    return _write_json(path, template)


def main(argv: list[str] | None = None) -> Dict[str, Any]:
    parser = build_parser()
    args = parser.parse_args(argv)
    if args.command == "estimate":
        result = run_estimate(args)
        print(json.dumps(result, indent=2))
        return result
    if args.command == "init-profile":
        path = init_business_profile(args.output)
        payload = {"business_profile": str(path)}
        print(json.dumps(payload, indent=2))
        return payload
    if args.command == "init-job":
        path = init_job_scope(args.output)
        payload = {"job_scope": str(path)}
        print(json.dumps(payload, indent=2))
        return payload
    raise ValueError("Unknown command")


if __name__ == "__main__":  # pragma: no cover
    main()
