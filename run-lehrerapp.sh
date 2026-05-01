#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4180}"
APP_DIR="/Users/acabrera/repos/Lehrerapp"

cd "$APP_DIR"

# Cerrar cualquier servidor viejo de Lehrerapp en puertos comunes
for p in 4173 4174 4175 4180 4190; do
  pid="$(lsof -ti tcp:$p || true)"
  if [[ -n "${pid}" ]]; then
    kill $pid || true
  fi
done

echo "Iniciando Lehrerapp actual desde: $APP_DIR"
echo "Puerto: $PORT"

LOG_FILE="$APP_DIR/.lehrerapp.log"
PID_FILE="$APP_DIR/.lehrerapp.pid"

if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
  nohup env ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" PORT="$PORT" node server.js > "$LOG_FILE" 2>&1 &
else
  nohup env PORT="$PORT" node server.js > "$LOG_FILE" 2>&1 &
fi

echo $! > "$PID_FILE"
sleep 1
if lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Lehrerapp iniciada en http://localhost:$PORT/Lehrerapp.html"
  echo "PID: $(cat "$PID_FILE")"
  echo "Log: $LOG_FILE"
else
  echo "No se pudo iniciar Lehrerapp. Revisá el log: $LOG_FILE"
  exit 1
fi
