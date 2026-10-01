/* ===========================================================================
   app.js — application state, navigation, routing and bootstrap
   =========================================================================== */

/** Single source of UI state. `guides` is filled once from API.getGuides(). */
const state = {
  guides: [],
  activeOrg: "All",
};

/* ---------- Navigation (hash-based, so guides get shareable URLs) ---------- */
function openGuide(slug) { location.hash = "/guide/" + slug; }
function goHome() { location.hash = ""; }
function goVision() { location.hash = "/vision"; }
function setOrg(o) { state.activeOrg = o; renderFilters(); render(); }

/* ---------- Language (English / Urdu, RTL-aware) ---------- */
/** Overlay Urdu content onto an English guide when the active language is Urdu. */
function localizedGuide(g) {
  if (I18N.lang !== "ur" || typeof GUIDES_UR === "undefined") return g;
  const ur = GUIDES_UR[g.slug];
  if (!ur) return g;
  return {
    ...g,
    title: ur.title || g.title,
    summary: ur.summary || g.summary,
    fee: ur.fee || g.fee,
    time: ur.time || g.time,
    documents: ur.documents || g.documents,
    steps: ur.steps || g.steps,
    offices: ur.offices || g.offices,
    hours: ur.hours || g.hours,
    collection: ur.collection || g.collection,
    tips: ur.tips || g.tips,
  };
}

/** Localized "confirmed by N people" sentence. */
function confirmedText(n) {
  if (I18N.lang === "ur") {
    return `✓ حال ہی میں ${n} ${n === 1 ? "شخص" : "افراد"} نے درست تصدیق کی — یہ ”آخری تصدیق“ کی تاریخ کو تازہ رکھتا ہے۔`;
  }
  return `✓ Confirmed accurate by ${n} ${n === 1 ? "person" : "people"} recently — this keeps the “verified” date fresh.`;
}

/** Push the active language into every static [data-i18n] element + chrome. */
function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = I18N.t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = I18N.t(el.getAttribute("data-i18n-ph"));
  });
  const langBtn = document.getElementById("langToggle");
  if (langBtn) langBtn.textContent = I18N.t("langButton");
}

function applyLang(lang) {
  I18N.lang = lang === "ur" ? "ur" : "en";
  try { localStorage.setItem("lang", I18N.lang); } catch {}
  const root = document.documentElement;
  root.setAttribute("lang", I18N.lang);
  root.setAttribute("dir", I18N.isRTL() ? "rtl" : "ltr");
  applyStaticI18n();
  renderFilters();
  render();         // re-render the home grid in the new language
  route();          // re-render the current view (detail/vision) in the new language
}

function toggleLang() {
  applyLang(I18N.lang === "ur" ? "en" : "ur");
}

/* ---------- Toast notifications ---------- */
function toast(message, type = "success") {
  const container = document.getElementById("toasts");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast " + (type === "error" ? "toast-error" : "toast-success");
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 4500);
}

/* ---------- Community "still accurate" confirmation ---------- */
async function confirmAccurate(slug) {
  const btn = document.getElementById("confirmBtn");
  const label = document.getElementById("confirmCount");
  if (btn) btn.disabled = true;

  try {
    const res = await API.confirm(slug);
    if (!res || res.ok === false) throw new Error(res && res.error ? res.error : "Request failed");

    const n = res.count30d != null ? res.count30d : API.localConfirmCount(slug);
    if (label) label.textContent = confirmedText(n);
    if (btn) {
      btn.textContent = I18N.t("confirm_done");
      btn.style.opacity = "0.6";
      btn.style.cursor = "default";
    }
    toast(I18N.t("toast_confirm_ok"), "success");
  } catch (err) {
    if (btn) btn.disabled = false;
    toast(I18N.t("toast_confirm_err"), "error");
  }
}

/* ---------- In-app "Report outdated" form ---------- */
function toggleReportForm() {
  const form = document.getElementById("reportForm");
  if (!form) return;
  form.hidden = !form.hidden;
  if (!form.hidden) {
    const field = form.querySelector("textarea[name=message]");
    if (field) field.focus();
  }
}

async function submitReportForm(event, slug) {
  event.preventDefault();
  const form = event.target;
  const btn = document.getElementById("reportSubmitBtn");
  const message = form.message.value.trim();

  if (!message) {
    toast(I18N.t("toast_report_empty"), "error");
    return;
  }

  const payload = {
    guideSlug: slug,
    message,
    visitedOn: form.visitedOn.value || undefined,
    city: form.city.value.trim() || undefined,
    email: form.email.value.trim() || undefined,
  };

  if (btn) { btn.disabled = true; btn.textContent = I18N.t("rf_submitting"); }
  try {
    const res = await API.submitReport(payload);
    if (!res || res.ok === false) throw new Error(res && res.error ? res.error : "Request failed");
    toast(I18N.t("toast_report_ok"), "success");
    form.reset();
    toggleReportForm();
  } catch (err) {
    toast(I18N.t("toast_report_err"), "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = I18N.t("rf_submit"); }
  }
}

/* ---------- Router ---------- */
function route() {
  const hash = location.hash.replace(/^#/, "");
  const guide = hash.match(/^\/guide\/(.+)$/);
  const home = document.getElementById("home");
  const detail = document.getElementById("detail");
  const vision = document.getElementById("vision");

  home.style.display = "none";
  detail.style.display = "none";
  vision.style.display = "none";

  if (guide) {
    detail.style.display = "block";
    renderDetail(state.guides.find((g) => g.slug === guide[1]));
  } else if (hash === "/vision") {
    vision.style.display = "block";
    renderVision();
  } else {
    home.style.display = "block";
  }
  window.scrollTo(0, 0);
}

/* ---------- Bootstrap ---------- */
async function init() {
  // Resolve saved language, set direction + static strings before first paint.
  let saved = "en";
  try { saved = localStorage.getItem("lang") || "en"; } catch {}
  I18N.lang = saved === "ur" ? "ur" : "en";
  document.documentElement.setAttribute("lang", I18N.lang);
  document.documentElement.setAttribute("dir", I18N.isRTL() ? "rtl" : "ltr");
  applyStaticI18n();

  state.guides = await API.getGuides();

  // Show the "Live API" pill when a backend is connected.
  if (API.hasBackend()) {
    const pill = document.getElementById("apiPill");
    if (pill) pill.classList.add("on");
  }

  renderFilters();
  render();
  route();
}

window.addEventListener("hashchange", route);
init();
