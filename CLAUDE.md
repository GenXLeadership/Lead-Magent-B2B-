# GenX Leadership B2B Perspective Scan — Project Memory

## What this is
A standalone B2B lead-gen quiz for GenX Leadership Academy: 15 scored
behavioural/system statements across 5 areas (Market Clarity, Leadership
Alignment, Execution Systems, Marketing Performance, AI Enablement), with
"Not sure" visibility handling, deterministic scoring per the pilot master
spec, result-preview → lead-capture → full-result flow ending in a GenX
Leadership CTA. Static site — no framework, no backend server, no build step.
Mirrors the sibling Freedom Room B2C quiz's architecture (see
`GenXLeadership/Lead-magnet-B2C-`), but the two products and question sets
must never be merged.

Full product spec (locked scoring rules, all 15 question texts, result
profiles, visibility logic, CTA/CRM/analytics requirements) lives in the
handoff file the user supplied: "GenX Leadership B2B Perspective Scan: Pilot
Master Memory File", version 0.1. Treat that as the source of truth for any
copy, scoring, or logic question — this file just tracks build/deploy state.

## Brand
- Source: Google Doc "Logo" — GenX Leadership Academy Brand Identity
  Guidelines v1.0, 2026.
- Logo asset: `assets/genx-logo.png` (X-mark of ribboned wings + gold spark,
  "GenX" navy serif wordmark, "LEADERSHIP ACADEMY" tracked small-caps, ivory
  background).
- Palette (CSS custom properties in `styles.css`):
  - `--ink-navy: #0E1A3D` — primary (55%), authority/B2B trust
  - `--momentum-blue: #2C5AAE` — secondary (18%), modern tech/enablement
  - `--growth-green: #1B7A56` — secondary (15%), wealth/ROI
  - `--human-amber: #D9713C` — accent (7%), approachable/warm
  - `--heritage-gold: #C9A248` — accent (5%), hairlines/icons ONLY, not fills
  - `--ivory: #F6F3EC` — neutral background
  - `--charcoal: #24262B` — body text
  - `--slate: #8A8F98` — muted text/captions/labels
- Typography: serif display (wordmark uses a serif — pair with a web serif
  like Playfair Display or Lora for headings) + a clean sans body face.
  Not yet finalized; using Playfair Display (display) + Inter (body) as a
  placeholder pairing, matching the B2C project's use of Google Fonts.

## Decisions made with the user (this session)
- Build process: mirror the B2C project's build/process approach.
- Stack: static HTML/CSS/vanilla JS, same as B2C — will deploy the same way
  (Netlify manual zip) once a site exists; no repo/hosting created yet this
  session.
- GenX CTA / service details (name, price, booking URL, who conducts it) are
  **not yet confirmed** — using placeholder copy ("Request a GenX Leadership
  Review", placeholder mailto/booking link) per the master spec's Section 10
  CTA boundary. Swap when GenX confirms.
- Marketing Performance and AI Enablement areas are shown to **every**
  respondent in this pilot (not conditionally skipped) — matches spec
  Version 0.1 default; rely on "Not applicable" as the escape hatch.

## Repo / branch
- GitHub: `GenXLeadership/Lead-Magent-B2B-`
- Working branch: `claude/youthful-noether-586qap`

## Files
- `index.html` — shell, Google Fonts (Playfair Display + Inter), loads
  `js/quiz-data.js`, `js/scoring.js`, `js/app.js` in that order.
- `styles.css` — GenX brand tokens (CSS custom properties) + all component
  styles for every screen.
- `js/quiz-data.js` — canonical question bank (BQ1–BQ15), area mapping,
  response scale, Not-sure reasons, respondent-context and qualification
  questions, item-level first actions, all 8 result profiles (5 primary +
  Connected Constraints + Limited Visibility + No Single Constraint),
  strength copy, CTA copy, limitations statement. `QUIZ_VERSION = "b2b_v0.1"`.
- `js/scoring.js` — pure, DOM-free scoring functions: `calculateAreaScores`,
  `calculateVisibilityFlags`, `resolveConstraintRouting`, `resolveHighestArea`,
  `resolveLowestItem`, `computeResult`, `resolveTieBreakerChoice`. Implements
  the 0.25 tie threshold, 4-area eligibility floor, and 1.5 strength floor
  from the master spec's Sections 4/6/18.
- `js/app.js` — state machine + screen rendering (landing → privacy →
  respondent context → instructions → BQ1–15 with Not-sure follow-up → tie
  breaker if needed → result preview → lead capture → full result + CTA →
  confirmation) + `SHEET_ENDPOINT` placeholder + `submitLeadToSheet()`.
- `apps-script-lead-capture.gs` — Google Apps Script `doPost` source, with an
  explicit setup checklist at the top addressing the exact two mistakes that
  caused repeated failures on the B2C build (deployment access must be
  **Execute as: Me + Anyone**, and every code edit needs **Manage
  deployments → edit → New version → Deploy**, not just Save). See that file
  before doing anything with the backend.
- `assets/genx-logo.png` — GenX Leadership Academy logo, extracted from the
  brand guidelines doc.
- `netlify.toml` — `publish = "."`, `command = ""`.

## Build status
- Full pilot spec scaffolded: quiz-data (BQ1–BQ15), scoring engine matching
  Sections 4/6/9/18 of the master file, complete screen flow, GenX-branded
  styles, lead capture wiring (endpoint not yet live).
- Lead capture backend: `.gs` script written but **not yet deployed** — no
  Google Sheet has been created for B2B yet. Do NOT reuse the Freedom Room
  B2C sheet. Ask the user before creating the new Sheet/deployment, then
  follow `apps-script-lead-capture.gs`'s setup checklist exactly to avoid
  repeating the B2C access/versioning issues.
- Not yet deployed to Netlify or any other host.
- Not yet QA'd against the master spec's Section 12 test cases.

## Known open items (do not resolve without asking)
- Exact GenX service name/price/duration/booking URL for the CTA (currently
  a placeholder mailto link in `quiz-data.js` → `CTA_COPY`).
- Whether to fast-forward or PR to `main`.
- Creating the B2B Google Sheet + Apps Script deployment (separate from
  B2C's) and pasting the resulting URL into `js/app.js` → `SHEET_ENDPOINT`.
- Netlify site creation/hosting for this project (none exists yet).
- Final typography pairing — Playfair Display + Inter is a placeholder
  matching the B2C project's Google Fonts approach; the brand doc didn't
  specify exact web fonts.
