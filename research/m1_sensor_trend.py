"""Build a source-traceable trend from the authorized M1 synthetic CSV."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from m1_csv_profile import DEFAULT_INPUT, SOURCE_TYPE, load_csv, numeric_columns


def select_axes(path: Path = DEFAULT_INPUT) -> tuple[str, str]:
    header, rows = load_csv(path)
    cycle_candidates = [name for name in header if name.casefold() == "cycle"]
    x_axis = cycle_candidates[0] if cycle_candidates else "Row Index (1-based data row)"
    candidates = numeric_columns(header, rows)
    if not candidates:
        raise ValueError("No complete finite numeric column is available for a legal trend")
    return x_axis, candidates[0]


def build_trend(path: Path = DEFAULT_INPUT, y_column: str | None = None) -> dict[str, Any]:
    header, rows = load_csv(path)
    x_axis, default_y = select_axes(path)
    selected_y = y_column or default_y
    if selected_y not in numeric_columns(header, rows):
        raise ValueError(f"Y-axis column is not a complete finite numeric column: {selected_y}")

    y_index = header.index(selected_y)
    cycle_index = header.index(x_axis) if x_axis in header else None
    points = []
    for index, row in enumerate(rows, start=1):
        raw_y = row[y_index]
        raw_x = row[cycle_index] if cycle_index is not None else str(index)
        points.append(
            {
                "x": float(raw_x) if cycle_index is not None else index,
                "y": float(raw_y),
                "raw_y": raw_y,
                "data_row_index": index,
                "physical_line_number": index + 1,
            }
        )

    return {
        "source_type": SOURCE_TYPE,
        "x_axis": x_axis,
        "y_axis": selected_y,
        "point_count": len(points),
        "points": points,
        "transformations": "NONE: no interpolation, smoothing, filling, or value changes.",
    }


def validate_trend(path: Path, trend: dict[str, Any]) -> dict[str, Any]:
    header, rows = load_csv(path)
    y_index = header.index(trend["y_axis"])
    checks = []
    for point in trend["points"]:
        source_index = point["data_row_index"] - 1
        checks.append(
            point["physical_line_number"] == point["data_row_index"] + 1
            and point["raw_y"] == rows[source_index][y_index]
            and point["y"] == float(rows[source_index][y_index])
        )
    return {
        "all_points_match_source": all(checks),
        "checked_points": len(checks),
        "source_data_rows": len(rows),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--y-column")
    args = parser.parse_args()
    trend = build_trend(args.input, args.y_column)
    output = {"trend": trend, "validation": validate_trend(args.input, trend)}
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
