#!/bin/sh
cd "$(dirname "$0")" || exit 1

if ! command -v docker >/dev/null 2>&1; then
  echo "Instale o Docker e deixe ele aberto. Depois rode este script de novo."
  exit 1
fi

docker compose up -d || exit 1

echo ""
echo "Gw2 Event Timer esta no ar: http://localhost:8094"
