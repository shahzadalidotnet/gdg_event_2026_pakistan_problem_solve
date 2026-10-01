/* ===========================================================================
   i18n.js — UI strings (English + Urdu) and language state.
   Urdu is RTL; app.js flips <html dir> when the language changes.
   Works in the browser (global I18N) and in Node (module.exports) so the
   SEO page generator can reuse the same strings.
   =========================================================================== */
const I18N = {
  // Active language: "en" or "ur". Resolved in the browser from localStorage.
  lang: "en",

  strings: {
    en: {
      langButton: "اردو",
      tagline: "The right way to do it — dated & sourced.",
      nav_vision: "Vision & Roadmap",
      badge: "🇵🇰 Pakistan @79 · GDG Live",
      live_api: "Live API",

      hero_title: "Government processes, verified & up to date.",
      hero_desc: "YouTube videos go stale and blogs never tell you when they were written. Every guide here shows the date it was last verified, links to the official source, and can be corrected by anyone who spots an error.",
      trust_dated: "Every guide is date-stamped",
      trust_sourced: "Linked to official sources",
      trust_citizens: "Corrected by citizens",
      search_placeholder: "Search — CNIC, license, passport, degree…",
      filter_all: "All",
      empty: "No guides match your search. Try “CNIC”, “licence”, or “passport”.",

      back_all: "← All processes",
      fresh_ok: "Verified",
      fresh_warn: "Check again",
      fresh_old: "May be outdated",
      last_verified: "Last verified",
      source: "Source",
      fee_label: "Government fee",
      time_label: "Processing time",
      hours_label: "Office hours (verified)",
      collection_label: "How collection works",
      reality_title: "Reality check — what actually happens",
      reality_sub: "The stuff the official site won't tell you, from people who've been there.",
      documents_title: "Documents you need",
      steps_title: "Step by step",
      offices_title: "Where to go",

      confirm_q: "Did this match reality when you did it?",
      confirm_hint: "Community confirmations keep the “last verified” date fresh — a preview of the roadmap.",
      confirm_btn: "👍 I did this recently — still accurate",
      confirm_done: "Thanks for confirming!",

      report_title: "Spotted something out of date?",
      report_desc: "Fees and steps change. Tell us what you found on the ground — it's reviewed and fixed for everyone.",
      report_btn: "Report outdated info",
      report_email_btn: "Report by email",
      rf_message: "What's outdated or different on the ground? *",
      rf_message_ph: "e.g. The fee is now Rs. 2000, not 1500; counter closes at 12pm.",
      rf_visited: "When did you visit?",
      rf_city: "Your city",
      rf_city_ph: "e.g. Islamabad",
      rf_email: "Email (optional — if you'd like a reply)",
      rf_submit: "Submit report",
      rf_cancel: "Cancel",
      rf_submitting: "Submitting…",

      toast_report_ok: "Thanks! Your report was submitted for review.",
      toast_report_err: "Couldn't submit your report — please try again.",
      toast_report_empty: "Please describe what's outdated.",
      toast_confirm_ok: "Thanks — your confirmation was recorded.",
      toast_confirm_err: "Couldn't record your confirmation — please try again.",

      foot_why_title: "Why Sahi Tareeqa exists",
      foot_why_body: "Pakistanis waste hours chasing outdated instructions for basic paperwork — CNIC, passport, driving license, degree attestation. The information exists, but it's scattered, undated, and you never know if it's still true. Sahi Tareeqa is one trusted, community-maintained portal where every process carries a verification date and a source.",
      foot_why_note: "Built for GDG Live Pakistan · Pakistan @79. Content shown is community-maintained sample data — always confirm fees on the official portal before you go.",
      foot_fresh_title: "How it stays fresh",
      foot_r1: "Seeded by contributors from lived experience.",
      foot_r2: "Corrected by citizens — one tap to report an outdated step.",
      foot_r3: "Monitored by AI (roadmap): a monthly job re-checks each guide against official sources and flags changes.",
      foot_r4: "Verified by humans before anything is published.",
      foot_seevision: "See the full vision & roadmap →",
      foot_copyright: "© 2026 Sahi Tareeqa · A GDG Live Pakistan project · Made with 💚 in Pakistan",
    },

    ur: {
      langButton: "English",
      tagline: "درست طریقہ — تاریخ اور مستند حوالہ کے ساتھ۔",
      nav_vision: "ویژن اور روڈ میپ",
      badge: "🇵🇰 پاکستان @79 · GDG Live",
      live_api: "لائیو API",

      hero_title: "سرکاری مراحل — تصدیق شدہ اور تازہ ترین۔",
      hero_desc: "یوٹیوب ویڈیوز پرانی ہو جاتی ہیں اور بلاگز کبھی نہیں بتاتے کہ وہ کب لکھے گئے۔ یہاں ہر گائیڈ پر آخری تصدیق کی تاریخ درج ہے، سرکاری ذریعہ سے منسلک ہے، اور کوئی بھی غلطی کی نشاندہی کر کے اسے درست کروا سکتا ہے۔",
      trust_dated: "ہر گائیڈ پر تاریخ درج ہے",
      trust_sourced: "سرکاری ذرائع سے منسلک",
      trust_citizens: "شہریوں کی جانب سے درستگی",
      search_placeholder: "تلاش کریں — شناختی کارڈ، لائسنس، پاسپورٹ، ڈگری…",
      filter_all: "تمام",
      empty: "آپ کی تلاش سے کوئی گائیڈ نہیں ملی۔ ”شناختی کارڈ“، ”لائسنس“ یا ”پاسپورٹ“ آزمائیں۔",

      back_all: "← تمام مراحل",
      fresh_ok: "تصدیق شدہ",
      fresh_warn: "دوبارہ جانچیں",
      fresh_old: "شاید پرانی ہو",
      last_verified: "آخری تصدیق",
      source: "ذریعہ",
      fee_label: "سرکاری فیس",
      time_label: "دورانیہ",
      hours_label: "دفتری اوقات (تصدیق شدہ)",
      collection_label: "وصولی کا طریقہ",
      reality_title: "زمینی حقیقت — اصل میں کیا ہوتا ہے",
      reality_sub: "وہ باتیں جو سرکاری ویب سائٹ نہیں بتاتی — اُن لوگوں سے جو خود وہاں ہو آئے ہیں۔",
      documents_title: "درکار دستاویزات",
      steps_title: "مرحلہ وار طریقہ",
      offices_title: "کہاں جانا ہے",

      confirm_q: "کیا یہ آپ کے تجربے کے مطابق درست تھا؟",
      confirm_hint: "شہریوں کی تصدیق ”آخری تصدیق“ کی تاریخ کو تازہ رکھتی ہے — روڈ میپ کی ایک جھلک۔",
      confirm_btn: "👍 میں نے حال ہی میں یہ کیا — اب بھی درست ہے",
      confirm_done: "تصدیق کا شکریہ!",

      report_title: "کوئی چیز پرانی نظر آئی؟",
      report_desc: "فیس اور مراحل بدلتے رہتے ہیں۔ ہمیں بتائیں کہ آپ کو موقع پر کیا ملا — اس کا جائزہ لے کر سب کے لیے درست کر دیا جاتا ہے۔",
      report_btn: "پرانی معلومات کی اطلاع دیں",
      report_email_btn: "ای میل کے ذریعے اطلاع دیں",
      rf_message: "موقع پر کیا چیز پرانی یا مختلف تھی؟ *",
      rf_message_ph: "مثلاً: فیس اب 1500 نہیں بلکہ 2000 روپے ہے؛ کاؤنٹر 12 بجے بند ہو جاتا ہے۔",
      rf_visited: "آپ کب گئے تھے؟",
      rf_city: "آپ کا شہر",
      rf_city_ph: "مثلاً اسلام آباد",
      rf_email: "ای میل (اختیاری — اگر جواب چاہیں)",
      rf_submit: "رپورٹ جمع کریں",
      rf_cancel: "منسوخ کریں",
      rf_submitting: "جمع ہو رہی ہے…",

      toast_report_ok: "شکریہ! آپ کی رپورٹ جائزے کے لیے موصول ہو گئی۔",
      toast_report_err: "رپورٹ جمع نہیں ہو سکی — براہِ کرم دوبارہ کوشش کریں۔",
      toast_report_empty: "براہِ کرم بتائیں کہ کیا چیز پرانی ہے۔",
      toast_confirm_ok: "شکریہ — آپ کی تصدیق درج کر لی گئی۔",
      toast_confirm_err: "تصدیق درج نہیں ہو سکی — براہِ کرم دوبارہ کوشش کریں۔",

      foot_why_title: "سہی طریقہ کیوں؟",
      foot_why_body: "پاکستانی بنیادی کاغذی کارروائی — شناختی کارڈ، پاسپورٹ، ڈرائیونگ لائسنس، ڈگری تصدیق — کے پرانے طریقوں کے پیچھے گھنٹوں ضائع کرتے ہیں۔ معلومات موجود تو ہیں، مگر بکھری ہوئی، بغیر تاریخ کے، اور آپ کو معلوم نہیں ہوتا کہ اب بھی درست ہیں یا نہیں۔ سہی طریقہ ایک قابلِ اعتماد، کمیونٹی کے زیرِ انتظام پورٹل ہے جہاں ہر مرحلے پر تصدیق کی تاریخ اور ذریعہ درج ہے۔",
      foot_why_note: "GDG Live Pakistan · پاکستان @79 کے لیے بنایا گیا۔ یہاں دکھایا گیا مواد کمیونٹی کے زیرِ انتظام نمونہ ڈیٹا ہے — جانے سے پہلے فیس ہمیشہ سرکاری پورٹل پر تصدیق کریں۔",
      foot_fresh_title: "یہ تازہ کیسے رہتا ہے",
      foot_r1: "تجربہ رکھنے والوں کی جانب سے ابتدائی مواد۔",
      foot_r2: "شہریوں کی جانب سے درستگی — ایک ٹیپ میں پرانی معلومات کی اطلاع۔",
      foot_r3: "AI کی نگرانی (روڈ میپ): ماہانہ عمل ہر گائیڈ کو سرکاری ذرائع سے جانچتا اور تبدیلیوں کی نشاندہی کرتا ہے۔",
      foot_r4: "شائع کرنے سے پہلے انسان کی تصدیق۔",
      foot_seevision: "مکمل ویژن اور روڈ میپ دیکھیں →",
      foot_copyright: "© 2026 سہی طریقہ · GDG Live Pakistan کا منصوبہ · پاکستان میں 💚 کے ساتھ بنایا گیا",
    },
  },

  /** Look up a UI string for the active (or given) language, falling back to English. */
  t(key, lang) {
    const L = lang || I18N.lang;
    const table = I18N.strings[L] || I18N.strings.en;
    return table[key] != null ? table[key] : (I18N.strings.en[key] != null ? I18N.strings.en[key] : key);
  },

  isRTL(lang) {
    return (lang || I18N.lang) === "ur";
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = { I18N };
