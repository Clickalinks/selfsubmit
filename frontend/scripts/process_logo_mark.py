"""Keep green circle + white tick; make only outside background transparent."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parent.parent
src = root / "public" / "brand" / "selfsubmit-logo-source.png"
dst = root / "public" / "brand" / "selfsubmit-logo.png"


def main() -> None:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()

    greens: list[tuple[int, int]] = []
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if g > r + 30 and g > b + 30 and g > 100:
                greens.append((x, y))

    if not greens:
        raise SystemExit("No green pixels found")

    cx = sum(p[0] for p in greens) / len(greens)
    cy = sum(p[1] for p in greens) / len(greens)
    # Max distance of green pixels ≈ circle radius
    radius = max(((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 for x, y in greens)
    # Stay just inside the green rim so photo fringe does not become a white ring
    keep_r = radius - 1.0

    out = Image.new("RGBA", (w, h))
    out_px = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if dist > keep_r:
                out_px[x, y] = (0, 0, 0, 0)
                continue
            # Clean near-white tick to pure white; drop pale fringe near the rim
            if r > 200 and g > 200 and b > 200:
                if dist > radius - 6:
                    out_px[x, y] = (0, 0, 0, 0)
                else:
                    out_px[x, y] = (255, 255, 255, 255)
            else:
                out_px[x, y] = (r, g, b, a)

    bbox = out.split()[-1].getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(dst)
    print(f"Wrote {dst} size={out.size} center=({cx:.1f},{cy:.1f}) r={radius:.1f}")


if __name__ == "__main__":
    main()
