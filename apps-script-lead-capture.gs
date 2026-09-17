/**
 * GenX Leadership B2B Perspective Scan — lead capture backend.
 *
 * ============================================================================
 * SETUP CHECKLIST — follow this exactly. The B2C sibling project (Freedom
 * Room) lost significant time to two specific mistakes here. Do NOT skip
 * either step below.
 * ============================================================================
 *
 * 1. Open the Sheet this is going into (a NEW Sheet dedicated to this B2B
 *    scan — do not reuse the Freedom Room B2C sheet, keep the two lead lists
 *    separate). Extensions -> Apps Script. Delete any boilerplate code and
 *    paste this entire file in.
 *
 * 2. Run the one-time setup: in the Apps Script editor's toolbar, select the
 *    function dropdown (next to Debug), choose "setupSheet", then click Run.
 *    The first time you do this it will ask for authorization — approve it
 *    (it's your own script touching your own sheet). This writes the two-row
 *    structured header (group labels + field labels below them), freezes
 *    them, and colors them in the GenX brand navy.
 *    You do NOT need to type any headers by hand — this does it for you.
 *    (If you skip this step, doPost() below will auto-run it on the very
 *    first form submission anyway, as a safety net — but running it manually
 *    first means you get to see the formatted sheet before any real data
 *    lands in it.)
 *
 * 3. Deploy -> New deployment -> type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    ^ THIS EXACT COMBINATION. If "Who has access" is anything other than
 *    "Anyone", Google intercepts the request with an auth redirect BEFORE
 *    doPost() ever runs — the Executions log will show zero entries even
 *    though the browser successfully sent the request. This was the #1
 *    source of confusion on the B2C build. Do not set it to
 *    "Anyone with a Google account" or "Only myself".
 *
 * 4. Copy the resulting /exec URL and send it back — it needs to be pasted
 *    into js/app.js as SHEET_ENDPOINT (replacing
 *    "REPLACE_WITH_APPS_SCRIPT_EXEC_URL").
 *
 * 5. GOTCHA THAT WILL BITE YOU LATER: editing this script's code and hitting
 *    Save is NOT enough to update the live endpoint. The /exec URL keeps
 *    serving whatever code was live at the last deployment. Every time you
 *    change this file, you MUST go:
 *      Deploy -> Manage deployments -> (pencil/edit icon) -> Version:
 *      "New version" -> Deploy.
 *    Re-selecting "New deployment" instead of editing the existing one will
 *    also work but generates a new URL you'd then have to re-paste into
 *    app.js — prefer "Manage deployments" -> edit -> New version so the URL
 *    stays stable.
 *
 * 6. Test end-to-end from the actual deployed site (or locally via a static
 *    server), not by running doPost manually in the Apps Script editor —
 *    the editor's "Run" button doesn't exercise the web app auth path, so a
 *    misconfigured deployment can look fine there and still fail from the
 *    browser.
 *
 * 7. Check the Sheet after a real test submission to confirm a row appears
 *    below the header, with values landing in the correct columns, before
 *    considering this done.
 * ============================================================================
 */

const SHEET_NAME = "Leads";

