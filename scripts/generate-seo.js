/* ===========================================================================
   generate-seo.js — pre-render a crawlable static page per guide, per language.
   Reuses the SAME data + i18n as the SPA (single source of truth).

   Output (at repo root):
     guide/<slug>/index.html        (English, canonical)
     guide/<slug>/ur/index.html     (Urdu, RTL)
     sitemap.xml
     robots.txt

   Run inside the backend's node image, e.g.:
     docker run --rm --user "$(id -u):$(id -g)" -v "$PWD":/app -w /app \
       node:24-bookworm-slim node scripts/generate-seo.js
   =========================================================================== */
const fs = require("node:fs");
const path = require("node:path");

const { GUIDES_SEED } = require("../assets/js/data.js");
const { GUIDES_UR } = require("../assets/js/data.ur.js");
const { I18N } = require("../assets/js/i18n.js");
const { Utils } = require("../assets/js/utils.js");

const ROOT = path.resolve(__dirname, "..");
const BASE = "https://shahzadalidotnet.github.io/gdg_event_2026_pakistan_problem_solve";
const PREFIX = "/gdg_event_2026_pakistan_problem_solve"; // absolute path prefix on Pages
const TODAY = new Date("2026-08-14");
const FAVICON = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2024%2024'%3E%3Crect%20width='24'%20height='24'%20rx='5'%20fill='%2301411c'/%3E%3Cpath%20d='M6%2012l4%204%208-8'%20fill='none'%20stroke='white'%20stroke-width='2.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3C/svg%3E";

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Merge Urdu overlay onto an English guide (mirrors the SPA's localizedGuide). */
function localize(g, lang) {
  if (lang !== "ur") return g;
  const ur = GUIDES_UR[g.slug];
  if (!ur) return g;
  return { ...g, ...ur, org: g.org, source: g.source, slug: g.slug, lastVerified: g.lastVerified };
}

function jsonLd(g, lang) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: g.title,
    description: g.summary,
    inLanguage: lang === "ur" ? "ur-PK" : "en",
    dateModified: g.lastVerified,
    publisher: { "@type": "Organization", name: "Sahi Tareeqa" },
    supply: (g.documents || []).map((d) => ({ "@type": "HowToSupply", name: d })),
    step: (g.steps || []).map((s, i) => ({
      "@type": "HowToStep", position: i + 1, name: s.title, text: s.detail,
    })),
  });
}

function page(g, lang) {
  const t = (k) => I18N.t(k, lang);
  const dir = lang === "ur" ? "rtl" : "ltr";
  const f = Utils.freshness(g.lastVerified, TODAY);
  const dateStr = Utils.fmtDate(g.lastVerified, lang);
  const enUrl = `${BASE}/guide/${g.slug}/`;
  const urUrl = `${BASE}/guide/${g.slug}/ur/`;
  const canonical = lang === "ur" ? urUrl : enUrl;
  const up = lang === "ur" ? "../../../" : "../../"; // relative path back to site root
  const otherHref = lang === "ur" ? "../" : "ur/";   // link to the other language
  const otherLabel = lang === "ur" ? "English" : "اردو";
  const desc = `${g.summary} ${g.fee}. ${t("last_verified")} ${dateStr}.`;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(g.title)} — Sahi Tareeqa</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${canonical}" />
<link rel="alternate" hreflang="en" href="${enUrl}" />
<link rel="alternate" hreflang="ur" href="${urUrl}" />
<link rel="alternate" hreflang="x-default" href="${enUrl}" />
<meta name="theme-color" content="#01411c" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(g.title)} — Sahi Tareeqa" />
<meta property="og:description" content="${esc(g.summary)}" />
<meta property="og:url" content="${canonical}" />
<meta property="og:image" content="${BASE}/assets/img/og-cover.svg" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="${FAVICON}" />
<link rel="stylesheet" href="${up}assets/css/styles.css" />
<script type="application/ld+json">${jsonLd(g, lang)}</script>
</head>
<body>
<header class="site">
  <div class="site-inner">
    <a class="brand" href="${up}" style="text-decoration:none;">
      <div class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="#01411c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
      <div><h1>Sahi Tareeqa</h1><p class="tagline" style="direction:ltr;">${esc(t("tagline"))}</p></div>
    </a>
    <div class="header-right">
      <a class="lang-toggle" href="${otherHref}">${otherLabel}</a>
      <span class="badge-pk">${esc(t("badge"))}</span>
    </div>
  </div>
