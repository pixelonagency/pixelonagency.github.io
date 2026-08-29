#!/usr/bin/env bash
# Pixelon Otonom SEO Ajanı — gözetimsiz günlük koşu.
#
# Gözetimsiz bir Claude oturumunu launchd altında çalıştırır. Kimse izlemiyor, bu yüzden
# koruma promptla bırakılmaz; kabuk tarafında ZORLANIR:
#
#   1. Kilit      — daily/weekly/monthly koşuyorsa başlamaz
#   2. Bütçe      — `--max-budget-usd`, ilk hafta muhafazakâr
#   3. Süre       — perl alarm (macOS'ta `timeout` yok)
#   4. Araç sınırı— izinli araç listesi + yasaklı bash kalıpları
#   5. SON KAPI   — koşudan sonra üretim yollarına dokunulmuşsa DEĞİŞİKLİK GERİ ALINIR
#                   ve koşu FAILED işaretlenir. Ajanın sözüne güvenilmez, doğrulanır.
#
# Git push YOK, commit YOK. Onaylı değişiklikleri interaktif oturum commit eder.
set -uo pipefail

cd "$(dirname "$0")/../.."
ROOT="$(pwd)"
export PATH="$HOME/.bun/bin:$HOME/.nvm/versions/node/v24.19.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"

STAMP="$(TZ=Europe/Istanbul date +%Y-%m-%d)"
NOW="$(TZ=Europe/Istanbul date +%Y-%m-%dT%H:%M:%S%z)"
LOG_DIR="$ROOT/seo/logs"
LOCK_DIR="$LOG_DIR/.seo.lock"
LOG="$LOG_DIR/agent-$STAMP.log"
PRIVATE_STATE="$ROOT/seo/private/SEO_STATE.private.json"
mkdir -p "$LOG_DIR" "$ROOT/seo/private/drafts" "$ROOT/seo/private/reports"

# --- Ayarlanabilir sınırlar ---------------------------------------------------
BUDGET_USD="${SEO_AGENT_BUDGET_USD:-5.00}"   # ilk hafta muhafazakâr
TIMEOUT_SEC="${SEO_AGENT_TIMEOUT_SEC:-1800}" # 30 dakika
MAX_FAILURES=3                                # bu sayıdan sonra BLOCKED

# Üretim riski taşıyan yollar — ajan bunlara dokunamaz.
PROTECTED=(src public .github wrangler.jsonc package.json bun.lock astro.config.mjs knip.json)

log() { printf '[%s] %s\n' "$NOW" "$1" >>"$LOG"; }

# --- Kilit --------------------------------------------------------------------
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  OWNER="$(cat "$LOCK_DIR/pid" 2>/dev/null || echo '')"
  if [ -n "$OWNER" ] && kill -0 "$OWNER" 2>/dev/null; then
    log "ATLANDI — başka bir SEO işi çalışıyor (pid $OWNER, mod $(cat "$LOCK_DIR/mode" 2>/dev/null))"
    exit 0
  fi
  log "BAYAT KİLİT kırıldı (pid ${OWNER:-bilinmiyor} yaşamıyor)"
  rm -rf "$LOCK_DIR"; mkdir "$LOCK_DIR" 2>/dev/null || { log "ATLANDI — kilit alınamadı"; exit 0; }
fi
echo "$$" >"$LOCK_DIR/pid"; echo "agent" >"$LOCK_DIR/mode"
trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM

