"""Demo visuals for the mockups — no real photograph of any establishment is used.

  python3 images.py generate <out_dir> <palette> <kind:name[:WxH]>...
  python3 images.py manifest <images_dir> <manifest.json>

kind is one of: plate, ambiance, event, building, campus, interior.
Every image carries a visible "VISUEL DE DÉMONSTRATION" label so it can't be mistaken for a real photo.
"""
import base64, io, json, math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PALETTES = {
    # bg_top, bg_bottom, accents...
    "lounge": [(18, 16, 20), (52, 30, 22), (212, 162, 76), (232, 110, 64), (120, 40, 50), (250, 220, 170)],
    "ocean": [(238, 228, 210), (196, 172, 140), (14, 74, 96), (214, 96, 62), (236, 170, 70), (120, 150, 90)],
    "maquis": [(30, 46, 30), (120, 60, 20), (240, 140, 30), (40, 150, 90), (230, 70, 50), (250, 210, 120)],
    "school": [(225, 235, 250), (150, 180, 230), (30, 70, 160), (220, 40, 60), (250, 190, 40), (40, 150, 110)],
    "campus": [(235, 232, 225), (170, 160, 140), (20, 60, 70), (200, 120, 40), (90, 140, 120), (240, 200, 120)],
    "estate": [(232, 236, 240), (150, 170, 190), (30, 50, 70), (190, 140, 80), (90, 130, 110), (245, 225, 190)],
}

def font(size):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"]:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def gradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h), top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)))
    return img

def soft_layer(w, h, draw_fn, blur):
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    return layer.filter(ImageFilter.GaussianBlur(blur))

def bokeh(img, rng, colors, n, rmin, rmax, alpha=(40, 120), blur=18):
    w, h = img.size
    def draw(d):
        for _ in range(n):
            r = rng.randint(rmin, rmax); x, y = rng.randint(0, w), rng.randint(0, h)
            c = rng.choice(colors)
            d.ellipse([x - r, y - r, x + r, y + r], fill=c + (rng.randint(*alpha),))
    img.alpha_composite(soft_layer(w, h, draw, blur))

def plate(img, rng, pal):
    w, h = img.size
    cx, cy, r = w * rng.uniform(.42, .58), h * rng.uniform(.45, .58), min(w, h) * .36
    img.alpha_composite(soft_layer(w, h, lambda d: d.ellipse([cx - r * 1.05, cy - r * .95, cx + r * 1.12, cy + r * 1.15], fill=(0, 0, 0, 120)), 30))
    def p(d):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(246, 242, 236, 255))
        d.ellipse([cx - r * .78, cy - r * .78, cx + r * .78, cy + r * .78], fill=(236, 231, 224, 255))
    img.alpha_composite(soft_layer(w, h, p, 2))
    def food(d):
        for _ in range(rng.randint(5, 9)):
            a, dist = rng.uniform(0, 2 * math.pi), rng.uniform(0, r * .42)
            x, y, s = cx + math.cos(a) * dist, cy + math.sin(a) * dist, rng.uniform(r * .14, r * .3)
            d.ellipse([x - s, y - s * rng.uniform(.6, 1), x + s, y + s * rng.uniform(.6, 1)], fill=rng.choice(pal[2:]) + (235,))
        for _ in range(26):
            a, dist = rng.uniform(0, 2 * math.pi), rng.uniform(0, r * .55)
            x, y, s = cx + math.cos(a) * dist, cy + math.sin(a) * dist, rng.uniform(3, 9)
            d.ellipse([x - s, y - s, x + s, y + s], fill=(70, 130, 60, 220))
    img.alpha_composite(soft_layer(w, h, food, 5))
    img.alpha_composite(soft_layer(w, h, lambda d: d.ellipse([cx - r * .55, cy - r * .7, cx - r * .1, cy - r * .45], fill=(255, 255, 255, 70)), 14))

