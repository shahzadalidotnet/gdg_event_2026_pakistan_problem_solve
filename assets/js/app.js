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

/* ---------- Community "still accurate" confirmation ---------- */
async function confirmAccurate(slug) {
  const btn = document.getElementById("confirmBtn");
  const label = document.getElementById("confirmCount");
  if (btn) btn.disabled = true;

  const res = await API.confirm(slug);
  const n = res && res.count30d != null ? res.count30d : API.localConfirmCount(slug);

  if (label) {
    label.textContent = `✓ Confirmed accurate by ${n} ${n === 1 ? "person" : "people"} recently. In the full version this refreshes the “last verified” date automatically.`;
  }
  if (btn) {
    btn.textContent = "Thanks for confirming!";
    btn.style.opacity = "0.6";
    btn.style.cursor = "default";
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
