#!/bin/bash
# Cài môi trường cho phiên Claude Code trên cloud để `npm run check` chạy được ngay.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# `npm ci` không ghi lại package-lock.json (npm 10 của phiên cloud bỏ trường `libc` do npm 12 ghi).
npm ci --no-audit --no-fund

if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q -r requirements-dev.txt

npm run pyodide:copy

# Phiên cloud có sẵn Chromium tại /opt/pw-browsers nhưng có thể cũ hơn bản
# Playwright cần; không chạy `playwright install` mà trỏ thẳng tới bản có sẵn.
if [ -x /opt/pw-browsers/chromium ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export PW_CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi
