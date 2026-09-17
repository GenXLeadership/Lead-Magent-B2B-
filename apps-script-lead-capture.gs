/**
 * GenX Leadership B2B Perspective Scan — lead capture backend.
 *
 * ============================================================================
 * SETUP CHECKLIST — follow this exactly. The B2C sibling project (Freedom
 * Room) lost significant time to two specific mistakes here. Do NOT skip
 * either step below.
 * ============================================================================
 *
 * 1. Create a NEW Google Sheet dedicated to this B2B scan (do not reuse the
 *    Freedom Room B2C sheet — keep the two lead lists separate).
 *
 * 2. In that Sheet: Extensions -> Apps Script. Delete any boilerplate code
 *    and paste this entire file in.
 *
 * 3. Add a header row to Sheet1 matching HEADER_ROW below, in the same order
 *    (see the constant a few lines down) — the script does not create
 *    headers for you.
 *
 * 4. Deploy -> New deployment -> type "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    ^ THIS EXACT COMBINATION. If "Who has access" is anything other than
 *    "Anyone", Google intercepts the request with an auth redirect BEFORE
 *    doPost() ever runs — the Executions log will show zero entries even
 *    though the browser successfully sent the request. This was the #1
 *    source of confusion on the B2C build. Do not set it to
 *    "Anyone with a Google account" or "Only myself".
 *
 * 5. Copy the resulting /exec URL and paste it into js/app.js as
 *    SHEET_ENDPOINT (replacing "REPLACE_WITH_APPS_SCRIPT_EXEC_URL").
 *
 * 6. GOTCHA THAT WILL BITE YOU LATER: editing this script's code and hitting
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
 * 7. Test end-to-end from the actual deployed site (or locally via a static
 *    server), not by running doPost manually in the Apps Script editor —
 *    the editor's "Run" button doesn't exercise the web app auth path, so a
 *    misconfigured deployment can look fine there and still fail from the
 *    browser.
 *
 * 8. Check the Sheet after a real test submission to confirm a row appears
 *    with values landing in the correct columns before considering this done.
 * ============================================================================
 */

// Keep this in the exact column order you also use for the Sheet's header
// row. Extend both together if you add a field.
const HEADER_ROW = [
  "date",
  "quiz_version",
  "name",
  "email",
  "company",
  "consent",
  "role",
  "function",
  "visibility",
  "companySize",
  "sector",
  "BQ1", "BQ2", "BQ3", "BQ4", "BQ5", "BQ6", "BQ7", "BQ8", "BQ9",
  "BQ10", "BQ11", "BQ12", "BQ13", "BQ14", "BQ15",
  "result_type",
  "primary_area",
  "strength_areas",
  "first_action_item",
  "tie_breaker_used",
  "urgentConcern",
  "timeline",
  "consequence",
  "consideringSupport",
  "preferredFollowUp",
];

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    const data = JSON.parse(e.postData.contents);

    const row = HEADER_ROW.map((key) => {
      const value = data[key];
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
