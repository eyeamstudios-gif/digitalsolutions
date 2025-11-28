from pathlib import Path

from paint_pro_estimator import calculator


def test_build_estimate_sample_data():
    base = Path(__file__).resolve().parents[1]
    business_path = base / "paint_pro_estimator" / "sample_data" / "business_profile.json"
    job_path = base / "paint_pro_estimator" / "sample_data" / "job_scope.json"

    business, job = calculator.load_records(business_path, job_path)
    estimate = calculator.build_estimate(business, job, estimate_number_prefix="TEST")

    # Basic structural assertions
    assert estimate.business.name == "EYE AM STUDIOS | Paint Division"
    assert estimate.client.name == "Sunset Bistro"
    assert estimate.job_scope.project_type == "Interior"

    # Totals should be positive and internally consistent
    assert estimate.labor_total > 0
    assert estimate.materials_total > 0
    assert estimate.equipment_total > 0

    subtotal = estimate.labor_total + estimate.materials_total + estimate.equipment_total
    expected_overhead = subtotal * (estimate.overhead_percent / 100)
    expected_profit = (subtotal + expected_overhead) * (estimate.profit_percent / 100)
    expected_grand = subtotal + expected_overhead + expected_profit

    # Use a small tolerance for floating point differences
    assert abs(estimate.overhead_total - expected_overhead) < 1e-6
    assert abs(estimate.profit_total - expected_profit) < 1e-6
    assert abs(estimate.grand_total - expected_grand) < 1e-6
