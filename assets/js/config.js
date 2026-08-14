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

  // Leave empty for the static/offline demo.
  // When the backend is live, e.g.: "https://sahi-tareeqa-api.onrender.com"
  API_BASE: "",

  // Community confirmations needed within 30 days to auto-refresh a guide's
  // "last verified" date (mirrors the backend's proactive-freshness rule).
  CONFIRM_THRESHOLD: 5,

  // Fixed "today" so freshness badges are deterministic for the demo.
  TODAY: new Date("2026-08-14"),
};