# --- Arka arkaya hata koruması -------------------------------------------------
# `bun -e` argv indeksi sürüme göre kayabiliyor ve sessizce yanlış argümanı okuyabiliyor
# (bir kez yaşandı: kökte `0` adlı dosya oluştu). Bu yüzden JSON okuma python ile yapılıyor.
FAILS=$(python3 -c "
import json,sys
try: print(json.load(open(sys.argv[1]))['scheduler']['agent'].get('consecutiveFailures',0))
except Exception: print(0)
" "$PRIVATE_STATE" 2>/dev/null || echo 0)
if [ "${FAILS:-0}" -ge "$MAX_FAILURES" ]; then
  log "BLOCKED — arka arkaya $FAILS hata. Sahip müdahalesi bekleniyor, koşu yapılmadı."
  exit 0
fi

# --- Koşu öncesi durum (son kapı için) -----------------------------------------
HEAD_BEFORE="$(git rev-parse HEAD)"
# Ham porcelain çıktısı saklanır: geri alma hash karşılaştırmasıyla değil, yol
# farkıyla yapılır. Sahibin koşu öncesinde zaten kirli olan dosyalarına
# dokunulmaması bunu gerektiriyor (bkz. scripts/seo/protected-paths.mjs).
PROTECTED_BEFORE_RAW="$(git status --porcelain -- "${PROTECTED[@]}")"
PROTECTED_BEFORE="$(printf '%s' "$PROTECTED_BEFORE_RAW" | shasum -a256 | cut -d' ' -f1)"
# Kök dizin dosya listesi. `bun -e` argv kayması bir kez kökte `0` adlı dosya
# üretmişti; kimse bakmadığı için fark edilmesi zor. Artık kapıda tutuluyor.
ROOT_FILES_BEFORE="$(ls -A1 | sort | shasum -a256 | cut -d' ' -f1)"

log "BAŞLADI pid=$$ bütçe=\$$BUDGET_USD süre=${TIMEOUT_SEC}s"

# --- Ajan ---------------------------------------------------------------------
# `perl -e alarm` kullanılıyor: macOS'ta GNU `timeout` yok.
perl -e "alarm $TIMEOUT_SEC; exec @ARGV" claude -p \
  --output-format json \
  --max-budget-usd "$BUDGET_USD" \
  --permission-mode dontAsk \
  --no-session-persistence \
  --allowedTools "Bash" "Read" "Write" "Edit" "Glob" "Grep" "WebSearch" "WebFetch" \
                 "mcp__claude_ai_Semrush__execute_report" "mcp__claude_ai_Semrush__get_report_schema" \
                 "mcp__claude_ai_Semrush__keyword_research" "mcp__claude_ai_Semrush__backlinks_research" \
                 "mcp__claude_ai_Semrush__organic_research" "mcp__claude_ai_Semrush__competitors_research" \
                 "mcp__claude_ai_Semrush__site_audit" "mcp__claude_ai_Semrush__domain_overview" \
  --disallowedTools "Bash(git push:*)" "Bash(git commit:*)" "Bash(gh workflow run:*)" \
                    "Bash(gh secret:*)" "Bash(wrangler:*)" "Bash(bunx wrangler:*)" \
                    "Bash(claude:*)" "Bash(launchctl:*)" "Bash(rm -rf:*)" \
  < "$ROOT/scripts/seo/agent-prompt.md" > "$LOG_DIR/agent-$STAMP.json" 2>>"$LOG"
CLAUDE_EXIT=$?
log "ajan bitti exit=$CLAUDE_EXIT"

# --- SON KAPI: üretim yollarına dokunuldu mu? ----------------------------------
VIOLATION=""
HEAD_AFTER="$(git rev-parse HEAD)"
PROTECTED_AFTER_RAW="$(git status --porcelain -- "${PROTECTED[@]}")"
PROTECTED_AFTER="$(printf '%s' "$PROTECTED_AFTER_RAW" | shasum -a256 | cut -d' ' -f1)"

[ "$HEAD_BEFORE" != "$HEAD_AFTER" ] && VIOLATION="commit yapıldı ($HEAD_BEFORE → $HEAD_AFTER)"
if [ "$PROTECTED_BEFORE" != "$PROTECTED_AFTER" ]; then
  VIOLATION="${VIOLATION:+$VIOLATION; }korunan yollar değişti"

  # CERRAHİ GERİ ALMA — yalnızca koşu SIRASINDA yeni kirlenen yollar.
  # Toptan `git checkout -- src public` sahibin commit'lenmemiş işini de
  # siliyordu; 29 Ağu 2026'da o yollarda sahibe ait 137 dosya duruyordu.
  # Girdi ortam değişkeniyle geçilir, argv ile değil — `bun -e` argv kayması
  # riski (bkz. yukarıdaki FAILS notu) bu yolla tamamen dışarıda kalır.
  AGENT_PATHS="$(
    PROTECTED_BEFORE_RAW="$PROTECTED_BEFORE_RAW" PROTECTED_AFTER_RAW="$PROTECTED_AFTER_RAW" \
      bun scripts/seo/protected-paths.mjs 2>>"$LOG"
  )"

  OWNER_COUNT="$(printf '%s' "$PROTECTED_BEFORE_RAW" | grep -c . || true)"
  if [ "$OWNER_COUNT" -gt 0 ]; then
    log "NOT — korunan yollarda sahibe ait $OWNER_COUNT commit'lenmemiş dosya var; onlara DOKUNULMADI."
  fi

  if [ -n "$AGENT_PATHS" ]; then
    log "İHLAL — ajanın kirlettiği yollar geri alınıyor:"
    printf '%s\n' "$AGENT_PATHS" >>"$LOG"
    printf '%s\n' "$AGENT_PATHS" | tr '\n' '\0' | xargs -0 git checkout -- 2>>"$LOG" || true
    printf '%s\n' "$AGENT_PATHS" | tr '\n' '\0' | xargs -0 git clean -fd -- 2>>"$LOG" || true
  else
    log "İHLAL — korunan yollar değişti ama yeni kirlenen yol yok; sahibin mevcut dosyaları değişmiş olabilir. Geri alma YAPILMADI, sahip incelemeli."
  fi
