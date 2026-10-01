# Sahi Tareeqa backend

Standalone Express + SQLite API for verified Pakistani government process guides. It stores guides, outdated-information reports, and recent citizen confirmations. The public API is CORS-enabled for the GitHub Pages frontend and local development; the bundled `/admin/` page provides report triage and live guide editing.

## Run locally

Requires Node.js 18 or newer.

```bash
cd backend
npm install
cp .env.example .env
# Set ADMIN_TOKEN and/or ADMIN_PASSWORD in .env
npm start
```

The API starts on `http://localhost:4000`. `GET /api/health` is a simple health check. On first boot, the service creates `data/sahi.db` and its tables. If the database has no guides, it imports `seed/guides.json`; if that file is absent, empty, or unreadable, it inserts a sample guide. Seeding does not overwrite an existing database.

Open `http://localhost:4000/admin/` to use the small admin UI. Login requires `ADMIN_PASSWORD`. Direct API clients can send the configured `ADMIN_TOKEN` as a bearer token. When only `ADMIN_PASSWORD` is set, login returns a random token that remains valid until the process restarts.

Run the isolated end-to-end curl suite with:

```bash
npm run test:smoke
```

It starts a temporary server/database, exercises every required endpoint, verifies the five-confirmation freshness rule and admin authentication, and removes its temporary data afterward.

## Run with Docker

Docker Compose runs the API in a non-root, read-only Node 24 LTS container and stores SQLite in a named volume. No host Node.js installation is required.

```bash
cd backend
cp .env.example .env
# Replace the ADMIN_TOKEN and ADMIN_PASSWORD placeholders in .env.
docker compose up --build
```

The API and admin page are available at `http://localhost:4000/api/health` and `http://localhost:4000/admin/`. Change `HOST_PORT` in `.env` if port 4000 is occupied.

For live reload while editing `src/`, `seed/`, or `admin/`:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

Stop the containers while preserving SQLite data:

```bash
docker compose down
```

Delete the local SQLite volume and reseed from `seed/guides.json` on the next start:

```bash
docker compose down --volumes
```

Run the isolated container smoke test on port 4102:

```bash
./tests/docker-smoke.sh
```

The smoke test builds the image, verifies health and all seven seeded guides, stores a report, restarts the API to prove SQLite volume persistence, verifies admin login, and removes its temporary Compose project and volume.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | HTTP port; default `4000`. |
| `ADMIN_TOKEN` | Recommended | Long random bearer token for admin endpoints. |
| `ADMIN_PASSWORD` | For `/admin/` login | Password accepted by `POST /api/admin/login`. |
| `ADMIN_EMAIL` | For SMTP | Recipient for new-report alerts. |
| `SMTP_HOST` | For SMTP | SMTP server hostname. |
| `SMTP_PORT` | No | SMTP port; default `587`. |
| `SMTP_SECURE` | No | `true` for implicit TLS, otherwise `false`. |
| `SMTP_USER` | For SMTP | SMTP username. |
| `SMTP_PASS` | For SMTP | SMTP password. |
| `SMTP_FROM` | No | Alert sender address. |
| `DB_PATH` | No | Absolute SQLite path; default `backend/data/sahi.db`. Useful for a hosted persistent volume. |

If the complete SMTP configuration or `ADMIN_EMAIL` is missing, each report alert is logged to standard output. A report remains saved if SMTP delivery fails.

Generate secrets, for example, with `openssl rand -hex 32`. Never commit `.env`, the SQLite database, or real credentials.

## API behavior

- Guide JSON columns (`documents`, `steps`, `offices`, and `tips`) are returned as arrays, not encoded strings.
- Guide reads include `confirmations_30d`.
- The fifth confirmation within a rolling 30-day window updates `last_verified` to the current UTC date. Further confirmations keep that date current.
- Deleting a guide also deletes its reports and confirmations through SQLite foreign keys.
- All write values use bound SQL parameters. Request bodies are size-limited and validated; unknown API paths and failures return JSON errors.
- `POST /api/reports` allows 10 requests per IP per 15 minutes. `POST /api/confirmations` allows 30 per IP per minute. Login and all other POST requests also have limits.

## Curl examples

Set reusable shell variables:

```bash
API=http://localhost:4000
TOKEN=replace-with-your-admin-token
```

### Public guides

```bash
# All guides
curl "$API/api/guides"

# One guide
curl "$API/api/guides/cnic-renewal"
```

### Submit an outdated report

```bash
curl -X POST "$API/api/reports" \
  -H 'Content-Type: application/json' \
  -d '{
    "guideSlug": "cnic-renewal",
    "message": "The office requested a different fee.",
    "visitedOn": "2026-08-14",
    "city": "Lahore",
    "email": "citizen@example.com"
  }'
```

`visitedOn`, `city`, and `email` are optional. A successful response is `{"ok":true,"id":1}`.

### Confirm that a guide is still accurate