// Single source of truth for column order, the human-readable header text,
// and which group each column is filed under. Extend this array (not a
// separate header list) if you ever add a new field — setupSheet() and
// doPost() both read from here, so the sheet and the data stay in sync.
const FIELDS = [
  { key: "date", label: "Date", group: "Submission" },
  { key: "quiz_version", label: "Scan Version", group: "Submission" },

  { key: "name", label: "Name", group: "Lead" },
  { key: "email", label: "Email", group: "Lead" },
  { key: "company", label: "Company", group: "Lead" },
  { key: "consent", label: "Consent", group: "Lead" },

  { key: "role", label: "Role", group: "Respondent Context" },
  { key: "function", label: "Function", group: "Respondent Context" },
  { key: "visibility", label: "Visibility", group: "Respondent Context" },
  { key: "companySize", label: "Company Size", group: "Respondent Context" },
  { key: "sector", label: "Sector", group: "Respondent Context" },

  { key: "BQ1", label: "BQ1 — Customer intelligence", group: "Market Clarity" },
  { key: "BQ2", label: "BQ2 — Differentiated value", group: "Market Clarity" },
  { key: "BQ3", label: "BQ3 — Evidence before investment", group: "Market Clarity" },

  { key: "BQ4", label: "BQ4 — Shared direction", group: "Leadership Alignment" },
  { key: "BQ5", label: "BQ5 — Outcome ownership", group: "Leadership Alignment" },
  { key: "BQ6", label: "BQ6 — Decision rights", group: "Leadership Alignment" },

  { key: "BQ7", label: "BQ7 — Process resilience", group: "Execution Systems" },
  { key: "BQ8", label: "BQ8 — Outcome measurement", group: "Execution Systems" },
  { key: "BQ9", label: "BQ9 — Corrective learning", group: "Execution Systems" },

  { key: "BQ10", label: "BQ10 — Commercial marketing measurement", group: "Marketing Performance" },
  { key: "BQ11", label: "BQ11 — Customer-journey visibility", group: "Marketing Performance" },
  { key: "BQ12", label: "BQ12 — Marketing experimentation", group: "Marketing Performance" },

  { key: "BQ13", label: "BQ13 — Outcome-led AI selection", group: "AI Enablement" },
  { key: "BQ14", label: "BQ14 — AI information governance", group: "AI Enablement" },
  { key: "BQ15", label: "BQ15 — AI value measurement", group: "AI Enablement" },

  { key: "result_type", label: "Result Type", group: "Result" },
  { key: "primary_area", label: "Primary Area", group: "Result" },
  { key: "strength_areas", label: "Strength Area(s)", group: "Result" },
  { key: "first_action_item", label: "First Action Item", group: "Result" },
  { key: "tie_breaker_used", label: "Tie-Breaker Used", group: "Result" },

  { key: "urgentConcern", label: "Most Urgent Concern", group: "Qualification" },
  { key: "timeline", label: "Desired Timeline", group: "Qualification" },
  { key: "consequence", label: "Consequence If Unresolved", group: "Qualification" },
  { key: "consideringSupport", label: "Considering External Support", group: "Qualification" },
  { key: "preferredFollowUp", label: "Preferred Follow-Up", group: "Qualification" },
];

const GROUP_COLOR = "#0E1A3D"; // Ink Navy
const LABEL_BG = "#F6F3EC"; // Ivory
const LABEL_COLOR = "#24262B"; // Charcoal

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/**
 * One-time (idempotent) setup: writes the two-row structured header —
 * a merged group-label row above a per-column field-label row — freezes
 * both rows, and applies brand coloring. Safe to re-run; it just rewrites
 * the header rows without touching any data rows below them.
 */
function setupSheet() {
  const sheet = getOrCreateSheet_();
  const numCols = FIELDS.length;

  sheet.getRange(1, 1, 2, numCols).breakApart(); // undo any previous merges first
  sheet.getRange(1, 1, 2, numCols).clearContent();

  // Row 2: field labels (one per column).
  const labelRow = FIELDS.map((f) => f.label);
  sheet.getRange(2, 1, 1, numCols).setValues([labelRow]);

  // Row 1: group labels, merged across each contiguous run of columns that
  // share the same group.
  let col = 1;
  while (col <= numCols) {
    const group = FIELDS[col - 1].group;
    let span = 1;
    while (col + span - 1 < numCols && FIELDS[col + span - 1].group === group) {
      span += 1;
    }
    const range = sheet.getRange(1, col, 1, span);
    if (span > 1) range.merge();
    range.setValue(group);
    col += span;
  }

  // Formatting.
  sheet
    .getRange(1, 1, 1, numCols)
    .setBackground(GROUP_COLOR)
    .setFontColor("#FFFFFF")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet
    .getRange(2, 1, 1, numCols)
    .setBackground(LABEL_BG)
    .setFontColor(LABEL_COLOR)
    .setFontWeight("bold")
    .setWrap(true);

  sheet.setFrozenRows(2);
  sheet.autoResizeColumns(1, numCols);
}

function ensureHeaderRow_(sheet) {
  if (sheet.getLastRow() < 2) {
    setupSheet();
  }
}

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    ensureHeaderRow_(sheet);

    const data = JSON.parse(e.postData.contents);

    const row = FIELDS.map((f) => {
      const value = data[f.key];
      if (value === undefined || value === null) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return value;
    });

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "ok" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
