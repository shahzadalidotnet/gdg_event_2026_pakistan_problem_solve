/* ===========================================================================
   api.js — data-access layer
   --------------------------------------------------------------------------
   One seam between the UI and where data comes from.

   • CONFIG.API_BASE empty  → STATIC MODE: guides come from GUIDES_SEED,
     reports open the user's email client, confirmations live in localStorage.
   • CONFIG.API_BASE set     → LIVE MODE: guides/reports/confirmations hit the
     backend REST API. Any network failure falls back to static behaviour so
     the page never breaks during a demo.

   The backend stores fields in snake_case (last_verified, source_url, …);
   normalizeGuide() maps them to the camelCase shape the UI renders.
   =========================================================================== */
const API = (() => {
  const hasBackend = () => Boolean(CONFIG.API_BASE);
  const url = (path) => CONFIG.API_BASE.replace(/\/$/, "") + path;

  // Fetch with a timeout so a sleeping/slow backend can't hang the page —
  // on timeout we throw and callers fall back to the local seed data.
  async function fetchWithTimeout(resource, options = {}, ms = 7000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(resource, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  // Some columns may arrive as JSON strings from SQLite — parse defensively.
  function maybeParse(v) {
    if (typeof v !== "string") return v;
    try { return JSON.parse(v); } catch { return v; }
  }

  /** Map a backend guide (snake_case) to the UI's camelCase shape. */
  function normalizeGuide(g) {
    if (!g) return g;
    return {
      slug: g.slug,
      org: g.org,
      title: g.title,
      summary: g.summary,
      lastVerified: g.lastVerified || g.last_verified,
      source: g.source || { label: g.source_label, url: g.source_url },
      fee: g.fee,
      time: g.time || g.processing_time,
      documents: maybeParse(g.documents) || [],
      steps: maybeParse(g.steps) || [],
      offices: maybeParse(g.offices) || [],
      hours: g.hours,
      collection: g.collection,
      tips: maybeParse(g.tips) || [],
      confirmations30d: g.confirmations_30d ?? g.confirmations30d ?? 0,
    };
  }

  async function getGuides() {
    if (!hasBackend()) return GUIDES_SEED;
    try {
      const res = await fetchWithTimeout(url("/api/guides"));
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.guides || [];
      return list.map(normalizeGuide);
    } catch (err) {
      console.warn("[api] getGuides failed — falling back to seed data:", err);
      return GUIDES_SEED;
    }
  }

  async function getGuide(slug) {
    if (!hasBackend()) return GUIDES_SEED.find((g) => g.slug === slug);
    try {
      const res = await fetchWithTimeout(url("/api/guides/" + encodeURIComponent(slug)));
      if (!res.ok) throw new Error("HTTP " + res.status);
      return normalizeGuide(await res.json());
    } catch (err) {
      console.warn("[api] getGuide failed — falling back to seed data:", err);
      return GUIDES_SEED.find((g) => g.slug === slug);
    }
  }

  /**
   * Submit an "outdated" report.
   * Static mode returns { offline: true } so the UI can fall back to a mailto.
   */
  async function submitReport(payload) {
    if (!hasBackend()) return { ok: true, offline: true };
    const res = await fetch(url("/api/reports"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  /** Register a "still accurate" confirmation; returns the 30-day count. */
  async function confirm(slug) {
    if (!hasBackend()) {
      const key = "confirm_" + slug;
      const n = parseInt(localStorage.getItem(key) || "0", 10) + 1;
      localStorage.setItem(key, String(n));
      return { ok: true, offline: true, count30d: n };
    }
    try {
      const res = await fetch(url("/api/confirmations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideSlug: slug }),
      });
      return res.json();
    } catch (err) {
      console.warn("[api] confirm failed:", err);
      return { ok: false };
    }
  }

  /** Locally-remembered confirmation count (used for the static preview). */
  function localConfirmCount(slug) {
    return parseInt(localStorage.getItem("confirm_" + slug) || "0", 10);
  }

  return { hasBackend, getGuides, getGuide, submitReport, confirm, localConfirmCount, normalizeGuide };
})();