</header>

<section id="detail" style="display:block;">
  <div class="wrap">
    <a class="back" href="${up}">${esc(t("back_all"))}</a>
    <div class="detail-head">
      <div class="org">${esc(g.org)}</div>
      <h2>${esc(g.title)}</h2>
      <div class="verify-row">
        <span class="fresh-badge ${f.cls}"><span class="dot"></span>${esc(t(f.key))}</span>
        <span class="verify-item">${esc(t("last_verified"))} ${esc(dateStr)}</span>
        <span class="verify-item">${esc(t("source"))}: <a href="${esc(g.source.url)}" target="_blank" rel="noopener">${esc(g.source.label)}</a></span>
      </div>
      <div class="quickfacts">
        <div class="fact"><div class="label">${esc(t("fee_label"))}</div><div class="value">${esc(g.fee)}</div></div>
        <div class="fact"><div class="label">${esc(t("time_label"))}</div><div class="value">${esc(g.time)}</div></div>
        <div class="fact"><div class="label">${esc(t("hours_label"))}</div><div class="value">${esc(g.hours)}</div></div>
      </div>
      <div class="callout"><div><div class="c-label">${esc(t("collection_label"))}</div><div class="c-value">${esc(g.collection)}</div></div></div>
    </div>

    ${g.tips && g.tips.length ? `<div class="reality">
      <h3>${esc(t("reality_title"))}</h3>
      <p class="r-sub">${esc(t("reality_sub"))}</p>
      <ul class="tips">${g.tips.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
    </div>` : ""}

    <div class="section">
      <h3>${esc(t("documents_title"))}</h3>
      <ul class="docs">${g.documents.map((d) => `<li><span class="check"></span><span>${esc(d)}</span></li>`).join("")}</ul>
    </div>

    <div class="section">
      <h3>${esc(t("steps_title"))}</h3>
      <ol class="steps">${g.steps.map((s) => `<li><div><div class="step-title">${esc(s.title)}</div><div class="step-detail">${esc(s.detail)}</div></div></li>`).join("")}</ol>
    </div>

    <div class="section">
      <h3>${esc(t("offices_title"))}</h3>
      <div class="offices">${g.offices.map((o) => `<span class="office-chip">${esc(o)}</span>`).join("")}</div>
    </div>

    <div class="callout" style="margin-top:18px;">
      <div><div class="c-value"><a href="${up}#/guide/${g.slug}">${lang === "ur" ? "انٹرایکٹو ورژن کھولیں — رپورٹ اور تصدیق کریں →" : "Open the interactive version — report &amp; confirm →"}</a></div></div>
    </div>
  </div>
</section>

<footer class="site">
  <div class="copyright">${esc(t("foot_copyright"))}</div>
</footer>
</body>
</html>
`;
}

function writeFile(rel, content) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return rel;
}

const written = [];
for (const g of GUIDES_SEED) {
  written.push(writeFile(`guide/${g.slug}/index.html`, page(localize(g, "en"), "en")));
  written.push(writeFile(`guide/${g.slug}/ur/index.html`, page(localize(g, "ur"), "ur")));
}

// sitemap.xml
const urls = [`${BASE}/`];
for (const g of GUIDES_SEED) { urls.push(`${BASE}/guide/${g.slug}/`, `${BASE}/guide/${g.slug}/ur/`); }
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>2026-08-15</lastmod></url>`).join("\n")}
</urlset>
`;
writeFile("sitemap.xml", sitemap);

// robots.txt
writeFile("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);

console.log(`Generated ${written.length} guide pages + sitemap.xml + robots.txt`);
console.log(written.join("\n"));
