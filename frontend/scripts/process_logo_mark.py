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
    radius = max(((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 for x, y in greens)
    keep_r = radius - 0.5
    # White fringe from the photo sits in this outer band (shows on dark footer)
    rim_band = radius * 0.82

    out = Image.new("RGBA", (w, h))
    out_px = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if dist > keep_r:
                out_px[x, y] = (0, 0, 0, 0)
                continue

            is_white = r > 200 and g > 200 and b > 200
            if is_white:
                # Allow the check tail that breaks the left edge; drop rim glare elsewhere
                left_tail = x < cx - radius * 0.55 and abs(y - cy) < radius * 0.4
                if dist > rim_band and not left_tail:
                    out_px[x, y] = (0, 0, 0, 0)
                else:
                    out_px[x, y] = (255, 255, 255, 255)
            else:
                out_px[x, y] = (r, g, b, 255)

    bbox = out.split()[-1].getbbox()
    if bbox:
        out = out.crop(bbox)

    # Final pass on cropped image: erase any remaining outer white crescent
    cw, ch = out.size
    opx = out.load()
    ocx, ocy = cw / 2, ch / 2
    oradius = min(cw, ch) / 2
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = opx[x, y]
            if a < 10:
                continue
            if not (r > 200 and g > 200 and b > 200):
                continue
            dist = ((x - ocx) ** 2 + (y - ocy) ** 2) ** 0.5
            left_tail = x < ocx - oradius * 0.55 and abs(y - ocy) < oradius * 0.4
            if dist > oradius * 0.82 and not left_tail:
                opx[x, y] = (0, 0, 0, 0)

    bbox2 = out.split()[-1].getbbox()
    if bbox2:
        out = out.crop(bbox2)

    out.save(dst)
    print(f"Wrote {dst} size={out.size} center=({cx:.1f},{cy:.1f}) r={radius:.1f}")


if __name__ == "__main__":
    main()
