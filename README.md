# Sahi Tareeqa — سہی طریقہ

**The right way to do it — dated & sourced.**

A single trusted portal for Pakistani government processes (CNIC, passport, driving licence, degree attestation, NTN, domicile, IBCC). Every guide is **date-stamped**, **linked to its official source**, and **correctable by any citizen** who spots an error.

Built for **GDG Live Pakistan · Pakistan @79** — theme: *solve a Pakistani issue*.

## The problem
YouTube videos go stale and blogs never tell you *when* they were written. When you actually reach the office, the fee has changed, the timing is wrong, and the document list online doesn't match what the counter asks for. You waste a whole day.

## What it does
- **Step-by-step guides** for NADRA, ITP, HEC, DGIP, FBR, Domicile and IBCC.
- **Freshness badge** on every guide (green / yellow / red by age).
- **Reality check** — the on-the-ground truth: real office hours, "submit-in-morning / collect-in-evening" patterns, and what's *actually* required at the counter.
- **Report by email** + a **community-confirmation** preview to keep guides fresh.
- **Vision & Roadmap** page describing how it scales into a self-maintaining service.

## Tech
Vanilla **HTML + CSS + JS** — no build step, no framework, no dependencies — hosted on **GitHub Pages**. Hash routing gives each guide a shareable URL. The code is split into small, single-responsibility modules:

```
index.html                 # markup only — links the stylesheet and scripts
assets/
  css/styles.css           # all styling (Pakistan @79 theme tokens)
  img/og-cover.svg         # social share cover image
  js/
    config.js              # settings: ADMIN_EMAIL, API_BASE flag, TODAY
    utils.js               # freshness + date helpers
    data.js                # seed guide content (static source of truth / fallback)
    api.js                 # data-access seam: static seed OR live backend + fallback
    views.js               # rendering (home grid, guide detail, roadmap)
    app.js                 # state, hash routing, bootstrap
backend/                   # REST API + SQLite (separate service, in progress)
```

**Static ↔ live in one flag.** `api.js` is the only seam between the UI and its data. Leave `CONFIG.API_BASE` empty and the app runs fully static (seed data, email reports, local confirmations). Set it to the deployed backend origin and the same UI fetches live guides and posts real reports/confirmations — with automatic fallback to seed data if the API is unreachable, so a demo never breaks.

## Roadmap (see the in-app Vision & Roadmap page)
1. **MVP (shipped)** — hand-verified, dated, sourced guides.
2. **Capture & track** — in-app report form, backend database, admin email alerts.
3. **Admin without redeploys** — dashboard to edit and publish content instantly.
4. **Proactive freshness** — community confirmations + AI re-verification (human-approved) so guides stay current *before* they break.

---
*Content is community-maintained sample data — always confirm fees on the official portal before you go.*
