"""Deterministic Pillow renderer for 6 TikTok intro slides.

Usage:
  python3 scripts/render_slides_pillow.py --spec <path> --out <dir> --font <ttf_path>
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List, Tuple

try:
    from PIL import Image, ImageDraw, ImageFont
except ModuleNotFoundError:
    print(
        "Missing dependency: Pillow. Install with: python3 -m pip install pillow",
        file=sys.stderr,
    )
    sys.exit(1)


WIDTH = 1024
HEIGHT = 1536
SAFE_LEFT = 90
SAFE_RIGHT = 90
SAFE_TOP = 180
SAFE_BOTTOM_RESERVED = 260
MAX_TEXT_WIDTH = WIDTH - SAFE_LEFT - SAFE_RIGHT
SAFE_TEXT_HEIGHT = HEIGHT - SAFE_TOP - SAFE_BOTTOM_RESERVED

BASE_COLOR = (42, 18, 74)
SHADOW_COLOR = (0, 0, 0, 140)
TEXT_COLOR = (255, 255, 255)
SHADOW_OFFSETS = ((3, 3), (2, 2), (4, 4))

MIN_FONT_SIZE = 40
MAX_FONT_SIZE = 70
LINE_SPACING_RATIO = 0.22


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render deterministic 6-slide TikTok intro deck as PNG files."
    )
    parser.add_argument("--spec", required=True, help="Path to JSON spec with 6 slides")
    parser.add_argument("--out", required=True, help="Output directory for PNG slides")
    parser.add_argument("--font", required=True, help="Path to .ttf font file")
    return parser.parse_args()


def fail(message: str, code: int = 1) -> None:
    print(f"Error: {message}", file=sys.stderr)
    sys.exit(code)


def load_spec(spec_path: Path) -> List[str]:
    if not spec_path.exists():
        fail(f"Spec file not found: {spec_path}")
    try:
        raw = json.loads(spec_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Spec file is not valid JSON: {exc}")
    except OSError as exc:
        fail(f"Could not read spec file: {exc}")

    slides = raw.get("slides")
    if not isinstance(slides, list):
        fail("Spec must contain a 'slides' list.")
    if len(slides) != 6:
        fail(f"Spec must contain exactly 6 slides. Got: {len(slides)}")
    if not all(isinstance(item, str) and item.strip() for item in slides):
        fail("All slide entries must be non-empty strings.")
    return slides


def validate_font(font_path: Path) -> None:
    if not font_path.exists():
        fail(f"Font file not found: {font_path}")
    if not font_path.is_file():
        fail(f"Font path is not a file: {font_path}")


def build_background(slide_idx: int) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), BASE_COLOR)
    draw = ImageDraw.Draw(image)

    # Deterministic vertical gradient with very subtle index-based variation.
    for y in range(HEIGHT):
        blend = y / float(HEIGHT - 1)
        delta_r = int(12 * blend)
        delta_g = int(10 * blend)
        delta_b = int(22 * blend)
        accent = slide_idx * 2
        color = (
            min(255, BASE_COLOR[0] + delta_r + accent),
            min(255, BASE_COLOR[1] + delta_g),
            min(255, BASE_COLOR[2] + delta_b + accent),
        )
        draw.line([(0, y), (WIDTH, y)], fill=color)

    # Subtle deterministic texture pattern (no randomness).
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    px = overlay.load()
    seed = (slide_idx + 1) * 131
    for y in range(0, HEIGHT, 4):
        for x in range(0, WIDTH, 4):
            value = (x * 17 + y * 31 + seed * 13) % 100
            if value < 6:
                alpha = 10 + (value % 5)
                px[x, y] = (255, 255, 255, alpha)

    image = Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")
    return image


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> List[str]:
    words = text.split()
    if not words:
        return [""]

    lines: List[str] = []
    current = words[0]

    for word in words[1:]:
        candidate = f"{current} {word}"
        width = draw.textbbox((0, 0), candidate, font=font)[2]
        if width <= MAX_TEXT_WIDTH:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)

    # Handle extra-long unbreakable tokens by character splitting.
    final_lines: List[str] = []
    for line in lines:
        if draw.textbbox((0, 0), line, font=font)[2] <= MAX_TEXT_WIDTH:
            final_lines.append(line)
            continue

        chunk = ""
        for ch in line:
            candidate = f"{chunk}{ch}"
            if draw.textbbox((0, 0), candidate, font=font)[2] <= MAX_TEXT_WIDTH or not chunk:
                chunk = candidate
            else:
                final_lines.append(chunk)
                chunk = ch
        if chunk:
            final_lines.append(chunk)
    return final_lines


def measure_block(
    draw: ImageDraw.ImageDraw, lines: List[str], font: ImageFont.FreeTypeFont
) -> Tuple[int, int, int]:
    line_heights: List[int] = []
    max_width = 0
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        max_width = max(max_width, width)
        line_heights.append(height)

    spacing = max(10, int(font.size * LINE_SPACING_RATIO))
    total_height = sum(line_heights) + spacing * (len(lines) - 1)
    return max_width, total_height, spacing


def layout_text(
    draw: ImageDraw.ImageDraw, text: str, font_path: Path
) -> Tuple[ImageFont.FreeTypeFont, List[str], int, int]:
    for font_size in range(MAX_FONT_SIZE, MIN_FONT_SIZE - 1, -2):
        font = ImageFont.truetype(str(font_path), size=font_size)
        lines = wrap_text(draw, text, font)
        block_width, block_height, spacing = measure_block(draw, lines, font)
        if block_width <= MAX_TEXT_WIDTH and block_height <= SAFE_TEXT_HEIGHT:
            # Vertically center in safe box.
            y = SAFE_TOP + (SAFE_TEXT_HEIGHT - block_height) // 2
            y = max(SAFE_TOP, y)
            max_y = HEIGHT - SAFE_BOTTOM_RESERVED - block_height
            y = min(y, max_y)
            return font, lines, y, spacing

    fail(
        "Could not fit text within safe margins. "
        "Try shorter slide copy or a font with narrower glyphs."
    )
    raise RuntimeError("Unreachable")


def draw_slide_text(image: Image.Image, text: str, font_path: Path) -> None:
    draw = ImageDraw.Draw(image, "RGBA")
    font, lines, y, spacing = layout_text(draw, text, font_path)

    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_w = bbox[2] - bbox[0]
        line_h = bbox[3] - bbox[1]
        x = SAFE_LEFT + (MAX_TEXT_WIDTH - line_w) // 2

        for dx, dy in SHADOW_OFFSETS:
            draw.text((x + dx, y + dy), line, font=font, fill=SHADOW_COLOR)
        draw.text((x, y), line, font=font, fill=TEXT_COLOR)
        y += line_h + spacing


def render_slides(slides: List[str], out_dir: Path, font_path: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for idx, slide_text in enumerate(slides, start=1):
        image = build_background(idx)
        draw_slide_text(image, slide_text, font_path)
        out_path = out_dir / f"slide_{idx:02d}.png"
        image.save(out_path, format="PNG", compress_level=9, optimize=False)
        print(f"Wrote {out_path}")


def main() -> None:
    args = parse_args()
    spec_path = Path(args.spec)
    out_dir = Path(args.out)
    font_path = Path(args.font)

    slides = load_spec(spec_path)
    validate_font(font_path)
    render_slides(slides, out_dir, font_path)


if __name__ == "__main__":
    main()
