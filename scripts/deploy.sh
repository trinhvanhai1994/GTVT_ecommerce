#!/usr/bin/env bash
# Thin wrapper → scripts/ops-deploy.sh full
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --restart-only|-RestartOnly) ARGS+=(--restart-only) ;;
    --skip-maven|-SkipMaven) ARGS+=(--skip-maven) ;;
    -h|--help) exec "$ROOT/ops-deploy.sh" --help ;;
    *) ARGS+=("$1") ;;
  esac
  shift
done
exec "$ROOT/ops-deploy.sh" full "${ARGS[@]+"${ARGS[@]}"}"