def ambiance(img, rng, pal):
    w, h = img.size
    bokeh(img, rng, pal[2:], 70, 8, 46, (60, 170), 10)
    def table(d):
        d.rectangle([0, h * .72, w, h], fill=(0, 0, 0, 150))
        for i in range(rng.randint(3, 5)):
            x = w * (.15 + i * .2) + rng.uniform(-20, 20); gh = h * rng.uniform(.14, .22)
            d.polygon([(x - 22, h * .72 - gh), (x + 22, h * .72 - gh), (x + 6, h * .72 - gh * .35), (x - 6, h * .72 - gh * .35)], fill=pal[5] + (130,))
            d.rectangle([x - 3, h * .72 - gh * .35, x + 3, h * .72 - 8], fill=pal[5] + (130,))
            d.ellipse([x - 18, h * .72 - 12, x + 18, h * .72], fill=pal[5] + (110,))
    img.alpha_composite(soft_layer(w, h, table, 3))

def event(img, rng, pal):
    w, h = img.size
    bokeh(img, rng, pal[2:], 90, 6, 30, (90, 200), 6)
    def garland(d):
        for k in range(2):
            pts = [(x, h * (.18 + k * .12) + math.sin(x / w * math.pi) * h * .1) for x in range(0, w + 40, 40)]
            for x, y in pts:
                d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(255, 230, 160, 230))
    img.alpha_composite(soft_layer(w, h, garland, 4))
    def table(d):
        d.rounded_rectangle([w * .12, h * .62, w * .88, h * .78], 30, fill=(250, 246, 238, 220))
        for i in range(6):
            x = w * (.2 + i * .12)
            d.ellipse([x - 28, h * .64, x + 28, h * .72], fill=rng.choice(pal[2:]) + (200,))
    img.alpha_composite(soft_layer(w, h, table, 3))

def building(img, rng, pal, campus=False):
    w, h = img.size
    def sky(d):
        d.ellipse([w * .7, h * .08, w * .9, h * .08 + w * .2], fill=(255, 240, 200, 160))
    img.alpha_composite(soft_layer(w, h, sky, 30))
    def b(d):
        base = h * .82
        d.rectangle([0, base, w, h], fill=pal[4] + (255,))
        x = w * .06
        while x < w * .94:
            bw, bh = w * rng.uniform(.18, .3), h * rng.uniform(.3, .55)
            col = rng.choice([pal[2], pal[3], (250, 250, 248)])
            d.rectangle([x, base - bh, x + bw, base], fill=col + (255,))
            for fy in range(int(base - bh + 20), int(base - 30), 46):
                for fx in range(int(x + 14), int(x + bw - 24), 38):
                    d.rectangle([fx, fy, fx + 20, fy + 26], fill=(255, 255, 255, 200) if col != (250, 250, 248) else pal[2] + (180,))
            if campus and rng.random() < .5:
                d.polygon([(x - 8, base - bh), (x + bw / 2, base - bh - h * .08), (x + bw + 8, base - bh)], fill=pal[3] + (255,))
            x += bw + w * .03
        for i in range(7):
            tx = w * rng.uniform(0, 1); ty = base
            d.ellipse([tx - 40, ty - 110, tx + 40, ty - 20], fill=(60, 120, 70, 255))
            d.rectangle([tx - 5, ty - 30, tx + 5, ty], fill=(90, 60, 40, 255))
    img.alpha_composite(soft_layer(w, h, b, 1.2))

