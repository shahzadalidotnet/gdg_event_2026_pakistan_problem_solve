/* ===========================================================================
   utils.js — small shared helpers (browser + Node via module.exports)
   =========================================================================== */
const Utils = {
  /** Months elapsed between a guide's lastVerified date and CONFIG.TODAY. */
  monthsSince(dateStr, today) {
    const now = today || (typeof CONFIG !== "undefined" ? CONFIG.TODAY : new Date());
    const d = new Date(dateStr);
    return (now - d) / (1000 * 60 * 60 * 24 * 30.44);
  },

  /** Map a lastVerified date to a freshness badge class + i18n key. */
  freshness(dateStr, today) {
    const m = Utils.monthsSince(dateStr, today);
    if (m <= 3) return { cls: "ok", key: "fresh_ok" };
    if (m <= 6) return { cls: "warn", key: "fresh_warn" };
    return { cls: "old", key: "fresh_old" };
  },

  /** Human-friendly date, localized to the active language. */
  fmtDate(dateStr, lang) {
    const L = lang || (typeof I18N !== "undefined" ? I18N.lang : "en");
    const locale = L === "ur" ? "ur-PK" : "en-GB";
    return new Date(dateStr).toLocaleDateString(locale, {
      day: "numeric", month: "short", year: "numeric",
    });
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = { Utils };
