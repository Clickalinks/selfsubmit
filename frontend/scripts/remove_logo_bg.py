"""
Remove near-uniform background from SelfSubmit logo PNG (corner sample),
then trim transparent margins. Writes public/brand/selfsubmit-logo.png.

Requires: pip install Pillow
"""
from __future__ import annotations

import sys
from pathlib import Path
from statistics import mean

try:
    from PIL import Image
except ImportError as e:
    print("Pillow required: pip install Pillow", file=sys.stderr)
    raise SystemExit(1) from e


def corner_colors(im: Image.Image) -> list[tuple[int, int, int]]:
    w, h = im.size
    rgb = im.convert("RGB")
    pts = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2), (w - 1, h // 2)]
    return [rgb.getpixel(p) for p in pts]


def dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return sum((int(x) - int(y)) ** 2 for x, y in zip(a, b, strict=True)) ** 0.5


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    src = root / "public" / "brand" / "selfsubmit-logo-source.png"
    dst = root / "public" / "brand" / "selfsubmit-logo.png"
    if not src.exists():
        print(f"Missing {src}", file=sys.stderr)
        raise SystemExit(1)

    im = Image.open(src)
    corners = corner_colors(im)
    bg = tuple(int(round(mean(c[i] for c in corners))) for i in range(3))

    threshold = 38.0
    rgba = Image.new("RGBA", im.size)
    rgb = im.convert("RGB")
    px = rgb.load()
    out = rgba.load()
    for y in range(im.height):
        for x in range(im.width):
            c = px[x, y]
            d = dist(c, bg)
            if d < threshold:
                alpha = 0
            elif d < threshold + 22:
                alpha = int(max(0, min(255, round((d - threshold) / 22 * 255))))
            else:
                alpha = 255
            out[x, y] = (*c, alpha)

    bbox = rgba.split()[-1].getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    rgba.save(dst, "PNG")
    print(f"Wrote {dst} size={rgba.size} bg_sample_rgb={bg}")


if __name__ == "__main__":
    main()
