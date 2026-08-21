#!/usr/bin/env bash
# Pixelon SEO — zamanlayıcı giriş noktası.
# launchd/cron ortamında PATH sınırlı olduğu için bun mutlak yoldan çözülür.
set -euo pipefail
cd "$(dirname "$0")/../.."
export PATH="$HOME/.bun/bin:$HOME/.nvm/versions/node/v24.19.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
MODE="${1:-daily}"
mkdir -p seo/logs
exec bun "scripts/seo/daily.mjs" "$MODE"
