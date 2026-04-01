#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  echo ".env fehlt. Lege zuerst eine .env im Projektroot an."
  exit 1
fi

if [[ ! -x "./.venv/Scripts/python.exe" ]]; then
  echo "Python in .venv wurde nicht gefunden."
  exit 1
fi

if [[ ! -x "./.venv/Scripts/alembic.exe" ]]; then
  echo "Alembic wurde in der .venv nicht gefunden. Installiere es zuerst."
  echo "Befehl: ./.venv/Scripts/python.exe -m pip install alembic"
  exit 1
fi

echo "Migrationen werden angewendet..."
./.venv/Scripts/alembic.exe upgrade head

echo "Backend startet auf http://127.0.0.1:8000 ..."
./.venv/Scripts/python.exe -m uvicorn app.main:app --reload
