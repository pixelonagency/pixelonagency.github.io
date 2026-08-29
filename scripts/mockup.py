#!/usr/bin/env python3
"""
Telefon ekran görüntüsünü iPhone çerçevesine yerleştirip vaka sayfası board'u üretir.

Neden var: vaka sayfalarındaki kanıt görselleri (ChatGPT sonucu, uygulama ekranı,
sosyal medya profili) çıplak ekran görüntüsü olarak konduğunda amatör duruyor.
Çerçeve, görüntüyü "kanıt" hâline getiriyor.

Neden rasterleştirici/tasarım aracı yok: çerçeve birkaç yuvarlatılmış dikdörtgenden
ibaret. Burada deterministik olarak çizilir; Figma'ya ya da dış servise bağımlılık
eklemeye değmez.

Kullanım:
    python3 scripts/mockup.py <ekran-görüntüsü> <çıktı.webp> [--bg RRGGBB]

Örnek:
    python3 scripts/mockup.py ~/Downloads/IMG_4194.PNG \
        src/assets/images/projects/dr-ayse-cinkaya-kahveci/chatgpt-sonuc.webp --bg D9679B
"""

import argparse
from PIL import Image, ImageDraw, ImageFilter

# Board ölçüsü — mevcut vaka görselleriyle aynı (1600 px genişlik konvansiyonu).
CANVAS = (1600, 1983)
SS = 2  # süper örnekleme

FRAME_OUTER = (58, 58, 62)  # titanyum gövde
FRAME_EDGE = (128, 128, 134)  # kenar parlaması
SCREEN_BG = (0, 0, 0)


def build(shot_path: str, bg_hex: str) -> Image.Image:
    bg = tuple(int(bg_hex[i : i + 2], 16) for i in (0, 2, 4))
    W, H = CANVAS[0] * SS, CANVAS[1] * SS
    canvas = Image.new("RGB", (W, H), bg)

    shot = Image.open(shot_path).convert("RGB")
    ratio = shot.width / shot.height

    # Telefon, tuvalin %82'si kadar yüksek olsun; kenarlarda nefes payı kalsın.
    screen_h = int(H * 0.82)
    screen_w = int(screen_h * ratio)
    bezel = int(screen_w * 0.035)  # çerçeve kalınlığı
    body_w, body_h = screen_w + bezel * 2, screen_h + bezel * 2
    x0, y0 = (W - body_w) // 2, (H - body_h) // 2

    radius_body = int(body_w * 0.115)
    radius_screen = int(screen_w * 0.115)

    # --- gölge: gövdenin bulanık kopyası, aşağı kaydırılmış
    shadow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(shadow).rounded_rectangle(
        [x0, y0 + int(bezel * 1.6), x0 + body_w, y0 + body_h + int(bezel * 1.6)],
        radius=radius_body,
        fill=110,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(bezel * 2.2)))
    canvas.paste(Image.new("RGB", (W, H), (0, 0, 0)), (0, 0), shadow)

    # --- gövde
    body = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([x0, y0, x0 + body_w, y0 + body_h], radius=radius_body, fill=(*FRAME_OUTER, 255))
    # ince kenar parlaması
    bd.rounded_rectangle(
        [x0, y0, x0 + body_w, y0 + body_h],
        radius=radius_body,
        outline=(*FRAME_EDGE, 255),
        width=max(2, int(bezel * 0.13)),
    )
    canvas.paste(body, (0, 0), body)

    # --- ekran yuvası (siyah, köşeleri yuvarlatılmış)
    sx, sy = x0 + bezel, y0 + bezel
    slot = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(slot).rounded_rectangle(
        [sx, sy, sx + screen_w, sy + screen_h], radius=radius_screen, fill=(*SCREEN_BG, 255)
    )
    canvas.paste(slot, (0, 0), slot)

    # --- ekran görüntüsü, köşeleri ekran yuvasına göre maskelenmiş
    shot = shot.resize((screen_w, screen_h), Image.LANCZOS)
    mask = Image.new("L", (screen_w, screen_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, screen_w, screen_h], radius=radius_screen, fill=255)
    canvas.paste(shot, (sx, sy), mask)

    # --- Dynamic Island: durum çubuğundaki boşluğa oturur
    island_w, island_h = int(screen_w * 0.30), int(screen_w * 0.083)
    ix = sx + (screen_w - island_w) // 2
    iy = sy + int(screen_h * 0.014)
    isl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(isl).rounded_rectangle(
        [ix, iy, ix + island_w, iy + island_h], radius=island_h // 2, fill=(0, 0, 0, 255)
    )
    canvas.paste(isl, (0, 0), isl)

    # --- yan tuşlar
    btn = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bt = ImageDraw.Draw(btn)
    bw = max(3, int(bezel * 0.34))
    for top, height in ((0.20, 0.075), (0.30, 0.058), (0.375, 0.058)):  # sessize alma + ses tuşları
        ty = y0 + int(body_h * top)
        bt.rounded_rectangle(
            [x0 - bw, ty, x0 + 1, ty + int(body_h * height)], radius=bw, fill=(*FRAME_OUTER, 255)
        )
    ty = y0 + int(body_h * 0.28)  # güç tuşu
    bt.rounded_rectangle(
        [x0 + body_w - 1, ty, x0 + body_w + bw, ty + int(body_h * 0.095)], radius=bw, fill=(*FRAME_OUTER, 255)
    )
    canvas.paste(btn, (0, 0), btn)

    return canvas.resize(CANVAS, Image.LANCZOS)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("shot")
    ap.add_argument("out")
    ap.add_argument("--bg", default="D9679B", help="zemin rengi (RRGGBB) — vaka board'larıyla aynı olmalı")
    a = ap.parse_args()

    img = build(a.shot, a.bg)
    img.save(a.out, format="WEBP", quality=88, method=6)
    print(f"{a.out} · {img.size[0]}x{img.size[1]}")


if __name__ == "__main__":
    main()
