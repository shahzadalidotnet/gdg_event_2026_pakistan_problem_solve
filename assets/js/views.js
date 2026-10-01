/* ===========================================================================
   views.js — pure rendering (reads state + I18N, writes HTML).
   Guide content is localized via localizedGuide() (defined in app.js).
   =========================================================================== */

/* ---------- Home: filters ---------- */
function orgList() {
  return ["All", ...Array.from(new Set(state.guides.map((g) => g.org)))];
}
function renderFilters() {
  document.getElementById("filters").innerHTML = orgList()
    .map((o) => {
      const label = o === "All" ? I18N.t("filter_all") : o;
      return `<button class="filter ${o === state.activeOrg ? "active" : ""}" onclick="setOrg('${o.replace(/'/g, "\\'")}')">${label}</button>`;
    })
    .join("");
}

/* ---------- Home: guide grid ---------- */
function render() {
  const q = (document.getElementById("searchInput").value || "").toLowerCase();
  const list = state.guides.filter((g) => {
    const matchOrg = state.activeOrg === "All" || g.org === state.activeOrg;
    const lg = localizedGuide(g);
    const hay = (g.title + " " + lg.title + " " + g.org + " " + g.summary + " " + lg.summary).toLowerCase();
    return matchOrg && hay.includes(q);
  });
  const grid = document.getElementById("grid");
  if (!list.length) {
    grid.innerHTML = `<div class="empty">${I18N.t("empty")}</div>`;
    return;
  }
  grid.innerHTML = list
    .map((raw) => {
      const g = localizedGuide(raw);
      const f = Utils.freshness(g.lastVerified);
      return `
      <div class="card" onclick="openGuide('${g.slug}')">
        <div class="org">${g.org}</div>
        <h3>${g.title}</h3>
        <p>${g.summary}</p>
        <div class="meta">
          <span class="fresh-badge ${f.cls}"><span class="dot"></span>${I18N.t(f.key)} · ${Utils.fmtDate(g.lastVerified)}</span>
          <span class="arrow">${I18N.isRTL() ? "←" : "→"}</span>
        </div>
      </div>`;
    })
    .join("");
}

