/* ===========================================================================
   data.js — seed guide content (community-maintained sample data)
   --------------------------------------------------------------------------
   In static mode this is the source of truth. When CONFIG.API_BASE is set,
   the backend serves guides instead and this acts as an offline fallback.
   Keep this in sync with backend/seed/guides.json.
   =========================================================================== */
const GUIDES_SEED = [
  {
    slug: "cnic-renewal", org: "NADRA", title: "Renew your CNIC (Smart Card)",
    summary: "Renew an expired Computerised National Identity Card — online or in person.",
    lastVerified: "2026-08-14",
    source: { label: "id.nadra.gov.pk", url: "https://id.nadra.gov.pk/" },
    fee: "Smart CNIC: Rs. 1000 (Normal) · Rs. 2000 (Urgent) · Rs. 3000 (Executive) · + Rs. 165 courier",
    time: "Normal 30 · Urgent 20 · Executive 10 working days",
    documents: [
      "Your existing CNIC (original) — bring it even if expired",
      "One recent passport-size photo with a white background",
      "Supporting document ONLY if details changed — marriage certificate (name), utility bill (address), or court order",
      "A mobile number registered in your own name (for SMS tracking)"
    ],
    steps: [
      { title: "Choose online or in-person", detail: "The Pak-ID app / id.nadra.gov.pk works if your name, father's name and date of birth are unchanged. Any change to your particulars needs an in-person NRC visit." },
      { title: "Start the application", detail: "Online: log in with your CNIC and upload a fresh photo. In-person: collect a token at any NADRA Registration Center (NRC) or Mega Center." },
      { title: "Give biometrics (in-person only)", detail: "Fingerprints and a live photo are re-captured at the counter. Skipped for pure online renewals where data is unchanged." },
      { title: "Pick a processing speed & pay", detail: "Choose Normal / Urgent / Executive and pay by card online or at the counter. Keep the receipt and your token number." },
      { title: "Track your card", detail: "SMS your 13-digit number to 8300, or track live in the Pak-ID app." },
      { title: "Collect or receive it", detail: "Delivered to your address by courier, or collect from the NRC on the due date if you chose in-person pickup." }
    ],
    offices: ["Any NADRA Mega Center", "NADRA Registration Center (NRC)", "Pak-ID app (online)"],
    hours: "Mega Centers: Mon–Sat 8AM–8PM · NRCs: Mon–Fri 9AM–5PM · Pak-ID app 24/7",
    collection: "Not same-day. The card is couriered to your address or collected from the NRC on the date printed on your token — only the paper token is issued same-day.",
    tips: [
      "If nothing has changed, renew fully online via the Pak-ID app — no queue and the card is delivered home.",
      "Token counters usually stop issuing new tokens ~1 hour before closing — reach early.",
      "Bring the original CNIC even for a renewal; a photocopy alone is refused at the counter.",
      "Smart Card fees start at Rs. 1000 — older guides quoting Rs. 750 are the outdated non-smart rate.",
      "The Executive counter is a separate, faster queue if you pay the top fee."
    ]
  },
  {
    slug: "itp-license", org: "Islamabad Traffic Police (ITP)", title: "Get a driving licence (Islamabad)",
    summary: "Learner + permanent driving licence in ICT via the DLIMS system.",
    lastVerified: "2026-08-14",
    source: { label: "islamabadpolice.gov.pk/itp", url: "https://islamabadpolice.gov.pk/itp/" },
    fee: "Learner permit Rs. 1000 (6-month) · Medical Rs. 200 · Road test Rs. 200 · Smart card Rs. 2000",
    time: "Learner: same day · Permanent: apply after the 42-day learner period",
    documents: [
      "Original CNIC + photocopy",
      "Original learner permit (for the permanent licence)",
      "Recent passport-size photographs",
      "Medical fitness certificate (Rs. 200)",
      "Local utility bill / tenancy agreement if your CNIC address is outside Islamabad"
    ],
    steps: [
      { title: "Generate a PSID & pay online", detail: "Create a PSID on the DLIMS portal and pay via EasyPaisa, JazzCash, internet banking, ATM or any E-Khidmat Center — no need to visit ITP just to pay." },
      { title: "Apply for the learner permit", detail: "Submit your application with CNIC. The learner permit is valid 6 months; display an 'L' sign while practising." },
      { title: "Wait the mandatory 42 days", detail: "You must hold the learner permit for at least 42 days before you can take the driving test." },
      { title: "Book your test slot", detail: "Book online via DLIMS or in person; bring the learner permit and your documents." },
      { title: "Pass theory + practical test", detail: "A signs/signals test, then the computerized on-track road test (Rs. 200) with an examiner." },
      { title: "Biometrics, pay & collect", detail: "Give biometrics, pay the smart card fee (Rs. 2000); the card is printed and couriered or collected." }
    ],
    offices: ["ITP Licensing Office, H-11", "ITP Office F-6 Markaz", "DLIMS online portal / E-Khidmat Center"],
    hours: "Licensing offices: Mon–Fri 9AM–3PM (test slots fill by noon)",
    collection: "Learner permit is issued same-day. The permanent smart card is couriered or collected after processing — not same-day.",
    tips: [
      "You no longer need to visit ITP just to pay — generate a PSID on DLIMS and pay via EasyPaisa/JazzCash/bank.",
      "Learner permit is now Rs. 1000 (6-month) — older guides quoting ~Rs. 60 are outdated.",
      "Google timings are often wrong — the test track stops taking new candidates around 12:30 PM.",
      "Carry the original medical certificate; a photocopy is not accepted.",
      "If your CNIC address is outside Islamabad, bring a local utility bill or tenancy agreement."
    ]
  },
  {
    slug: "hec-attestation", org: "HEC", title: "Attest your degree (HEC e-attestation)",
    summary: "Higher Education Commission degree, transcript & certificate attestation — now digital.",
    lastVerified: "2026-08-14",
    source: { label: "eservices.hec.gov.pk", url: "https://eservices.hec.gov.pk/" },
    fee: "Rs. 3000 per document (degree, transcript, provisional certificate or equivalence letter)",
    time: "10–15 working days total — ~5–8 days university verification + 3–5 days HEC review",
    documents: [
      "Scanned copy (PDF/JPEG) of each degree, transcript & certificate — Matric onwards",
      "Original documents (bring to your Regional Centre appointment)",
      "CNIC / passport copy",
      "Printed e-portal appointment confirmation",
      "Remove any plastic lamination before scanning/attesting"
    ],
    steps: [
      { title: "Create an account on the HEC e-portal", detail: "Sign up at eservices.hec.gov.pk (open 24/7) and complete your academic profile — list every qualification from Matric onwards." },
      { title: "Upload your documents", detail: "Attach scanned PDFs/JPEGs of each degree, transcript and certificate you want attested." },
      { title: "Pay the fee (Rs. 3000 per document)", detail: "Pay via 1-Link — mobile banking, ATM, or any bank branch using the generated consumer number." },
      { title: "University verification", detail: "HEC sends your records to the awarding university to confirm — usually 5–8 working days and out of your hands." },
      { title: "Book your appointment", detail: "Once verified, you get an SMS/email to pick a date and an HEC Regional Centre (Islamabad, Karachi, Lahore, etc.)." },
      { title: "Get your e-attestation", detail: "After final review an e-attestation certificate is issued — download it from your dashboard; SMS/email confirms." }
    ],
    offices: ["HEC Regional Centre Islamabad", "HEC Lahore / Karachi / Peshawar / Quetta", "HEC e-portal (online)"],
    hours: "e-portal 24/7 · Regional Centres: Mon–Fri 9AM–4PM",
    collection: "Now largely digital — the e-attestation certificate is downloaded from your HEC dashboard. A centre visit (biometrics/originals) is only required if your case needs it.",
    tips: [
      "The fee is now Rs. 3000 per document — guides quoting Rs. 800 are out of date.",
      "Remove plastic lamination before scanning/attesting — stamps won't stick to plastic.",
      "List every qualification from Matric onwards or the application stalls at verification.",
      "University verification is the slow, out-of-your-control part — apply well before any deadline.",
      "Bring at least 2 photocopies of every document if you're called to a Regional Centre."
    ]
  },
  {
    slug: "passport-renewal", org: "DGI&P", title: "Renew / apply for a passport",
    summary: "Machine-readable / e-passport from Immigration & Passports (DGIP).",
    lastVerified: "2026-08-14",
    source: { label: "dgip.gov.pk", url: "https://dgip.gov.pk/" },
    fee: "36-page 5-yr MRP: Rs. 4500 (Normal) / Rs. 7500 (Urgent) · 36-page 10-yr: Rs. 6700 / Rs. 11200",
    time: "Normal 10–15 working days · Urgent 4–7 working days",
    documents: [
      "Original CNIC + photocopy",
      "Previous passport (for renewal)",
      "Online appointment confirmation / fee challan",
      "2 passport-size photos as per DGIP spec"
    ],
    steps: [
      { title: "Apply online or book an appointment", detail: "Complete your application on the DGIP online portal (onlinemrp) or book a slot at a passport office." },
      { title: "Pay the passport fee", detail: "Pay online by Visa/Master card, or physically at a designated bank or e-Sahulat franchise. Keep the challan." },
      { title: "Visit for biometrics & photo", detail: "Attend your slot for fingerprints, photo and data verification." },
      { title: "Complete verification", detail: "The verification counter confirms your particulars." },
      { title: "Collect or receive by courier", detail: "Track via the portal; collect from the office or receive by courier per your chosen speed." }
    ],
    offices: ["Regional Passport Office (RPO)", "Executive Passport Centers", "DGIP online (onlinemrp.nadra.gov.pk)"],
    hours: "RPOs: Mon–Fri 8AM–1:30PM for new tokens (biometrics run later)",
    collection: "Not same-day — track online and collect from the office or receive by courier per your chosen speed.",
    tips: [
      "Reach before 8 AM at busy offices — the daily token quota can finish in the first two hours.",
      "The 10-year passport costs more upfront but saves a future renewal — worth it if you travel often.",
      "You can pay online by card or at an e-Sahulat franchise — no need to queue at a bank.",
      "Your photo must match DGIP spec (no glasses, plain background) or it's re-taken there.",
      "Carry the original CNIC of your father/spouse if names need cross-verification."
    ]
  },
  {
    slug: "fbr-ntn", org: "FBR", title: "Register for NTN & become a filer",
    summary: "Get a free National Tax Number on IRIS, then file to appear on the ATL.",
    lastVerified: "2026-08-14",
    source: { label: "iris.fbr.gov.pk", url: "https://iris.fbr.gov.pk/" },
    fee: "Free — NTN registration costs nothing. Late filers pay an ATL surcharge (Rs. 1000 for individuals).",
    time: "NTN: under 15 minutes online · ATL status: 7–30 days after filing (list updates every Monday)",
    documents: [
      "CNIC (13 digits, no dashes)",
      "Mobile number registered in your own name (CNIC)",
      "Personal email address",
      "Bank account details (IBAN)",
      "Employer / business or salary details (needed for the return)"
    ],
    steps: [
      { title: "Open the IRIS portal", detail: "Go to iris.fbr.gov.pk and click 'Registration for Unregistered Person' on the homepage." },
      { title: "Enter your details", detail: "Provide CNIC, address, mobile and email. A verification code is sent to your number and your email." },
      { title: "Verify with the SMS + email codes", detail: "Enter both codes to activate your IRIS account and set a password." },
      { title: "NTN is generated automatically", detail: "Your NTN is issued inside IRIS — usually under 15 minutes if your CNIC is properly linked with NADRA." },
      { title: "File your income tax return", detail: "Submit the annual return (form 114). This separate step is what actually makes you a 'filer'. TY2026 deadline: 30 Sep 2026." },
      { title: "Check the Active Taxpayer List", detail: "Your name appears on the ATL 7–30 days later; the list refreshes every Monday." }
    ],
    offices: ["IRIS online portal", "FBR Tax Facilitation Centre", "Tax Asaan mobile app"],
    hours: "IRIS online: 24/7 · Facilitation Centres: Mon–Fri 9AM–5PM",
    collection: "Fully online — the NTN certificate is downloaded from IRIS. There is nothing to collect in person.",
    tips: [
      "Your mobile number and email must be registered in your own name (CNIC) to receive the codes.",
      "Getting an NTN is NOT the same as being a filer — you become a filer only after you file the return.",
      "The Active Taxpayer List updates only on Mondays, so your filer status won't reflect instantly.",
      "TY2026 filing deadline is 30 September 2026 — filing late triggers the ATL surcharge.",
      "Lower withholding tax on property, banking and vehicles is the main reason to become a filer."
    ]
  },
  {
    slug: "domicile", org: "District Administration", title: "Get a Domicile certificate",
    summary: "Proof of permanent residence, required for jobs, quotas & admissions.",
    lastVerified: "2026-08-14",
    source: { label: "DC Office / provincial e-services", url: "https://islamabad.gov.pk/" },
    fee: "Rs. 200–500 (varies by district) + affidavit stamp paper",
    time: "7–15 working days after submission (includes residence verification)",
    documents: [
      "CNIC (or B-Form if under 18) — original + copy",
      "Father's / husband's CNIC copy",
      "Two passport-size photos",
      "Proof of residence — utility bill or property papers",
      "Educational certificate (e.g. Matric)",
      "Affidavit on stamp paper (attested by an oath commissioner)"
    ],
    steps: [
      { title: "Get the form (office or online)", detail: "Collect the domicile form from the DC office, or apply via your province's e-services portal — Punjab, Sindh and ICT have online systems." },
      { title: "Prepare documents & affidavit", detail: "Attach CNIC/B-Form, residence proof, photos, educational certificate and the affidavit on stamp paper." },
      { title: "Submit at the counter & pay", detail: "Submit the file at the designated counter and pay the fee (Rs. 200–500); collect your receipt/token." },
      { title: "Residence verification", detail: "Local police or the area patwari verify that you actually reside in the district." },
      { title: "Collect the certificate", detail: "Once verified, the DC office issues the signed domicile — collect on the date on your receipt." }
    ],
    offices: ["Deputy Commissioner (DC) Office", "Assistant Commissioner Office", "Provincial e-services portal (Punjab / Sindh / ICT)"],
    hours: "DC / AC offices: Mon–Fri 9AM–2PM for submissions",
    collection: "Not same-day — collect on the date printed on your receipt (usually 7–15 days later).",
    tips: [
      "Requirements vary by district — confirm the exact list at your DC office or provincial e-portal first.",
      "Punjab, Sindh and Islamabad now have online domicile e-services — check before queuing.",
      "The affidavit must be on the correct stamp paper, attested by an oath commissioner.",
      "A police/patwari residence check is part of the process — be reachable at your stated address.",
      "Bring the original CNIC of your father/husband, not just yours — it's checked for lineage."
    ]
  },
  {
    slug: "ibcc-attestation", org: "IBCC", title: "Attest / get equivalence (IBCC)",
    summary: "Inter Boards Coordination Commission — attestation & equivalence of certificates.",
    lastVerified: "2026-08-14",
    source: { label: "ibcc.edu.pk", url: "https://ibcc.edu.pk/" },
    fee: "Attestation: ~Rs. 1200 per original certificate · ~Rs. 800 per photocopy · Board verification ~Rs. 600 + Rs. 300 courier. Equivalence is a separate, higher fee.",
    time: "Attestation: same day (in person) · Board verification & equivalence: several working days",
    documents: [
      "Printed application form from the IBCC portal",
      "Original certificate + one photocopy of each",
      "Additional photocopies of every document to be attested",
      "Photocopies of the student's and father's CNIC / B-Form",
      "Paid fee challan or online payment receipt",
      "For equivalence: original foreign qualification + transcripts"
    ],
    steps: [
      { title: "Get board verification first", detail: "Before IBCC can attest, your matric/intermediate certificate must be verified by the issuing education board (~Rs. 600 + courier)." },
      { title: "Apply & book on the IBCC portal", detail: "Fill the application at ibcc.edu.pk, book an appointment, and print the form." },
      { title: "Pay the fee", detail: "Pay the per-document attestation (or equivalence) fee via bank/approved channel and keep the challan." },
      { title: "Submit at the IBCC office (or by courier)", detail: "Hand over originals + photocopies + form + challan; the counter verifies and issues a receipt." },
      { title: "Processing", detail: "Attestation is same-day; equivalence goes for evaluation and takes several working days." },
      { title: "Collect or receive by courier", detail: "For attestation, collect the same day (usually evening); for equivalence, collect on the printed date or by courier." }
    ],
    offices: ["IBCC Regional Office (Islamabad / Lahore / Karachi / etc.)", "IBCC online portal", "Issuing education board (for prior verification)"],
    hours: "Regional offices: Mon–Fri 9AM–1PM for submissions (verify on-site — not Google's listing)",
    collection: "Submit in the morning, then come back the SAME DAY around 3–5 PM to collect attested docs. Equivalence takes several days — collect on the printed date or by courier.",
    tips: [
      "Attestation ≠ equivalence: attestation stamps your Pakistani certificate; equivalence converts a FOREIGN qualification to its Pakistani equivalent. They are separate applications with different fees.",
      "Board verification comes first — IBCC won't attest a matric/inter certificate the board hasn't verified.",
      "Google's timing is frequently wrong — counters stop accepting new files ~1 hour before closing.",
      "You submit in the morning and collect the same evening — plan for two trips in one day, not one.",
      "Bring photocopies of BOTH the student's and father's CNIC even when the online list is vague.",
      "Fees are per document and add up fast — ~Rs. 1200 per original + ~Rs. 800 per photocopy."
    ]
  }
];

if (typeof module !== "undefined" && module.exports) module.exports = { GUIDES_SEED };
