#!/usr/bin/env bash
# Brings the scheduler clone (the separate checkout launchd runs from) up to date with origin/main.
#
# Why: the launchd jobs run from a separate clone so they never disturb the
# owner's working tree. Nothing ever pulled that clone, so from 18 Sep to
# 31 Oct 2026 every scheduled run used six-week-old code and data.
#
# Only a fast-forward is allowed. A diverged clone (a local commit that was
# never pushed) is left exactly as it is, the failure is logged and the
# script exits non-zero so the caller can say so in its own log.
#
# Usage: sync-clone.sh <log file>
set -uo pipefail

cd "$(dirname "$0")/../.."
LOG="${1:?usage: sync-clone.sh <log file>}"
NOW="$(TZ=Europe/Istanbul date +%Y-%m-%dT%H:%M:%S%z)"
log() { printf '[%s] %s\n' "$NOW" "$1" >>"$LOG"; }

BEFORE="$(git rev-parse --short HEAD)"
if ! OUT="$(git fetch -q origin main 2>&1 && git merge --ff-only -q origin/main 2>&1)"; then
  log "SENKRON BAŞARISIZ (HEAD $BEFORE kaldı): $(printf '%s' "$OUT" | tr '\n' ' ')"
  exit 1
fi
log "SENKRON OK $BEFORE -> $(git rev-parse --short HEAD)"
