#!/usr/bin/env python3
"""
"ChatGPT'ye sordu, klinik ilk sırada çıktı" anlatısını gerçek ekran
görüntülerinden kare kare üretir ve iPhone çerçevesine yerleştirir.

Neden yapay zekâ video üreticisi kullanılmadı: Seedance/Higgsfield gibi araçlar
ekrandaki METNİ koruyamıyor — "Manavgat en iyi dermatolog" yazısını ve ChatGPT
arayüzünü bozuyorlar. Bu vakanın tüm değeri gerçek olmasında; uydurma görünen
bir video kanıtı zayıflatır. Bu yüzden her kare sahibin gerçek ekran
görüntüsünden türetilir, tek piksel uydurulmaz.

Girdi  : bos.png (boş sohbet + klavye), sonuc.png (yanıt ekranı) — ikisi de 1320x2868
Çıktı  : mp4 (ve istenirse gif)

Kullanım:
    python3 scripts/chatgpt-reel.py <bos.png> <sonuc.png> <cikti.mp4> [--gif cikti.gif]

Üretimde kullanılan tam komut (kaynaklar repoda DEĞİL — kişisel ekran görüntüsü,
repo public; ~/Desktop/ayse-cinkaya/chatgpt-kaynak/ altında duruyor):

    python3 scripts/chatgpt-reel.py \
        ~/Desktop/ayse-cinkaya/chatgpt-kaynak/bos.png \
        ~/Desktop/ayse-cinkaya/chatgpt-kaynak/sonuc.png \
        public/media/projects/dr-ayse-cinkaya-kahveci/chatgpt-arama.mp4

Poster (t=6.2sn karesi) ayrıca üretilir:
    ffmpeg -ss 6.2 -i <mp4> -frames:v 1 /tmp/poster.png
    ve PIL ile .webp'ye çevrilir — ffmpeg'in webp kodlayıcısı bu kurulumda kapalı.
"""

import argparse
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# --- kaynak ekran görüntüsü ölçüleri (1320x2868 iPhone kaydı) --------------
SRC_W = 1320
BAR_TOP, BAR_BOTTOM = 1734, 1877  # giriş çubuğu
BAR_BG = (18, 18, 18)
CURSOR_X = 180
TEXT_X = 196
TEXT_TOP, TEXT_BOTTOM = 1770, 1840
CURSOR_TOP, CURSOR_BOTTOM = 1771, 1842
CURSOR_COLOR = (10, 132, 255)
PLACEHOLDER_RIGHT = 900  # yer tutucuyu silmek için güvenli sağ sınır

PROMPT = "Manavgat en iyi dermatolog"

# --- çıktı ----------------------------------------------------------------
CANVAS = (1200, 1500)
FPS = 30
BEZEL_RATIO = 0.035
FRAME_COLOR = (58, 58, 62)
FRAME_EDGE = (128, 128, 134)
BG_TOP = (26, 26, 28)
BG_BOTTOM = (12, 12, 14)

FONT_PATH = "/System/Library/Fonts/SFNS.ttf"


def ease_out(t: float) -> float:
    return 1 - (1 - t) ** 3


def build_stage(canvas_w: int, canvas_h: int, screen_w: int, screen_h: int):
    """Telefon gövdesini ve zemini bir kez çizer; her karede yeniden kullanılır."""
    bezel = round(screen_w * BEZEL_RATIO)
    body_w, body_h = screen_w + bezel * 2, screen_h + bezel * 2
    x0, y0 = (canvas_w - body_w) // 2, (canvas_h - body_h) // 2
    radius = round(body_w * 0.115)

    stage = Image.new("RGB", (canvas_w, canvas_h))
    d = ImageDraw.Draw(stage)
    for y in range(canvas_h):
        t = y / (canvas_h - 1)
        d.line([(0, y), (canvas_w, y)], fill=tuple(round(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3)))

    # zemine yayılan yumuşak ışık — telefon düz zeminde yüzmesin
    glow = Image.new("L", (canvas_w, canvas_h), 0)
    ImageDraw.Draw(glow).ellipse(
        [x0 - body_w * 0.35, y0 + body_h * 0.10, x0 + body_w * 1.35, y0 + body_h * 1.05], fill=54
    )
    stage = Image.composite(Image.new("RGB", (canvas_w, canvas_h), (70, 72, 80)), stage, glow.filter(ImageFilter.GaussianBlur(150)))

    body = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([x0, y0, x0 + body_w, y0 + body_h], radius=radius, fill=(*FRAME_COLOR, 255))
    bd.rounded_rectangle(
        [x0, y0, x0 + body_w, y0 + body_h], radius=radius, outline=(*FRAME_EDGE, 255), width=max(2, round(bezel * 0.13))
    )
    stage = Image.alpha_composite(stage.convert("RGBA"), body)

    return stage.convert("RGB"), (x0 + bezel, y0 + bezel), bezel


