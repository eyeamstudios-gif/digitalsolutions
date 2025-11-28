"""Lightweight PDF writer tailored for the invoice layout."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

PAGE_WIDTH = 612
PAGE_HEIGHT = 792
LEFT_MARGIN = 60
TOP_START = 750
LINE_HEIGHT = 14
FONT_SIZE = 11


def _escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_stream(lines: Iterable[str]) -> bytes:
    parts = [
        "BT",
        f"/F1 {FONT_SIZE} Tf",
        f"{LEFT_MARGIN} {TOP_START} Td",
        f"{LINE_HEIGHT} TL",
    ]
    for line in lines:
        parts.append(f"({_escape(line)}) Tj")
        parts.append("T*")
    parts.append("ET")
    return ("\n".join(parts) + "\n").encode("utf-8")


def write_pdf(lines: Iterable[str], output_path: Path) -> Path:
    content = _build_stream(lines)
    objects = [
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
        (
            "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 {w} {h}] /Contents 4 0 R "
            "/Resources << /Font << /F1 5 0 R >> >> >> endobj\n".format(w=PAGE_WIDTH, h=PAGE_HEIGHT)
        ).encode("ascii"),
        (
            "4 0 obj << /Length {length} >> stream\n".format(length=len(content))
            .encode("ascii")
            + content
            + b"endstream endobj\n"
        ),
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
    ]

    buffer = bytearray()
    buffer.extend(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(buffer))
        buffer.extend(obj)
    xref_offset = len(buffer)

    buffer.extend(b"xref\n0 6\n")
    buffer.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        buffer.extend(f"{off:010} 00000 n \n".encode("ascii"))
    buffer.extend(b"trailer << /Size 6 /Root 1 0 R >>\n")
    buffer.extend(b"startxref\n")
    buffer.extend(f"{xref_offset}".encode("ascii"))
    buffer.extend(b"\n%%EOF\n")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as fh:
        fh.write(buffer)
    return output_path
