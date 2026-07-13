"""Make black canvas transparent around the glossy SelfSubmit brand mark."""
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
    out = Image.new("RGBA", (w, h))
    op = out.load()

    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if r < 35 and g < 35 and b < 35:
                op[x, y] = (0, 0, 0, 0)
            else:
                op[x, y] = (r, g, b, 255)

    bbox = out.split()[-1].getbbox()
    if bbox:
        out = out.crop(bbox)

    ow, oh = out.size
    side = max(ow, oh)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(out, ((side - ow) // 2, (side - oh) // 2), out)
    sq.save(dst)
    print(f"Wrote {dst} size={sq.size}")


if __name__ == "__main__":
    main()