def typed_screen(base: Image.Image, chars: int, cursor_on: bool, scale: float) -> Image.Image:
    """Boş ekrana `chars` kadar harf yazılmış hâlini üretir (ölçeklenmiş uzayda)."""
    img = base.copy()
    d = ImageDraw.Draw(img)

    sx = lambda v: round(v * scale)  # noqa: E731

    # yer tutucuyu ve önceki metni sil
    d.rectangle([sx(CURSOR_X) - 2, sx(TEXT_TOP) - 6, sx(PLACEHOLDER_RIGHT), sx(TEXT_BOTTOM) + 6], fill=BAR_BG)

    size = max(10, round((TEXT_BOTTOM - TEXT_TOP) * scale * 0.86))
    font = ImageFont.truetype(FONT_PATH, size)
    text = PROMPT[:chars]

    baseline_y = sx((TEXT_TOP + TEXT_BOTTOM) // 2)
    if text:
        d.text((sx(TEXT_X), baseline_y), text, font=font, fill=(255, 255, 255), anchor="lm")

    if cursor_on:
        cx = sx(TEXT_X) + (d.textlength(text, font=font) if text else 0) + 3
        d.rectangle([cx, sx(CURSOR_TOP), cx + max(2, round(5 * scale)), sx(CURSOR_BOTTOM)], fill=CURSOR_COLOR)

    return img


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("empty")
    ap.add_argument("result")
    ap.add_argument("out")
    ap.add_argument("--gif")
    a = ap.parse_args()

    empty_src = Image.open(a.empty).convert("RGB")
    result_src = Image.open(a.result).convert("RGB")

    canvas_w, canvas_h = CANVAS
    screen_h = round(canvas_h * 0.90)
    scale = screen_h / empty_src.height
    screen_w = round(empty_src.width * scale)

    stage, (sx0, sy0), _ = build_stage(canvas_w, canvas_h, screen_w, screen_h)
    mask = Image.new("L", (screen_w, screen_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, screen_w, screen_h], radius=round(screen_w * 0.115), fill=255)

    empty = empty_src.resize((screen_w, screen_h), Image.LANCZOS)
    result_full = result_src.resize((screen_w, round(result_src.height * scale)), Image.LANCZOS)

    # --- zaman çizelgesi (saniye) -----------------------------------------
    T_IDLE, T_TYPE, T_HOLD, T_SEND, T_REVEAL, T_SCROLL, T_END = 0.9, 2.6, 0.7, 0.35, 0.8, 3.6, 1.6
    total = T_IDLE + T_TYPE + T_HOLD + T_SEND + T_REVEAL + T_SCROLL + T_END
    frames = round(total * FPS)

    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{canvas_w}x{canvas_h}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", a.out],
        stdin=subprocess.PIPE,
    )

    scroll_max = max(0, result_full.height - screen_h)

    for i in range(frames):
        t = i / FPS
        blink = (int(t * 2) % 2) == 0

        if t < T_IDLE:
            screen = typed_screen(empty, 0, blink, scale)
        elif t < T_IDLE + T_TYPE:
            p = (t - T_IDLE) / T_TYPE
            screen = typed_screen(empty, round(p * len(PROMPT)), True, scale)
        elif t < T_IDLE + T_TYPE + T_HOLD:
            screen = typed_screen(empty, len(PROMPT), blink, scale)
        elif t < T_IDLE + T_TYPE + T_HOLD + T_SEND:
            # gönderim: kısa beyaz parlama
            base = typed_screen(empty, len(PROMPT), False, scale)
            p = (t - (T_IDLE + T_TYPE + T_HOLD)) / T_SEND
            screen = Image.blend(base, Image.new("RGB", base.size, (255, 255, 255)), 0.12 * (1 - abs(p * 2 - 1)))
        else:
            after = t - (T_IDLE + T_TYPE + T_HOLD + T_SEND)
            if after < T_REVEAL:
                p = ease_out(after / T_REVEAL)
                screen = Image.blend(empty, result_full.crop((0, 0, screen_w, screen_h)), p)
            else:
                p = min(1.0, (after - T_REVEAL) / T_SCROLL)
                off = round(ease_out(p) * scroll_max)
                screen = result_full.crop((0, off, screen_w, off + screen_h))

        frame = stage.copy()
        frame.paste(screen, (sx0, sy0), mask)
        ff.stdin.write(frame.tobytes())

    ff.stdin.close()
    if ff.wait() != 0:
        sys.exit("ffmpeg hata verdi")
    print(f"  {a.out} · {frames} kare · {total:.1f} sn")

    if a.gif:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", a.out,
             "-vf", "fps=15,scale=520:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3",
             "-loop", "0", a.gif],
            check=True,
        )
        print(f"  {a.gif}")


if __name__ == "__main__":
    main()
