#!/usr/bin/env python3
"""
Favicon setini `public/favicon.svg` geometrisinden üretir.

Neden var: Google'ın favicon dokümanı "geçerli herhangi bir favicon formatı" diyor
ancak SVG'yi AÇIKÇA saymıyor. Arama sonucundaki site simgesini yalnızca SVG'ye
bırakmak garanti değil, bu yüzden yanına raster geri düşüşler konuyor.

Neden rasterleştirici yok: kaynak SVG beş şekilden ibaret (yuvarlatılmış zemin +
dört kare). Şekiller burada birebir yeniden çizilir; rsvg/ImageMagick bağımlılığı
eklemeye değmez. Kaynak SVG değişirse SHAPES ve BG buna göre güncellenmelidir.

Çalıştırma (tek seferlik, build'in parçası DEĞİL):
    python3 scripts/favicon.py

Üretilenler:
    public/favicon.ico          16/32/48/64/128/256 — Google kare ve >=48px istiyor
    public/favicon-96x96.png    96x96
    public/apple-touch-icon.png 180x180, KÖŞESİZ (iOS kendi maskesini uygular;
                                köşeyi biz de yuvarlarsak çift yuvarlama olur)
"""

from PIL import Image, ImageDraw

# --- kaynak: public/favicon.svg -------------------------------------------------
VIEWBOX = 64
BG = (0x0A, 0x0A, 0x0A, 255)  # --bg
LIME = (0xCF, 0xFF, 0x00)  # --accent
CORNER_RADIUS = 14
# (x, y, alpha) — çaprazlar tam opak, diğer ikisi SVG'deki opacity=".55"
SHAPES = ((14, 14, 255), (32, 14, 140), (14, 32, 140), (32, 32, 255))
SQUARE = 14

SUPERSAMPLE = 8  # önce büyük çiz, sonra küçült — kenarlar yumuşasın


def render(size: int, *, rounded: bool) -> Image.Image:
    n = size * SUPERSAMPLE
    k = n / VIEWBOX
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if rounded:
        draw.rounded_rectangle([0, 0, n - 1, n - 1], radius=CORNER_RADIUS * k, fill=BG)
    else:
        draw.rectangle([0, 0, n - 1, n - 1], fill=BG)

    for x, y, alpha in SHAPES:
        layer = Image.new("RGBA", (n, n), (0, 0, 0, 0))
        ImageDraw.Draw(layer).rectangle(
            [x * k, y * k, (x + SQUARE) * k - 1, (y + SQUARE) * k - 1],
            fill=(*LIME, alpha),
        )
        img = Image.alpha_composite(img, layer)

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    render(256, rounded=True).save(
        "public/favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )
    render(96, rounded=True).save("public/favicon-96x96.png", format="PNG", optimize=True)
    render(180, rounded=False).convert("RGB").save(
        "public/apple-touch-icon.png", format="PNG", optimize=True
    )
    print("favicon.ico · favicon-96x96.png · apple-touch-icon.png yazıldı")


if __name__ == "__main__":
    main()
