#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="sahi-tareeqa-smoke-$$"
HOST_PORT="${TEST_PORT:-4102}"
BASE_URL="http://127.0.0.1:${HOST_PORT}"
COMPOSE=(docker compose --project-name "$PROJECT_NAME" --file "$BACKEND_DIR/compose.yaml")

cleanup() {
  "${COMPOSE[@]}" down --volumes --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

export HOST_PORT
export ADMIN_TOKEN="docker-smoke-token"
export ADMIN_PASSWORD="docker-smoke-password"

"${COMPOSE[@]}" up --build --detach

READY=false
for _ in {1..120}; do
  if curl -fsS "$BASE_URL/api/health" >/dev/null 2>&1; then READY=true; break; fi
  sleep 0.5
done
if [[ "$READY" != "true" ]]; then
  "${COMPOSE[@]}" logs api >&2
  exit 1
fi

echo "Docker health check"
curl -fsS "$BASE_URL/api/health" | grep -q '"ok":true'

echo "Docker seeded guides"
"${COMPOSE[@]}" exec -T api node -e \
  "fetch('http://127.0.0.1:4000/api/guides').then(r=>r.json()).then(x=>{if(x.length!==7)process.exit(1)})"

echo "Docker report persistence"
curl -fsS -X POST "$BASE_URL/api/reports" -H 'Content-Type: application/json' \
  -d '{"guideSlug":"cnic-renewal","message":"Docker smoke test report."}' | grep -q '"ok":true'
"${COMPOSE[@]}" restart api >/dev/null
READY=false
for _ in {1..60}; do
  if curl -fsS "$BASE_URL/api/health" >/dev/null 2>&1; then READY=true; break; fi
  sleep 0.5
done
if [[ "$READY" != "true" ]]; then
  "${COMPOSE[@]}" logs api >&2
  exit 1
fi
"${COMPOSE[@]}" exec -T api node -e \
  "fetch('http://127.0.0.1:4000/api/admin/reports',{headers:{authorization:'Bearer docker-smoke-token'}}).then(r=>r.json()).then(x=>{if(!Array.isArray(x)||x.length!==1)process.exit(1)})"

echo "Docker admin login"
curl -fsS -X POST "$BASE_URL/api/admin/login" -H 'Content-Type: application/json' \
  -d '{"password":"docker-smoke-password"}' | grep -q '"token":"docker-smoke-token"'

echo "Docker smoke tests passed."
