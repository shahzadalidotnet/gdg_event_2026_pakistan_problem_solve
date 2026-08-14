# Sahi Tareeqa — Pitch Notes

**Live:** https://shahzadalidotnet.github.io/gdg_event_2026_pakistan_problem_solve/
**Theme:** GDG Live Pakistan · Pakistan @79 · *solve a Pakistani issue*

---

## The one-liner
> Every Pakistani has wasted a day at a government office because the "steps" they found online were outdated. **Sahi Tareeqa** is one trusted portal where every process is dated, sourced, and kept fresh by the people who actually go there.

## The problem (say this first)
YouTube videos go stale and blogs never tell you *when* they were written. You show up at the office and the fee changed, the timings were wrong, and the counter asks for a document no website mentioned. **The information isn't missing — it's just untrustworthy.**

## The insight that makes us different
Official sites tell you the *policy*. We tell you the *reality*:
- **Real office hours** — not Google's wrong listing.
- **How collection actually works** — e.g. IBCC: submit in the morning, come back the *same evening* to collect.
- **What's actually required** at the counter vs the vague online list.

Every guide is **date-stamped**, **linked to its official source**, and **correctable in one tap**.

---

## 60-second demo script
1. **Open the live URL.** "Every guide shows when it was last verified and links to the official source — unlike anything else out there."
2. **Search "IBCC" → open it.** Scroll to the gold **Reality check** box. "This is the part no official site tells you: counters stop taking files before closing, submit-morning/collect-evening, bring extra CNIC copies."
3. **Point at the three quick-facts** (fee, processing time, verified office hours). "Concrete, current, and dated 14 Aug 2026."
4. **Click 👍 "I did this recently — still accurate."** "Citizens keep guides fresh — freshness *earned* by real visits, not assumed."
5. **Click "Report by email."** "One tap to flag anything wrong — it comes straight to us."
6. **Header → Vision & Roadmap.** "Today's live MVP is Phase 1. Phases 2–4 — a backend to track reports, an admin dashboard to edit without redeploying, and AI that re-verifies before things break — are how it stays alive after today."

## How judging maps to the build
| Criterion | Our answer |
|---|---|
| **Idea + impact** | Universal Pakistani pain; a trust layer over government processes. |
| **Functionality** | 7 working guides, search, filters, shareable URLs, email reporting, community-confirm, roadmap page. |
| **UI / ease of use** | Clean Pakistan @79 theme, freshness badges, mobile-friendly, fast. |
| **Ready to ship** | Already live on GitHub Pages. Backend API in progress. |

---

## Likely judge questions — and answers
**"How does this not become another outdated site in 6 months?"**
Three independent freshness signals: citizens report errors, recent visitors confirm accuracy (auto-refreshing the verified date), and a monthly AI job re-checks each guide against the official source — with a human approving every change. Nothing auto-publishes a government fee.

**"Where does the data come from — is it accurate?"**
Seeded from lived experience and current official sources, each with a visible date and source link. It's community-maintained; the "Report" and "Confirm" loops are exactly how it self-corrects. We're transparent that it's sample data today, not a government feed.

**"What's actually built vs. slideware?"**
Everything in Phase 1 is live in the page you're using. The backend (SQLite API for reports, confirmations, and an admin dashboard) is being built in parallel; the frontend already has the integration layer — one config flag flips it from static to live.

**"Why not just an app?"**
A web app is instantly shareable (a link in WhatsApp), needs no install, and deploys in seconds — critical for reach in Pakistan. Per-guide URLs mean you can send someone *"here's the exact CNIC process."*

**"How do you make money / sustain it?"**
Not the point today — but: government/NGO partnerships, verified-service provider listings, and B2B API access for HR and education consultancies. The trust layer is the asset.

---

## Tech (for the "how" questions)
- **Frontend:** vanilla HTML/CSS/JS, modular (`config → utils → data → api → views → app`), no build step, hosted free on **GitHub Pages**.
- **API layer:** one seam (`api.js`) — static seed data by default, live backend when `API_BASE` is set, with graceful fallback so a demo never breaks.
- **Backend (in progress):** Node + Express + SQLite — guides, reports, confirmations, admin CRUD, email alerts, and a proactive-freshness rule.