def interior(img, rng, pal):
    w, h = img.size
    def room(d):
        d.polygon([(0, h * .7), (w, h * .7), (w, h), (0, h)], fill=pal[3] + (255,))
        d.rectangle([w * .08, h * .2, w * .38, h * .62], fill=(255, 255, 255, 230))
        d.line([(w * .23, h * .2), (w * .23, h * .62)], fill=pal[2] + (180,), width=6)
        d.rounded_rectangle([w * .48, h * .5, w * .92, h * .72], 26, fill=pal[2] + (255,))
        d.rounded_rectangle([w * .5, h * .42, w * .9, h * .56], 22, fill=pal[2] + (230,))
        d.ellipse([w * .6, h * .44, w * .7, h * .52], fill=pal[5] + (255,))
        d.rectangle([w * .44, h * .1, w * .47, h * .3], fill=(40, 40, 40, 200))
        d.ellipse([w * .41, h * .28, w * .5, h * .34], fill=(255, 230, 170, 255))
    img.alpha_composite(soft_layer(w, h, room, 2))
    img.alpha_composite(soft_layer(w, h, lambda d: d.polygon([(w * .08, h * .62), (w * .38, h * .62), (w * .6, h * .95), (w * .1, h * .95)], fill=(255, 255, 255, 60)), 20))

def finish(img, rng, label=True):
    w, h = img.size
    noise = Image.effect_noise((w, h), 22).convert("L")
    img = Image.composite(img.convert("RGB"), Image.new("RGB", (w, h), (128, 128, 128)), noise.point(lambda v: 255 - int(v * .06)))
    vign = Image.new("L", (w, h), 0)
    ImageDraw.Draw(vign).ellipse([-w * .25, -h * .25, w * 1.25, h * 1.25], fill=255)
    img = Image.composite(img, Image.new("RGB", (w, h), (0, 0, 0)), vign.filter(ImageFilter.GaussianBlur(min(w, h) * .12)))
    if label:
        d = ImageDraw.Draw(img, "RGBA"); f = font(max(14, w // 70)); t = "VISUEL DE DÉMONSTRATION"
        bb = d.textbbox((0, 0), t, font=f); pad = 10
        d.rounded_rectangle([20, h - 20 - (bb[3] - bb[1]) - 2 * pad, 20 + bb[2] - bb[0] + 2 * pad, h - 20], 8, fill=(0, 0, 0, 150))
        d.text((20 + pad, h - 20 - pad - (bb[3] - bb[1]) - bb[1]), t, font=f, fill=(255, 255, 255, 235))
    return img

def generate(out, palette, specs):
    pal = PALETTES[palette]; out = Path(out); out.mkdir(parents=True, exist_ok=True)
    for i, spec in enumerate(specs):
        kind, name, *size = spec.split(":")
        w, h = map(int, size[0].split("x")) if size else (1200, 900)
        rng = random.Random(f"{palette}-{name}-{i}")
        top, bottom = (pal[0], pal[1]) if kind not in ("building", "campus") else ((150, 200, 240), (240, 236, 225))
        img = gradient(w, h, top, bottom).convert("RGBA")
        if kind == "plate":
            bokeh(img, rng, pal[2:], 30, 20, 80, (20, 70), 30); plate(img, rng, pal)
        elif kind == "ambiance": ambiance(img, rng, pal)
        elif kind == "event": event(img, rng, pal)
        elif kind in ("building", "campus"): building(img, rng, pal, campus=kind == "campus")
        elif kind == "interior": interior(img, rng, pal)
        else: raise SystemExit(f"unknown kind {kind}")
        finish(img, rng).save(out / f"{name}.webp", "WEBP", quality=78, method=6)
        print("wrote", out / f"{name}.webp", f"{w}x{h}")

def manifest(images_dir, manifest_path):
    data = {}
    for p in sorted(Path(images_dir).glob("*.webp")):
        im = Image.open(p); w, h = im.size
        tiny = im.convert("RGB").resize((12, max(1, round(12 * h / w))))
        buf = io.BytesIO(); tiny.save(buf, "WEBP", quality=40)
        data[p.name] = {"width": w, "height": h, "blurDataURL": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()}
    Path(manifest_path).write_text(json.dumps(data, indent=1) + "\n")
    print(f"manifest: {len(data)} images -> {manifest_path}")

if __name__ == "__main__":
    cmd, *args = sys.argv[1:]
    generate(args[0], args[1], args[2:]) if cmd == "generate" else manifest(*args)
