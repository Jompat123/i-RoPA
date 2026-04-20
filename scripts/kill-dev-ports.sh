#!/usr/bin/env bash
# หยุดโปรเซสที่ฟังพอร์ต dev ของ Next.js (มักชนเมื่อเปิด npm run dev ซ้ำ)
set -euo pipefail
PORTS="${DEV_PORTS:-3000 3001 3002}"
for port in $PORTS; do
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "${pids:-}" ]; then
    echo "Stopping process(es) on port $port: $pids"
    kill $pids 2>/dev/null || kill -9 $pids 2>/dev/null || true
  fi
done
echo "Done."