```bash
curl -X POST "$API/api/confirmations" \
  -H 'Content-Type: application/json' \
  -d '{"guideSlug":"cnic-renewal"}'
```

### Admin login

```bash
TOKEN=$(curl -sS -X POST "$API/api/admin/login" \
  -H 'Content-Type: application/json' \
  -d '{"password":"your-admin-password"}' \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).token))')
```

### List and update reports

```bash
# All reports; status can be new, reviewing, or fixed
curl "$API/api/admin/reports?status=new" \
  -H "Authorization: Bearer $TOKEN"

curl -X PATCH "$API/api/admin/reports/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"reviewing"}'
```

### Create, replace, and delete a guide

Admin guide creation and replacement accept the complete guide shape. Server-managed `created_at`, `updated_at`, and `confirmations_30d` values must be omitted.

```bash
curl -X POST "$API/api/admin/guides" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "slug":"cnic-example",
    "org":"Example Authority",
    "title":"Example CNIC Process",
    "summary":"A verified example process.",
    "last_verified":"2026-08-14",
    "source_label":"Official website",
    "source_url":"https://example.gov.pk/process",
    "fee":"Rs 100",
    "processing_time":"7 working days",
    "documents":["Original CNIC"],
    "steps":[{"title":"Apply","detail":"Submit the application at the counter."}],
    "offices":["District office"],
    "hours":"Monday–Friday, 9am–5pm",
    "collection":"Collect at the same office.",
    "tips":["Bring photocopies"]
  }'

curl -X PUT "$API/api/admin/guides/cnic-example" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "slug":"cnic-example",
    "org":"Example Authority",
    "title":"Updated CNIC Process",
    "summary":"An updated verified example process.",
    "last_verified":"2026-08-14",
    "source_label":"Official website",
    "source_url":"https://example.gov.pk/process",
    "fee":"Rs 150",
    "processing_time":"10 working days",
    "documents":["Original CNIC"],
    "steps":[{"title":"Apply","detail":"Submit the updated application at the counter."}],
    "offices":["District office"],
    "hours":"Monday–Friday, 9am–5pm",
    "collection":"Collect at the same office.",
    "tips":["Bring two photocopies"]
  }'

curl -X DELETE "$API/api/admin/guides/cnic-example" \
  -H "Authorization: Bearer $TOKEN"
```

## Deployment and SQLite persistence

SQLite must live on a persistent volume. Set `DB_PATH` to the mounted file (for example `/data/sahi.db`), run only one service replica, and back up the database regularly. A volume-backed SQLite service cannot be horizontally replicated safely.

Hosting policies change; the notes below were checked against provider documentation on 2026-08-14.

### Railway (free allowance)

Railway currently documents a $0 plan with $1 monthly credit and one 0.5 GB volume, which is the most direct free option for this small SQLite service.

1. Create a Railway project from the GitHub repository and set the service root directory to `/backend`.
2. Use `npm install` as the build command and `npm start` as the start command.
3. Attach a volume at `/data`; set `DB_PATH=/data/sahi.db`.
4. Add the admin and SMTP variables from `.env.example`, then generate a public domain.
5. Set the health-check path to `/api/health` and keep replicas at one.

See Railway's [current plan limits](https://docs.railway.com/pricing/plans) and [volume documentation](https://docs.railway.com/volumes/reference).

### Render

1. Create a Node web service, choose the repository, and set root directory `backend`, build command `npm install`, start command `npm start`, and health check `/api/health`.
2. Add the environment variables.
3. For durable SQLite, attach a persistent disk at `/var/data` and set `DB_PATH=/var/data/sahi.db`.

Important: Render's free web services have ephemeral filesystems and do not support persistent disks, so a free instance is suitable only for a disposable demo—reports and edits will be lost on a restart. Free services also block outbound SMTP ports 25, 465, and 587. Durable SQLite on Render requires a paid service/disk or a change to an external database. See Render's [free-service limitations](https://render.com/docs/free) and [persistent disk guide](https://render.com/docs/disks).

### Fly.io

1. Install `flyctl`, run `fly launch` from `backend`, and choose a single small Machine.
2. Create a volume, mount it at `/data` in `fly.toml`, and set `DB_PATH=/data/sahi.db`.
3. Add secrets with `fly secrets set ADMIN_TOKEN=... ADMIN_PASSWORD=...` plus the SMTP values, then deploy with `fly deploy`.
4. Keep one Machine attached to the volume and configure `/api/health` as the HTTP health check.

Fly.io no longer offers a general free allowance to new customers; Machines and persistent volumes are usage-billed. Consult [Fly.io pricing](https://fly.io/docs/about/pricing/) and its [SQLite volume pattern](https://fly.io/docs/rails/cookbooks/databases/) before deploying.

After any deployment, test `GET https://YOUR-API/api/health`, update the separate frontend integration to use that HTTPS base URL, and confirm the response includes `Access-Control-Allow-Origin: https://shahzadalidotnet.github.io` when called from the production site.
