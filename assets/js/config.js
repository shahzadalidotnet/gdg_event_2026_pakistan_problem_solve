/* ===========================================================================
   config.js — app-wide settings
   --------------------------------------------------------------------------
   Sahi Tareeqa runs fully static by default (no backend needed). When the
   backend API is deployed, set API_BASE to its origin and the whole app
   switches to live data + real reports/confirmations automatically.
   =========================================================================== */
const CONFIG = {
  // Where "Report outdated" emails go while running in static mode.
  ADMIN_EMAIL: "shahzadalidotnet@gmail.com",

  // Backend origin. Empty string = static/offline mode.
  // Resolution order (first wins):
  //   1. ?api=<url> in the page URL (also remembered in localStorage) — handy for testing
  //   2. a previously remembered value in localStorage("apiBase")
  //   3. the hardcoded default below
  // To pin the live backend permanently, replace the default "" with the Render URL,
  // e.g. "https://sahi-tareeqa-api.onrender.com".
  API_BASE: (() => {
    const DEFAULT = "https://sahi-tareeqa-api-production-a935.up.railway.app";
    try {
      const fromQuery = new URLSearchParams(location.search).get("api");
      if (fromQuery !== null) {
        const clean = fromQuery.replace(/\/$/, "");
        localStorage.setItem("apiBase", clean);
        return clean;
      }
      return localStorage.getItem("apiBase") || DEFAULT;
    } catch {
      return DEFAULT;
    }
  })(),

  // Community confirmations needed within 30 days to auto-refresh a guide's
  // "last verified" date (mirrors the backend's proactive-freshness rule).
  CONFIRM_THRESHOLD: 5,

  // Fixed "today" so freshness badges are deterministic for the demo.
  TODAY: new Date("2026-08-14"),
};
