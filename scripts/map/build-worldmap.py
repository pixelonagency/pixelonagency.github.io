"""Pixelon dünya haritası — gerçek Natural Earth sınırlarından nokta ızgarası.

Projeksiyon BİZİM kontrolümüzde olduğu için pin konumları tahmin değil tam
hesaptır. Kalibrasyon sabitleri (W, LAT_TOP, LAT_BOTTOM) src/lib/map-pins.ts
ile BİREBİR AYNI olmalıdır — biri değişirse pinler haritadan kayar.

Kullanım:
    curl -sL -o /tmp/ne.geojson \
      https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
    python3 scripts/map/build-worldmap.py
"""

import json
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

NE_PATH = os.environ.get('NE_GEOJSON', '/tmp/ne.geojson')



W = 2400
LAT_TOP, LAT_BOTTOM = 84.0, -58.0      # Antarktika kırpılır
PPD = W / 360.0                        # derece başına piksel = 6.6667
H = round((LAT_TOP - LAT_BOTTOM) * PPD)

def project(lon, lat):
    return (lon + 180.0) * PPD, (LAT_TOP - lat) * PPD

# Pixelon'ın kampanya yürüttüğü 23 pazar (içerik dosyasındaki listeyle aynı)
OURS = {'TR','DE','NL','FR','BE','GB','AT','CH','IT','ES','RO','BG','RU','AZ',
        'IQ','SA','AE','QA','KW','LY','MA','US','CD'}

data = json.load(open(NE_PATH))
land = Image.new('L', (W, H), 0)
ours = Image.new('L', (W, H), 0)
dl, do = ImageDraw.Draw(land), ImageDraw.Draw(ours)

def rings(geom):
    t, c = geom['type'], geom['coordinates']
    if t == 'Polygon':
        yield c[0]
    elif t == 'MultiPolygon':
        for poly in c:
            yield poly[0]

for feat in data['features']:
    iso = feat['properties'].get('ISO_A2') or feat['properties'].get('ISO_A2_EH')
    mine = iso in OURS
    for ring in rings(feat['geometry']):
        lons = [p[0] for p in ring]
        # 180° meridyenini aşan halkalar (Rusya, Fiji) iki kopya çizilerek kapatılır
        shifts = [0.0]
        if max(lons) - min(lons) > 180:
            shifts = [0.0, 360.0, -360.0]
            ring = [(p[0] + 360.0 if p[0] < 0 else p[0], p[1]) for p in ring]
        for sh in shifts:
            pts = [project(p[0] + sh, p[1]) for p in ring]
            if len(pts) < 3:
                continue
            dl.polygon(pts, fill=255)
            if mine:
                do.polygon(pts, fill=255)

land_px, ours_px = land.load(), ours.load()

# --- nokta ızgarası ---------------------------------------------------------
STEP, R = 7, 2.35
# Zemin SAYDAM: harita bölümün kendi zemini üzerinde durmalı. Önceki sürüm
# okyanusu (5,5,5) ile dolduruyordu ve site zemini (#0A0A0A) ile birebir
# tutmadığı için harita sayfada koyu bir dikdörtgen kutu gibi görünüyordu.
canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(canvas)
dg = ImageDraw.Draw(glow)
n_land = n_ours = 0
for gy in range(0, H, STEP):
    for gx in range(0, W, STEP):
        if not land_px[gx, gy]:
            continue
        n_land += 1
        if ours_px[gx, gy]:
            n_ours += 1
            col = (150, 178, 34, 255)
            dg.ellipse([gx-R-1, gy-R-1, gx+R+1, gy+R+1], fill=(150, 178, 34, 105))
        else:
            col = (86, 92, 80, 255)
        d.ellipse([gx-R, gy-R, gx+R, gy+R], fill=col)

# Pazarların altına yumuşak parıltı; noktalar parıltının üstüne biner.
glow = glow.filter(ImageFilter.GaussianBlur(11))
out = Image.alpha_composite(glow, canvas)

OUT_PATH = Path(__file__).resolve().parents[2] / 'src' / 'assets' / 'images' / 'worldmap-dotted.webp'
out.save(OUT_PATH, 'WEBP', quality=88, method=6)
print(f'harita {W}x{H} | kara noktası {n_land} | pazar noktası {n_ours}')
print(f'KALİBRASYON  PPD={PPD}  LAT_TOP={LAT_TOP}  W={W} H={H}')
