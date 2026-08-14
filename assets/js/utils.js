/* ===========================================================================
   utils.js — small shared helpers
   =========================================================================== */
const Utils = {
  /** Months elapsed between a guide's lastVerified date and CONFIG.TODAY. */
  monthsSince(dateStr) {
    const d = new Date(dateStr);
    return (CONFIG.TODAY - d) / (1000 * 60 * 60 * 24 * 30.44);
  },

  /** Map a lastVerified date to a freshness badge class + label. */
  freshness(dateStr) {
    const m = Utils.monthsSince(dateStr);
    if (m <= 3) return { cls: "ok", label: "Verified" };
    if (m <= 6) return { cls: "warn", label: "Check again" };
    return { cls: "old", label: "May be outdated" };
  },

  /** Human-friendly date, e.g. "14 Aug 2026". */
  fmtDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  },
};
