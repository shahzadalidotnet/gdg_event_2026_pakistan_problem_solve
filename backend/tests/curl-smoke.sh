#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEST_PORT="${TEST_PORT:-4101}"
BASE_URL="http://localhost:${TEST_PORT}"
ADMIN_TOKEN="smoke-test-token"
ADMIN_PASSWORD="smoke-test-password"
GUIDE_SLUG="cnic-renewal"
TEMP_DIR="$(mktemp -d)"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]]; then kill "$SERVER_PID" 2>/dev/null || true; fi
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

cd "$BACKEND_DIR"
PORT="$TEST_PORT" DB_PATH="$TEMP_DIR/sahi.db" ADMIN_TOKEN="$ADMIN_TOKEN" \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" node src/server.js >"$TEMP_DIR/server.log" 2>&1 &
SERVER_PID=$!

READY=false
for _ in {1..40}; do
  if curl -fsS "$BASE_URL/api/health" >/dev/null 2>&1; then READY=true; break; fi
  sleep 0.25
done
if [[ "$READY" != "true" ]]; then
  echo "Server did not become ready:" >&2
  sed -n '1,120p' "$TEMP_DIR/server.log" >&2
  exit 1
fi
curl -fsS "$BASE_URL/api/health" >/dev/null

echo "CORS and admin page"
curl -fsS -D - -o /dev/null -H 'Origin: https://shahzadalidotnet.github.io' "$BASE_URL/api/guides" \
  | grep -qi '^access-control-allow-origin: https://shahzadalidotnet.github.io'
if curl -fsS -D - -o /dev/null -H 'Origin: https://untrusted.example' "$BASE_URL/api/guides" \
  | grep -qi '^access-control-allow-origin:'; then
  echo "Unexpected CORS permission for an untrusted origin" >&2
  exit 1
fi
curl -fsS "$BASE_URL/admin/" | grep -q 'Sahi Tareeqa Admin'

echo "GET /api/guides"
curl -fsS "$BASE_URL/api/guides" | node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(!Array.isArray(x)||x.length!==7)process.exit(1)'

echo "GET /api/guides/:slug"
curl -fsS "$BASE_URL/api/guides/$GUIDE_SLUG" | GUIDE_SLUG="$GUIDE_SLUG" node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(x.slug!==process.env.GUIDE_SLUG||!Array.isArray(x.steps))process.exit(1)'

echo "POST /api/reports"
REPORT_JSON="$(curl -fsS -X POST "$BASE_URL/api/reports" -H 'Content-Type: application/json' \
  -d "{\"guideSlug\":\"$GUIDE_SLUG\",\"message\":\"The fee shown at the office was different.\",\"visitedOn\":\"2026-08-14\",\"city\":\"Lahore\",\"email\":\"citizen@example.com\"}")"
REPORT_ID="$(printf '%s' "$REPORT_JSON" | node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(!x.ok||!x.id)process.exit(1);process.stdout.write(String(x.id))')"
grep -q '\[email fallback\]' "$TEMP_DIR/server.log"

echo "POST /api/confirmations (freshness threshold)"
for expected in 1 2 3 4 5; do
  curl -fsS -X POST "$BASE_URL/api/confirmations" -H 'Content-Type: application/json' \
    -d "{\"guideSlug\":\"$GUIDE_SLUG\"}" | EXPECTED="$expected" node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(!x.ok||x.count30d!==Number(process.env.EXPECTED))process.exit(1)'
done
TODAY="$(date -u +%F)"
curl -fsS "$BASE_URL/api/guides/$GUIDE_SLUG" | TODAY="$TODAY" node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(x.confirmations_30d!==5||x.last_verified!==process.env.TODAY)process.exit(1)'

echo "Admin bearer token is required"
UNAUTHORIZED_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/admin/reports")"
[[ "$UNAUTHORIZED_STATUS" == "401" ]]

echo "POST /api/admin/login"
LOGIN_TOKEN="$(curl -fsS -X POST "$BASE_URL/api/admin/login" -H 'Content-Type: application/json' \
  -d '{"password":"smoke-test-password"}' | node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(!x.token)process.exit(1);process.stdout.write(x.token)')"
[[ "$LOGIN_TOKEN" == "$ADMIN_TOKEN" ]]

echo "GET /api/admin/reports?status=new"
curl -fsS "$BASE_URL/api/admin/reports?status=new" -H "Authorization: Bearer $ADMIN_TOKEN" | REPORT_ID="$REPORT_ID" node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(!x.some(r=>r.id===Number(process.env.REPORT_ID)))process.exit(1)'

echo "PATCH /api/admin/reports/:id"
curl -fsS -X PATCH "$BASE_URL/api/admin/reports/$REPORT_ID" -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' -d '{"status":"reviewing"}' | node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(!x.ok)process.exit(1)'

GUIDE_CREATE='{"slug":"smoke-guide","org":"Test Office","title":"Smoke Guide","summary":"A guide created by the smoke test.","last_verified":"2026-08-14","source_label":"Official test source","source_url":"https://example.gov.pk/process","fee":"Rs 100","processing_time":"One day","documents":["CNIC"],"steps":[{"title":"Apply","detail":"Submit the form."}],"offices":["Test office"],"hours":"9am–5pm","collection":"Collect at the counter","tips":["Bring a copy"]}'
GUIDE_UPDATE='{"slug":"smoke-guide","org":"Test Office","title":"Updated Smoke Guide","summary":"An updated guide created by the smoke test.","last_verified":"2026-08-14","source_label":"Official test source","source_url":"https://example.gov.pk/process","fee":"Rs 150","processing_time":"Two days","documents":["CNIC"],"steps":[{"title":"Apply","detail":"Submit the updated form."}],"offices":["Test office"],"hours":"9am–5pm","collection":"Collect at the counter","tips":["Bring two copies"]}'

echo "POST /api/admin/guides"
curl -fsS -X POST "$BASE_URL/api/admin/guides" -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' -d "$GUIDE_CREATE" | node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(x.slug!=="smoke-guide")process.exit(1)'

echo "PUT /api/admin/guides/:slug"
curl -fsS -X PUT "$BASE_URL/api/admin/guides/smoke-guide" -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' -d "$GUIDE_UPDATE" | node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(x.title!=="Updated Smoke Guide")process.exit(1)'

echo "DELETE /api/admin/guides/:slug"
curl -fsS -X DELETE "$BASE_URL/api/admin/guides/smoke-guide" -H "Authorization: Bearer $ADMIN_TOKEN" | node -e 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0));if(!x.ok)process.exit(1)'

echo "All curl smoke tests passed."
