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
    if (label) {
      const live = API.hasBackend();
      label.textContent = `✓ Confirmed accurate by ${n} ${n === 1 ? "person" : "people"} recently` +
        (live
          ? " — 5 confirmations in 30 days auto-refresh the verified date."
          : ". In the full version this refreshes the “last verified” date automatically.");
    }
    if (btn) {
      btn.textContent = "Thanks for confirming!";
      btn.style.opacity = "0.6";
      btn.style.cursor = "default";
    }
    toast("Thanks — your confirmation was recorded.", "success");
  } catch (err) {
    if (btn) btn.disabled = false;
    toast("Couldn't record your confirmation — please try again.", "error");
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
    toast("Please describe what's outdated.", "error");
    return;
  }

  const payload = {
    guideSlug: slug,
    message,
    visitedOn: form.visitedOn.value || undefined,
    city: form.city.value.trim() || undefined,
    email: form.email.value.trim() || undefined,
  };

  if (btn) { btn.disabled = true; btn.textContent = "Submitting…"; }
  try {
    const res = await API.submitReport(payload);
    if (!res || res.ok === false) throw new Error(res && res.error ? res.error : "Request failed");
    toast("Thanks! Your report was submitted for review.", "success");
    form.reset();
    toggleReportForm();
  } catch (err) {
    toast("Couldn't submit your report — please try again.", "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Submit report"; }
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