fi
# Taslak src/content'e sızmış mı?
if git status --porcelain -- src/content | grep -q .; then
  VIOLATION="${VIOLATION:+$VIOLATION; }src/content'e yazıldı"
fi
# Kökte beklenmeyen dosya oluştu mu?
ROOT_FILES_AFTER="$(ls -A1 | sort | shasum -a256 | cut -d' ' -f1)"
if [ "$ROOT_FILES_BEFORE" != "$ROOT_FILES_AFTER" ]; then
  NEWROOT="$(git status --porcelain --untracked-files=all -- ':(top)*' 2>/dev/null | grep -E '^\?\? [^/]+$' | sed 's/^?? //' | tr '\n' ' ')"
  VIOLATION="${VIOLATION:+$VIOLATION; }kök dizinde beklenmeyen dosya: ${NEWROOT:-bilinmiyor}"
  log "İHLAL — kökte yeni dosya: ${NEWROOT:-bilinmiyor}"
fi

if [ -n "$VIOLATION" ]; then
  log "SINIR İHLALİ: $VIOLATION — koşu FAILED sayıldı, değişiklikler geri alındı"
  CLAUDE_EXIT=90
fi

# --- Maliyet ve kayıt ----------------------------------------------------------
COST=$(python3 -c "
import json,sys
try: print('%.4f' % (json.load(open(sys.argv[1])).get('total_cost_usd') or 0))
except Exception: print('0')
" "$LOG_DIR/agent-$STAMP.json" 2>/dev/null || echo 0)
log "maliyet=\$$COST"

bun "$ROOT/scripts/seo/record-run.mjs" "$PRIVATE_STATE" "agent" "$CLAUDE_EXIT" "$NOW" "$LOG" \
  "$COST" "$BUDGET_USD" "$VIOLATION" >>"$LOG" 2>&1

# Koşu metrikleri — bütçe ayarı için gerçek veri
python3 -c "
import json,sys
try:
    d=json.load(open(sys.argv[1]))
    print('turns=%s duration=%.1fdk cost=\$%.4f' % (d.get('num_turns'), (d.get('duration_ms') or 0)/60000, d.get('total_cost_usd') or 0))
except Exception as e: print('metrik okunamadı:', e)
" "$LOG_DIR/agent-$STAMP.json" >>"$LOG" 2>&1

log "BİTTİ exit=$CLAUDE_EXIT"
exit 0   # başarısız koşu launchd'i throttle etmesin
