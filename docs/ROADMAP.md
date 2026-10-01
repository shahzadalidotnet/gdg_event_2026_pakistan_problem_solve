# Sahi Tareeqa — Roadmap

Sahi Tareeqa is a community-maintained portal for Pakistani government processes
(CNIC, passport, license, attestation…). Every guide is dated, sourced, and
correctable by citizens.

**Status:** paused, waiting for contributors. If you want to help, open an issue
or pick anything under "Good first contributions" below.

## Where things stand

| Phase | Scope | Status |
|---|---|---|
| 1 — MVP | 7 hand-verified guides (NADRA, HEC, FBR, IBCC, ITP, Passport, Domicile), date-stamped + sourced | ✅ Live |
| 1b — Reach | English + Urdu (RTL), static SEO page per guide, sitemap | ✅ Done |
| 2 — Reports | In-app report form, reports stored with status, admin email alert | ✅ Backend live on Railway |
| 3 — Admin | Admin login, view/edit guides & reports without redeploy | 🟡 Partial — basic admin exists, editing flow needs work |
| 4 — Freshness | Community confirmations refresh "last verified"; monthly AI cross-check flags drift for human approval | 🟡 Confirmations done, AI re-check not started |

## Next up

1. **More guides** — biggest value. Candidates: birth certificate (NADRA B-form),
   vehicle registration/transfer, police character certificate, FRC, province-wise
   driving licenses (Punjab, Sindh, KP).
2. **Admin editing** — edit fees/steps/documents from the dashboard and publish.
3. **AI re-verification job** — monthly diff of each guide against its official
   source; opens a review item, never auto-publishes.
4. **Regenerate SEO pages in CI** — run `scripts/generate-seo.js` on every data
   change instead of by hand (it currently hardcodes today's date).

## Good first contributions

- Add or verify a guide (data lives in `assets/js/data.js` + `assets/js/data.ur.js`)
- Review Urdu translations
- RTL polish: tagline is forced LTR, back/forward arrows point the English way
- Restore the "How a guide stays verified" section on the Vision page (dropped in the i18n change)
- Compose: fail fast when `ADMIN_TOKEN` / `ADMIN_PASSWORD` are unset

## How to run

- Frontend: static — serve the repo root (`python3 -m http.server`)
- Backend: `cd backend && npm run docker:up` (see `backend/README.md`)
