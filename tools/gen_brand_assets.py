"""Regenerate the site's brand assets from one 16x16 pixel grid.

    python tools/gen_brand_assets.py      # needs Pillow, nothing else

Writes static/favicon.svg, static/favicon.ico, static/apple-touch-icon.png
and static/og-image.png. All four derive from MARK below, so the mark is
identical in every format and size; edit MARK and re-run rather than
touching the generated files.

This is NOT part of the build. Hugo only copies the results out of
static/, so the outputs are committed and Pillow is a dev-only dependency
that CI never installs.

Palette is Sweetie-16, the same tokens as the :root block in
layouts/baseof.html. The OG image is typeset in the site's own WOFF2
files, which FreeType reads directly -- so the card matches the page.
"""
import io, struct, pathlib
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "static"
FONTS = OUT / "fonts"
PIXEL = str(FONTS / "press-start-2p-latin.woff2")
MONO = str(FONTS / "jetbrains-mono-latin.woff2")

BG     = "#1a1c2c"
YELLOW = "#ffcd75"
ORANGE = "#ef7d57"
RED    = "#b13e53"
BLUE   = "#41a6f6"
BORDER = "#414968"
MUTED  = "#94b0c2"

N = 16


def hex2rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def mark():
    """A pizza slice: browned crust on top, tapering to a point.

    A wedge is one of the few silhouettes that still reads at 16px, and it
    points at the dough calculator under pizza.tobiasschuerg.de.
    """
    g = [[None] * N for _ in range(N)]
    for y in range(1, 15):
        w = round(12 - 10 * (y - 1) / 13)
        for x in range(8 - w // 2, 8 - w // 2 + w):
            g[y][x] = ORANGE if y <= 2 else YELLOW
    for px, py in ((5, 5), (10, 5), (7, 9)):          # pepperoni
        for dx in range(2):
            for dy in range(2):
                if g[py + dy][px + dx]:
                    g[py + dy][px + dx] = RED
    return g


MARK = mark()


def render(scale):
    """Nearest-neighbour render of the grid at `scale` px per cell."""
    img = Image.new("RGB", (N * scale, N * scale), hex2rgb(BG))
    d = ImageDraw.Draw(img)
    for y, row in enumerate(MARK):
        for x, c in enumerate(row):
            if c:
                d.rectangle([x * scale, y * scale,
                             (x + 1) * scale - 1, (y + 1) * scale - 1],
                            fill=hex2rgb(c))
    return img


def svg():
    """One rect per horizontal run of equal colour, so the file stays small."""
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" '
             'shape-rendering="crispEdges">',
             f'<rect width="16" height="16" fill="{BG}"/>']
    for y, row in enumerate(MARK):
        x = 0
        while x < N:
            c, run = row[x], 1
            while x + run < N and row[x + run] == c:
                run += 1
            if c:
                parts.append(f'<rect x="{x}" y="{y}" width="{run}" height="1" '
                             f'fill="{c}"/>')
            x += run
    return "".join(parts) + "</svg>\n"


def ico(sizes=(16, 32, 48)):
    """Hand-built so every size is a crisp nearest-neighbour render rather
    than a resampled copy of one bitmap. PNG payloads are fine everywhere now."""
    pngs = []
    for s in sizes:
        buf = io.BytesIO()
        render(s // N).save(buf, format="PNG", optimize=True)
        pngs.append(buf.getvalue())
    out = struct.pack("<HHH", 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    for s, data in zip(sizes, pngs):
        out += struct.pack("<BBBBHHII", s, s, 0, 0, 1, 32, len(data), offset)
        offset += len(data)
    return out + b"".join(pngs)


def tracked(d, cx, y, text, font, fill, tracking):
    """Centred text with manual letter-spacing (Pillow has none)."""
    widths = [d.textlength(c, font=font) for c in text]
    x = cx - (sum(widths) + tracking * (len(text) - 1)) / 2
    for c, w in zip(text, widths):
        d.text((x, y), c, font=font, fill=fill, anchor="lm")
        x += w + tracking


def og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), hex2rgb(BG))
    d = ImageDraw.Draw(img)

    # Mirrors the 4px blue rules on .site-head / .site-foot.
    d.rectangle([0, 0, W, 7], fill=hex2rgb(BLUE))
    d.rectangle([0, H - 8, W, H], fill=hex2rgb(BLUE))

    icon = render(10)                       # 160x160
    img.paste(icon, ((W - icon.width) // 2, 74))

    title = ImageFont.truetype(PIXEL, 56)   # 7x the font's 8px design grid
    domain = ImageFont.truetype(PIXEL, 24)
    tag = ImageFont.truetype(MONO, 24)

    # Offset shadow, as on .cabinet / .btn.
    for dx, fill in ((5, (0, 0, 0)), (0, hex2rgb(YELLOW))):
        d.text((W / 2 + dx, 310 + dx), "TOBIAS SCHÜRG", font=title,
               fill=fill, anchor="mm")

    tracked(d, W / 2, 396, "SAMMELT DIGITALEN STAUB.", tag, hex2rgb(MUTED), 2.0)
    d.rectangle([W / 2 - 200, 452, W / 2 + 200, 455], fill=hex2rgb(BORDER))
    tracked(d, W / 2, 508, "TOBIASSCHUERG.DE", domain, hex2rgb(BLUE), 0)
    return img


if __name__ == "__main__":
    (OUT / "favicon.svg").write_text(svg(), encoding="utf-8")
    (OUT / "favicon.ico").write_bytes(ico())
    # 176 = 11x the grid; padded to 180 so the pixels stay square.
    touch = Image.new("RGB", (180, 180), hex2rgb(BG))
    touch.paste(render(11), (2, 2))
    touch.save(OUT / "apple-touch-icon.png", optimize=True)
    og().save(OUT / "og-image.png", optimize=True)
    for f in ("favicon.svg", "favicon.ico", "apple-touch-icon.png", "og-image.png"):
        print(f"{(OUT / f).stat().st_size:>7} bytes  static/{f}")
