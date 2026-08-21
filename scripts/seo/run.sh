#!/usr/bin/env bash
# Pixelon SEO — zamanlayıcı giriş noktası (launchd).
#
# Sorumlulukları:
#   1. launchd'in sınırlı PATH'inde bun'ı mutlak yoldan çözmek
#   2. Aynı anda iki SEO işinin çalışmasını KİLİTLE engellemek
#   3. Mod başına tarihli log tutmak ve exit code'u kaydetmek
#   4. Son başarılı koşuyu gizli state'e yazmak
#
# Kilit tasarımı: `mkdir` atomiktir. Kilit alınamazsa iş SESSİZCE ATLANIR ve exit 0 döner —
# başarısız/atlanan bir koşu launchd'i geri çekilmeye (throttle) itmemeli, ertesi günkü
# daily koşusu bundan etkilenmemeli.
#
# Bayat kilit koruması: kilidi tutan PID yaşamıyorsa kilit kırılır. Aksi hâlde çöken bir
# koşu tüm zamanlanmış işleri kalıcı olarak susturur.
set -uo pipefail

cd "$(dirname "$0")/../.."
ROOT="$(pwd)"
export PATH="$HOME/.bun/bin:$HOME/.nvm/versions/node/v24.19.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

MODE="${1:-daily}"
LOG_DIR="$ROOT/seo/logs"
LOCK_DIR="$ROOT/seo/logs/.seo.lock"
PRIVATE_STATE="$ROOT/seo/private/SEO_STATE.private.json"
mkdir -p "$LOG_DIR" "$ROOT/seo/private"

STAMP="$(TZ=Europe/Istanbul date +%Y-%m-%d)"
NOW="$(TZ=Europe/Istanbul date +%Y-%m-%dT%H:%M:%S%z)"
LOG="$LOG_DIR/$MODE-$STAMP.log"

log() { printf '[%s] %s\n' "$NOW" "$1" >>"$LOG"; }

# --- Kilit -------------------------------------------------------------------
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  OWNER="$(cat "$LOCK_DIR/pid" 2>/dev/null || echo '')"
  if [ -n "$OWNER" ] && kill -0 "$OWNER" 2>/dev/null; then
    log "ATLANDI — başka bir SEO işi çalışıyor (pid $OWNER)"
    exit 0
  fi
  log "BAYAT KİLİT kırıldı (pid ${OWNER:-bilinmiyor} yaşamıyor)"
  rm -rf "$LOCK_DIR"
  mkdir "$LOCK_DIR" 2>/dev/null || { log "ATLANDI — kilit alınamadı"; exit 0; }
fi
echo "$$" >"$LOCK_DIR/pid"
echo "$MODE" >"$LOCK_DIR/mode"
trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM

# --- Koşu --------------------------------------------------------------------
log "BAŞLADI mode=$MODE pid=$$"

# GSC verisi her koşuda tazelenir; başarısız olursa koşu yine de devam eder
# (sources.mjs eldeki en güncel veriyle çalışır, tahmin üretmez).
if bun "$ROOT/scripts/seo/gsc.mjs" >>"$LOG" 2>&1; then
  log "GSC çekimi OK"
else
  log "GSC çekimi BAŞARISIZ (exit $?) — eldeki veriyle devam ediliyor"
fi

bun "$ROOT/scripts/seo/daily.mjs" "$MODE" >>"$LOG" 2>&1
EXIT_CODE=$?
log "BİTTİ mode=$MODE exit=$EXIT_CODE"

# --- Sonucu gizli state'e yaz ------------------------------------------------
bun "$ROOT/scripts/seo/record-run.mjs" "$PRIVATE_STATE" "$MODE" "$EXIT_CODE" "$NOW" "$LOG" >>"$LOG" 2>&1

# Başarısız koşu launchd'i throttle etmesin; hata log'a yazıldı.
exit 0