/* ---------- Guide detail ---------- */
function renderDetail(raw) {
  if (!raw) { goHome(); return; }
  const g = localizedGuide(raw);
  const f = Utils.freshness(g.lastVerified);
  const subject = encodeURIComponent(`Sahi Tareeqa — Outdated: ${g.title} (${g.org})`);
  const body = encodeURIComponent(
    `Guide: ${g.title}\n` +
    `Organisation: ${g.org}\n` +
    `Currently shows "Last verified": ${Utils.fmtDate(g.lastVerified, "en")}\n\n` +
    `What is outdated or different on the ground?\n\n\n` +
    `When did you visit: \nYour city: \n`
  );
  const reportUrl = `mailto:${CONFIG.ADMIN_EMAIL}?subject=${subject}&body=${body}`;
  const confirmed = API.localConfirmCount(g.slug);

  document.getElementById("detailContent").innerHTML = `
    <button class="back" onclick="goHome()">${I18N.t("back_all")}</button>
    <div class="detail-head">
      <div class="org">${g.org}</div>
      <h2>${g.title}</h2>
      <div class="verify-row">
        <span class="fresh-badge ${f.cls}"><span class="dot"></span>${I18N.t(f.key)}</span>
        <span class="verify-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          ${I18N.t("last_verified")} ${Utils.fmtDate(g.lastVerified)}
        </span>
        <span class="verify-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
          ${I18N.t("source")}: <a href="${g.source.url}" target="_blank" rel="noopener">${g.source.label}</a>
        </span>
      </div>
      <div class="quickfacts">
        <div class="fact"><div class="label">${I18N.t("fee_label")}</div><div class="value">${g.fee}</div></div>
        <div class="fact"><div class="label">${I18N.t("time_label")}</div><div class="value">${g.time}</div></div>
        <div class="fact"><div class="label">${I18N.t("hours_label")}</div><div class="value">${g.hours}</div></div>
      </div>
      <div class="callout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>
        <div><div class="c-label">${I18N.t("collection_label")}</div><div class="c-value">${g.collection}</div></div>
      </div>
    </div>

    ${g.tips && g.tips.length ? `
    <div class="reality">
      <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>${I18N.t("reality_title")}</h3>
      <p class="r-sub">${I18N.t("reality_sub")}</p>
      <ul class="tips">${g.tips.map((t) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><span>${t}</span></li>`).join("")}</ul>
    </div>` : ""}

    <div class="section">
      <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>${I18N.t("documents_title")}</h3>
      <ul class="docs">${g.documents.map((d) => `<li><span class="check"></span><span>${d}</span></li>`).join("")}</ul>
    </div>

    <div class="section">
      <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>${I18N.t("steps_title")}</h3>
      <ol class="steps">${g.steps.map((s) => `<li><div><div class="step-title">${s.title}</div><div class="step-detail">${s.detail}</div></div></li>`).join("")}</ol>
    </div>

    <div class="section">
      <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${I18N.t("offices_title")}</h3>
      <div class="offices">${g.offices.map((o) => `<span class="office-chip">${o}</span>`).join("")}</div>
    </div>

    <div class="confirm-box">
      <div class="cb-left">
        <strong>${I18N.t("confirm_q")}</strong>
        <span id="confirmCount">${confirmed > 0 ? confirmedText(confirmed) : I18N.t("confirm_hint")}</span>
      </div>
      <button class="btn ghost" id="confirmBtn" onclick="confirmAccurate('${g.slug}')">${I18N.t("confirm_btn")}</button>
    </div>

    <div class="report">
      <div class="r-text">
        <strong>${I18N.t("report_title")}</strong>
        <span>${I18N.t("report_desc")}</span>
      </div>
      ${API.hasBackend()
        ? `<button class="btn" onclick="toggleReportForm()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            ${I18N.t("report_btn")}
          </button>`
        : `<a class="btn" href="${reportUrl}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" fill="none"/><path d="M22 6l-10 7L2 6"/></svg>
            ${I18N.t("report_email_btn")}
          </a>`}
    </div>

    ${API.hasBackend() ? `
    <form id="reportForm" class="report-form" hidden onsubmit="submitReportForm(event, '${g.slug}')">
      <label>${I18N.t("rf_message")}
        <textarea name="message" rows="3" required placeholder="${I18N.t("rf_message_ph")}"></textarea>
      </label>
      <div class="rf-row">
        <label>${I18N.t("rf_visited")}
          <input type="date" name="visitedOn" />
        </label>
        <label>${I18N.t("rf_city")}
          <input type="text" name="city" placeholder="${I18N.t("rf_city_ph")}" />
        </label>
      </div>
      <label>${I18N.t("rf_email")}
        <input type="email" name="email" placeholder="you@example.com" />
      </label>
      <div class="rf-actions">
        <button type="submit" class="btn" id="reportSubmitBtn">${I18N.t("rf_submit")}</button>
        <button type="button" class="btn ghost" onclick="toggleReportForm()">${I18N.t("rf_cancel")}</button>
      </div>
    </form>` : ""}
  `;
}

/* ---------- Vision / roadmap (kept in English) ---------- */
function bullets(items) {
  return `<ul>${items.map((t) => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span>${t}</span></li>`).join("")}</ul>`;
}
function renderVision() {
  document.getElementById("visionContent").innerHTML = `
    <button class="back" onclick="goHome()">${I18N.t("back_all")}</button>
    <div class="vision-hero">
      <h2>From MVP to Pakistan's trusted process portal</h2>
      <p>What you're using today is a working MVP — hand-verified guides, each dated and sourced. Here's how it becomes a living service that stays fresh <em>without</em> waiting for information to break.</p>
    </div>

    <div class="callout" style="margin-top:18px;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"/></svg>
      <div><div class="c-label">Our core principle</div><div class="c-value">We don't wait for a guide to fail, get reported, then fixed. We <strong>proactively confirm freshness</strong> — through citizens, community signals, and AI — before anything goes stale.</div></div>
    </div>

    <div class="phase">
      <div class="phase-head"><h3>Phase 1 — The MVP</h3><span class="tag done">Shipped · live now</span></div>
      <p class="p-sub">Everything the judges are using right now.</p>
      ${bullets([
        "Hand-verified guides for NADRA, HEC, FBR, IBCC, ITP, Passport &amp; Domicile",
        "Every guide is date-stamped and linked to its official source",
        "“Reality check” tips — the on-the-ground truth official sites never mention",
        "English + Urdu, and each guide is its own SEO-friendly page"
      ])}
    </div>

    <div class="phase">
      <div class="phase-head"><h3>Phase 2 — Capture &amp; track reports</h3><span class="tag next">Next</span></div>
      <p class="p-sub">Turn one-off emails into a tracked, measurable feedback loop.</p>
      ${bullets([
        "Built-in “Report issue” form — no leaving the site, no email client",
        "A backend database storing every report with a status: new → reviewing → fixed",
        "Automatic email/notification to the admin the moment a report arrives",
        "“Reported by N people” shown on the guide so hot issues surface themselves"
      ])}
    </div>

    <div class="phase">
      <div class="phase-head"><h3>Phase 3 — Admin, without redeploys</h3><span class="tag next">Next</span></div>
      <p class="p-sub">Update content in seconds — no code, no deployment.</p>
      ${bullets([
        "Secure admin login with dedicated dashboard screens",
        "View every guide and every incoming report in one place",
        "Edit a guide's fees, steps or documents and publish instantly",
        "Content served from the database/CMS — the site never needs a re-deploy to update"
      ])}
    </div>

    <div class="phase">
      <div class="phase-head"><h3>Phase 4 — Proactive freshness</h3><span class="tag later">The differentiator</span></div>
      <p class="p-sub">Freshness earned continuously — not just after something breaks.</p>
      ${bullets([
        "Community confirmation: citizens who just completed a process confirm it still works",
        "Recent confirmations automatically refresh the “Last verified” date — freshness from real visits",
        "AI re-verification: a monthly job cross-checks each guide against official sources and flags drift for a human to approve",
        "The result — no manually calling institutions, no waiting for a guide to fail first"
      ])}
    </div>

    <button class="back" style="margin:22px 0 0;" onclick="goHome()">${I18N.t("back_all")}</button>
  `;
}
