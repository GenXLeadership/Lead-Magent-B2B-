// GenX Leadership B2B Perspective Scan — state machine + screen rendering.
// Pure vanilla JS, no framework, mirrors the Freedom Room B2C app.js pattern.

(function () {
  "use strict";

  // Placeholder endpoint — replace with the real Apps Script /exec URL once
  // deployed. See apps-script-lead-capture.gs and CLAUDE.md for setup steps.
  const SHEET_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbzb8dD9YBFMXmXXfYTJGc0_LuR4ugtEJkxARvzqAA6pOw3EQja1IQPu2vlhKKiF_1H1/exec";

  const root = document.getElementById("app");

  const state = {
    screen: "landing",
    context: {},
    responses: {}, // { BQ1: { value: 0-3|"not_sure", notSureReason? } }
    currentQuestionIndex: 0,
    pendingNotSureQuestionId: null,
    tieBreakerChoice: null,
    qualification: {},
    lead: {},
    result: null,
  };

  const TOTAL_QUESTIONS = QUESTIONS.length;

  function render() {
    root.innerHTML = "";
    const screens = {
      landing: renderLanding,
      privacy: renderPrivacy,
      context: renderContext,
      instructions: renderInstructions,
      question: renderQuestion,
      notSureReason: renderNotSureReason,
      tieBreaker: renderTieBreaker,
      preview: renderPreview,
      leadCapture: renderLeadCapture,
      fullResult: renderFullResult,
      confirmation: renderConfirmation,
    };
    const renderer = screens[state.screen];
    if (renderer) renderer();
  }

  function go(screen) {
    state.screen = screen;
    render();
    window.scrollTo(0, 0);
  }

  function brandHeader() {
    const el = document.createElement("div");
    el.className = "brand-header";
    el.innerHTML = `
      <img src="assets/genx-logo.png" alt="GenX Leadership Academy" />
      <div>
        <div class="brand-name">GenX Leadership Academy</div>
        <div class="brand-tag">B2B Perspective Scan</div>
      </div>
    `;
    return el;
  }

  function formatAreaList(areas) {
    const labels = areas.map((a) => AREA_LABELS[a]);
    if (labels.length <= 1) return labels.join("");
    if (labels.length === 2) return labels.join(" and ");
    return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
  }

  function progressBar(current, total) {
    const wrap = document.createElement("div");
    wrap.className = "progress-bar";
    const fill = document.createElement("div");
    fill.className = "progress-bar-fill";
    fill.style.width = `${Math.round((current / total) * 100)}%`;
    wrap.appendChild(fill);
    return wrap;
  }

  // ---------------------------------------------------------------------
  // Screen 1: Landing
  // ---------------------------------------------------------------------
  function renderLanding() {
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="eyebrow">Leadership Perspective Scan</span>
      <h1>What May Be Constraining Your Organisation's Progress?</h1>
      <p class="lede">Review 15 practical signals across market clarity, leadership
      alignment, execution, marketing performance, and AI enablement. Receive one
      constraint hypothesis, one verification question, and one action to take next.</p>
      <div class="callout">
        <strong>Before you start:</strong>
        <ul class="plain">
          <li>Takes approximately 5&ndash;7 minutes.</li>
          <li>Intended for leaders with cross-functional visibility.</li>
          <li>Answer based on the past six months, not what's planned or intended.</li>
          <li>"Not sure" is a valid answer &mdash; do not guess.</li>
          <li>Your result reflects your perspective, not a validated audit.</li>
        </ul>
      </div>
      <p class="muted">${RESPONDENT_PROMISE}</p>
    `;

    const startBtn = document.createElement("button");
    startBtn.className = "btn btn-primary btn-block";
    startBtn.textContent = "Start the Leadership Perspective Scan";
    startBtn.onclick = () => go("privacy");
    card.appendChild(startBtn);

    screen.appendChild(card);
    root.appendChild(screen);
  }

  // ---------------------------------------------------------------------
  // Screen 2: Privacy
  // ---------------------------------------------------------------------
  function renderPrivacy() {
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="eyebrow">Before you begin</span>
      <h2>How your information is used</h2>
      <ul class="plain">
        <li>Your responses are used to generate your scan result and, if you request
        it, to prepare a GenX Leadership conversation.</li>
        <li>Contact details you provide may be stored in GenX Leadership's CRM.</li>
        <li>You may receive email related to your result and a possible follow-up
        conversation. You can unsubscribe at any time.</li>
        <li>Results are never used for hiring, promotion, performance evaluation,
        disciplinary action, or employment eligibility.</li>
      </ul>
      <p class="muted">Please do not enter confidential customer, employee, financial,
      security, or proprietary information in any open-text field.</p>
    `;

    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-block";
    btn.textContent = "Continue";
    btn.onclick = () => go("context");
    card.appendChild(btn);

    screen.appendChild(card);
    root.appendChild(screen);
  }

  // ---------------------------------------------------------------------
  // Screen 3: Respondent context (unscored)
  // ---------------------------------------------------------------------
  function renderContext() {
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    const heading = document.createElement("h2");
    heading.textContent = "A little about you and your organisation";
    card.appendChild(heading);

    const note = document.createElement("p");
    note.className = "muted";
    note.textContent =
      "These answers personalise interpretation and do not change your score.";
    card.appendChild(note);

    RESPONDENT_CONTEXT_QUESTIONS.forEach((q) => {
      const field = document.createElement("div");
      field.className = "field";
      const label = document.createElement("label");
      label.textContent = q.label;
      field.appendChild(label);

      const select = document.createElement("select");
      select.innerHTML =
        `<option value="">Select...</option>` +
        q.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
      select.value = state.context[q.id] || "";
      select.onchange = (e) => {
        state.context[q.id] = e.target.value;
      };
      field.appendChild(select);
      card.appendChild(field);
    });

    const visibilityNote = document.createElement("div");
    visibilityNote.className = "callout amber";
    visibilityNote.id = "visibility-note";
    visibilityNote.style.display = "none";
    visibilityNote.textContent =
      "You can continue, but your result will describe your team or functional perspective rather than the organisation as a whole.";
    card.appendChild(visibilityNote);

    const continueBtn = document.createElement("button");
    continueBtn.className = "btn btn-primary btn-block";
    continueBtn.textContent = "Continue";
    continueBtn.onclick = () => {
      const missing = RESPONDENT_CONTEXT_QUESTIONS.some((q) => !state.context[q.id]);
      if (missing) {
        alert("Please answer all questions before continuing.");
        return;
      }
      go("instructions");
    };
    card.appendChild(continueBtn);

    // Re-render note visibility on visibility-field change without full re-render.
    const visibilitySelect = card.querySelectorAll("select")[2];
    if (visibilitySelect) {
      visibilitySelect.addEventListener("change", (e) => {
        const val = e.target.value;
        visibilityNote.style.display =
          val === "Limited visibility beyond my immediate role" ? "block" : "none";
      });
    }

    screen.appendChild(card);
    root.appendChild(screen);
  }

  // ---------------------------------------------------------------------
  // Screen 4: Instructions
  // ---------------------------------------------------------------------
  function renderInstructions() {
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>How to answer</h2>
      <p>Think about how your organisation has actually operated during the
      <strong>past six months</strong>. Answer based on what happens in practice,
      not what is planned, written in a policy, or intended but rarely followed.</p>
      <p>If you do not have enough information, choose <strong>Not sure</strong>.
      Do not guess.</p>
      <div class="callout navy">
        <strong>Response scale</strong>
        <ul class="plain">
          ${RESPONSE_SCALE.filter((s) => s.value !== "not_sure")
            .map((s) => `<li><strong>${s.value} &mdash; ${s.label}:</strong> ${s.description}</li>`)
            .join("")}
        </ul>
      </div>
    `;

    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-block";
    btn.textContent = "Begin the 15 statements";
    btn.onclick = () => {
      state.currentQuestionIndex = 0;
      go("question");
    };
    card.appendChild(btn);

    screen.appendChild(card);
    root.appendChild(screen);
  }

  // ---------------------------------------------------------------------
  // Screens 5-19: BQ1-BQ15
  // ---------------------------------------------------------------------
  function renderQuestion() {
    const question = QUESTIONS[state.currentQuestionIndex];
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());
    screen.appendChild(progressBar(state.currentQuestionIndex + 1, TOTAL_QUESTIONS));

    const card = document.createElement("div");
    card.className = "card";

    const eyebrow = document.createElement("span");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `Statement ${state.currentQuestionIndex + 1} of ${TOTAL_QUESTIONS}`;
    card.appendChild(eyebrow);

    const text = document.createElement("div");
    text.className = "question-text";
    text.textContent = question.text;
    card.appendChild(text);

    const options = document.createElement("div");
    options.className = "scale-options";

    const existing = state.responses[question.id];

    RESPONSE_SCALE.forEach((option) => {
      const optEl = document.createElement("label");
      optEl.className =
        "scale-option" +
        (option.value === "not_sure" ? " not-sure" : "") +
        (existing && existing.value === option.value ? " selected" : "");

      optEl.innerHTML = `
        <input type="radio" name="scale" value="${option.value}" ${
        existing && existing.value === option.value ? "checked" : ""
      } />
        <div>
          <div class="scale-label">${option.label}</div>
          <div class="scale-desc">${option.description}</div>
        </div>
      `;

      // Attach the handler to the radio input itself, not the wrapping
      // label. A click on a <label> that contains its <input> fires a
      // native click on the label AND a synthetic click on the input that
      // bubbles back through the label — listening on the label double-
      // fires the handler (and silently skips every other question).
      const input = optEl.querySelector("input");
      input.onclick = (e) => {
        e.stopPropagation();
        if (option.value === "not_sure") {
          state.pendingNotSureQuestionId = question.id;
          go("notSureReason");
          return;
        }
        state.responses[question.id] = { value: option.value };
        advanceQuestion();
      };

      options.appendChild(optEl);
    });

    card.appendChild(options);

    if (state.currentQuestionIndex > 0) {
      const backBtn = document.createElement("button");
      backBtn.className = "btn btn-secondary btn-block";
      backBtn.style.marginTop = "16px";
      backBtn.textContent = "Back";
      backBtn.onclick = () => {
        state.currentQuestionIndex -= 1;
        go("question");
      };
      card.appendChild(backBtn);
    }

    screen.appendChild(card);
    root.appendChild(screen);
  }

  function advanceQuestion() {
    if (state.currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      state.currentQuestionIndex += 1;
      go("question");
    } else {
      finishScan();
    }
  }

  // ---------------------------------------------------------------------
  // Not sure follow-up
  // ---------------------------------------------------------------------
  function renderNotSureReason() {
    const question = QUESTIONS.find((q) => q.id === state.pendingNotSureQuestionId);
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="eyebrow">Quick follow-up</span>
      <h3>What is the main reason you cannot judge this statement?</h3>
      <p class="muted">"${question.text}"</p>
    `;

    const reasonList = document.createElement("div");
    reasonList.className = "reason-options";

    NOT_SURE_REASONS.forEach((reason) => {
      const el = document.createElement("div");
      el.className = "reason-option";
      el.textContent = reason.label;
      el.onclick = () => {
        state.responses[question.id] = {
          value: "not_sure",
          notSureReason: reason.value,
        };
        state.pendingNotSureQuestionId = null;
        advanceQuestion();
      };
      reasonList.appendChild(el);
    });

    card.appendChild(reasonList);
    screen.appendChild(card);
    root.appendChild(screen);
  }

  // ---------------------------------------------------------------------
  // Scoring + routing
  // ---------------------------------------------------------------------
  function finishScan() {
    state.result = computeResult(state.responses);
    const routing = state.result.routing;

    if (routing.resultType === "connected_constraints" || routing.resultType === "no_single_constraint") {
      go("tieBreaker");
    } else {
      go("preview");
    }
  }

  function renderTieBreaker() {
    const routing = state.result.routing;
    const candidateAreas =
      routing.resultType === "no_single_constraint" ? routing.eligibleAreas : routing.tiedAreas;

    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="eyebrow">One more question</span>
      <h2>Which of these issues is creating the greatest difficulty for your organisation right now?</h2>
      <p class="muted">${
        routing.resultType === "no_single_constraint"
          ? "Your responses show a broadly similar pattern across all five areas. Choose the one creating the most urgent difficulty."
          : "Your responses do not point to one clearly separate constraint. These areas appear similarly important from your perspective."
      }</p>
    `;

    const chipList = document.createElement("div");
    chipList.className = "tie-area-list";
    candidateAreas.forEach((area) => {
      const chip = document.createElement("div");
      chip.className = "tie-area-chip" + (state.tieBreakerChoice === area ? " selected" : "");
      chip.textContent = AREA_LABELS[area];
      chip.onclick = () => {
        state.tieBreakerChoice = area;
        render();
      };
      chipList.appendChild(chip);
    });
    card.appendChild(chipList);

    const continueBtn = document.createElement("button");
    continueBtn.className = "btn btn-primary btn-block";
    continueBtn.textContent = "Continue";
    continueBtn.disabled = !state.tieBreakerChoice;
    continueBtn.onclick = () => {
      if (!state.tieBreakerChoice) return;
      const resolved = resolveTieBreakerChoice(state.tieBreakerChoice, state.responses);
      state.result.primaryArea = resolved.primaryArea;
      state.result.firstAction = resolved.firstAction;
      state.result.tieBreakerUsed = true;
      go("preview");
    };
    card.appendChild(continueBtn);

    screen.appendChild(card);
    root.appendChild(screen);
  }

  // ---------------------------------------------------------------------
  // Result preview (before lead capture)
  // ---------------------------------------------------------------------
  function renderPreview() {
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";

    const result = state.result;
    const isLimited = result.routing.resultType === "limited_visibility";

    if (isLimited) {
      card.innerHTML = `
        <span class="eyebrow">Your result is ready</span>
        <h2>Your first finding is limited organisational visibility</h2>
        <p class="lede">Your answers do not provide enough comparable information to
        select one company-wide constraint responsibly. This should not be interpreted
        as failure.</p>
      `;
    } else {
      const primaryLabel = AREA_LABELS[result.primaryArea];
      const strengthLabel =
        result.strength.areas.length > 0 ? formatAreaList(result.strength.areas) : null;

      card.innerHTML = `
        <span class="eyebrow">Your result is ready</span>
        <h2>Your responses suggest that <strong>${primaryLabel}</strong> may be a
        useful constraint to investigate.</h2>
        ${
          strengthLabel
            ? `<p class="lede">A reported strength is <strong>${strengthLabel}</strong>.</p>`
            : ""
        }
        <p class="muted">This is based on your perspective and should be checked
        against additional evidence.</p>
      `;
    }

    const btn = document.createElement("button");
    btn.className = "btn btn-primary btn-block";
    btn.textContent = "See your full result";
    btn.onclick = () => go("leadCapture");
    card.appendChild(btn);

    screen.appendChild(card);
    root.appendChild(screen);
  }

  // ---------------------------------------------------------------------
  // Lead capture
  // ---------------------------------------------------------------------
  function renderLeadCapture() {
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h2>Where should we send your full result?</h2>`;

    const form = document.createElement("form");

    const fields = [
      { id: "name", label: "Full name", type: "text", required: true },
      { id: "email", label: "Work email", type: "email", required: true },
      { id: "company", label: "Company name", type: "text", required: true },
    ];

    fields.forEach((f) => {
      const field = document.createElement("div");
      field.className = "field";
      field.innerHTML = `
        <label for="${f.id}">${f.label}</label>
        <input type="${f.type}" id="${f.id}" name="${f.id}" ${f.required ? "required" : ""} />
      `;
      form.appendChild(field);
    });

    QUALIFICATION_QUESTIONS.forEach((q) => {
      const field = document.createElement("div");
      field.className = "field";
      const label = document.createElement("label");
      label.textContent = q.label;
      field.appendChild(label);

      if (q.type === "select") {
        const select = document.createElement("select");
        select.name = q.id;
        select.innerHTML =
          `<option value="">Select...</option>` +
          q.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
        select.onchange = (e) => (state.qualification[q.id] = e.target.value);
        field.appendChild(select);
      } else {
        const textarea = document.createElement("textarea");
        textarea.name = q.id;
        textarea.oninput = (e) => (state.qualification[q.id] = e.target.value);
        field.appendChild(textarea);
      }
      form.appendChild(field);
    });

    const consentField = document.createElement("div");
    consentField.className = "field checkbox-field";
    consentField.innerHTML = `
      <input type="checkbox" id="consent" required />
      <label for="consent">I consent to receive my result and related communication
      from GenX Leadership Academy by email.</label>
    `;
    form.appendChild(consentField);

    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "btn btn-primary btn-block";
    submitBtn.textContent = "Get my full result";
    form.appendChild(submitBtn);

    form.onsubmit = (e) => {
      e.preventDefault();
      state.lead = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        company: form.company.value.trim(),
      };
      submitLeadToSheet();
      go("fullResult");
    };

    card.appendChild(form);
    screen.appendChild(card);
    root.appendChild(screen);
  }

  function submitLeadToSheet() {
    if (!SHEET_ENDPOINT || SHEET_ENDPOINT.indexOf("REPLACE_WITH") === 0) {
      console.warn("Lead capture endpoint not configured yet — skipping submit.");
      return;
    }

    const result = state.result;
    const payload = {
      date: new Date().toISOString(),
      quiz_version: QUIZ_VERSION,
      ...state.lead,
      consent: true,
      ...state.context,
      ...QUESTIONS.reduce((acc, q) => {
        const r = state.responses[q.id];
        acc[q.id] = r ? (r.value === "not_sure" ? `not_sure:${r.notSureReason}` : r.value) : "";
        return acc;
      }, {}),
      result_type: result.routing.resultType,
      primary_area: result.primaryArea || "",
      strength_areas: result.strength.areas.join("|"),
      first_action_item: (result.firstAction && result.firstAction.itemId) || "",
      tie_breaker_used: !!result.tieBreakerUsed,
      ...state.qualification,
    };

    fetch(SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Lead submit failed:", err));
  }

  // ---------------------------------------------------------------------
  // Full result page
  // ---------------------------------------------------------------------
  function renderFullResult() {
    const printable = document.createElement("div");
    printable.id = "printable-result";

    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.appendChild(buildResultReportHeader());

    const result = state.result;

    if (result.routing.resultType === "limited_visibility") {
      card.appendChild(buildLimitedVisibilityResult(result));
    } else {
      card.appendChild(buildPrimaryResult(result));
    }

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "btn btn-secondary btn-block no-print";
    downloadBtn.style.marginTop = "20px";
    downloadBtn.textContent = "Download your result (PDF)";
    downloadBtn.onclick = () => window.print();
    card.appendChild(downloadBtn);

    screen.appendChild(card);
    printable.appendChild(screen);

    const ctaScreen = document.createElement("div");
    ctaScreen.className = "screen";
    ctaScreen.style.marginTop = "20px";
    ctaScreen.appendChild(buildCta());
    printable.appendChild(ctaScreen);

    root.appendChild(printable);
  }

  function buildResultReportHeader() {
    const wrap = document.createElement("div");
    wrap.className = "report-header";
    const preparedFor = state.lead.company || state.lead.name || "";
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    wrap.innerHTML = `
      <div class="report-header-row">
        ${preparedFor ? `<span>Prepared for <strong>${preparedFor}</strong></span>` : "<span></span>"}
        <span>${dateStr}</span>
      </div>
      <hr class="section-divider" />
    `;
    return wrap;
  }

  function buildPrimaryResult(result) {
    const wrap = document.createElement("div");
    const area = result.primaryArea;
    const profile = RESULT_PROFILES[area];
    const strengthAreas = result.strength.areas;

    wrap.innerHTML = `
      <p class="muted">This result reflects one respondent's view, not a validated
      company diagnosis.</p>
      <span class="result-badge">Constraint hypothesis</span>
      <h2>${profile.label}</h2>
      <p class="lede">${profile.coreMeaning}</p>

      <h3>How this may appear</h3>
      <ul class="plain">${profile.howItMayAppear.map((i) => `<li>${i}</li>`).join("")}</ul>

      <h3>What it may cost</h3>
      <ul class="plain">${profile.whatItMayCost.map((i) => `<li>${i}</li>`).join("")}</ul>

      <hr class="section-divider" />

      ${
        strengthAreas.length > 0
          ? `<span class="result-badge strength">Reported strength</span>
             ${
               result.strength.belowFloor
                 ? `<p>Your responses do not show one consistently established area yet. The
                    relatively strongest area is <strong>${AREA_LABELS[strengthAreas[0]]}</strong>,
                    but it may still need attention.</p>`
                 : strengthAreas.map((a) => `<p>${STRENGTH_COPY[a]}</p>`).join("")
             }
             <hr class="section-divider" />`
          : ""
      }

      <h3>Verification question</h3>
      <div class="callout">${VERIFICATION_QUESTIONS[area]}</div>

      <h3>Your seven-day action</h3>
      <div class="callout amber">
        ${
          result.firstAction && result.firstAction.action
            ? result.firstAction.action
            : profile.sevenDayAction
        }
      </div>
      ${result.firstAction && result.firstAction.tie ? `<p class="muted">Note: more than one statement in this area scored lowest; we selected the first in our standard order.</p>` : ""}

      <h3>What a GenX Leadership conversation would examine</h3>
      <p>${DISCUSSION_TOPICS[area]}</p>

      <p class="muted"><em>${profile.interpretationBoundary}</em></p>

      ${buildVisibilityNote(result)}

      <div class="footer-note">
        <p>${LIMITATIONS_STATEMENT}</p>
        <p>${EMPLOYMENT_USE_STATEMENT}</p>
      </div>
    `;
    return wrap;
  }

  function buildLimitedVisibilityResult(result) {
    const wrap = document.createElement("div");
    const eligible = result.routing.eligibleAreas || [];
    const notEligible = AREAS.filter((a) => !eligible.includes(a));

    wrap.innerHTML = `
      <span class="result-badge">Limited visibility</span>
      <h2>Your first finding is limited organisational visibility</h2>
      <p class="lede">Your answers do not provide enough comparable information to
      select one company-wide constraint responsibly. This may reflect the
      boundaries of your role, unavailable information, areas that do not apply,
      or questions that need clarification. It should not be interpreted as
      failure.</p>

      <h3>Areas with enough information</h3>
      <ul class="plain">${
        eligible.length > 0
          ? eligible.map((a) => `<li>${AREA_LABELS[a]}</li>`).join("")
          : "<li>None &mdash; fewer than two scorable answers were recorded in every area.</li>"
      }</ul>

      <h3>Areas limited by visibility, relevance, or unclear wording</h3>
      <ul class="plain">${notEligible.map((a) => `<li>${AREA_LABELS[a]}</li>`).join("")}</ul>

      <h3>Recommendation</h3>
      <p>Select the two unanswered areas most relevant to the organisation. Ask
      the responsible leader to supply one current measure, one process example,
      and one recent decision that demonstrates how each area operates.</p>

      ${buildVisibilityNote(result)}

      <div class="footer-note">
        <p>${LIMITATIONS_STATEMENT}</p>
        <p>${EMPLOYMENT_USE_STATEMENT}</p>
      </div>
    `;
    return wrap;
  }

  function buildVisibilityNote(result) {
    const flags = result.visibilityFlags;
    if (flags.totalNotSure === 0) return "";
    return `
      <div class="callout navy">
        You selected "Not sure" for ${flags.totalNotSure} statement${
      flags.totalNotSure === 1 ? "" : "s"
    }. Those answers were not scored as absent. They indicate where your view is
        limited, where information may not travel reliably, or where the scan may
        need better wording.
      </div>
    `;
  }

  function buildCta() {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${CTA_COPY.heading}</h2>
      <p>${CTA_COPY.body}</p>
    `;
    const btn = document.createElement("a");
    btn.className = "btn btn-cta btn-block";
    // CTA_COPY.buttonHref is intentionally left empty until GenX supplies
    // the real booking/application URL (see js/quiz-data.js). Until then,
    // the button renders and still confirms the request, but does not
    // navigate anywhere or reload the page.
    const hasRealLink = Boolean(CTA_COPY.buttonHref);
    btn.href = hasRealLink ? CTA_COPY.buttonHref : "#";
    if (hasRealLink) {
      btn.target = "_blank";
      btn.rel = "noopener";
    }
    btn.textContent = CTA_COPY.buttonLabel;
    btn.onclick = (e) => {
      if (!hasRealLink) e.preventDefault();
      go("confirmation");
    };
    card.appendChild(btn);
    return card;
  }

  // ---------------------------------------------------------------------
  // Confirmation
  // ---------------------------------------------------------------------
  function renderConfirmation() {
    const screen = document.createElement("div");
    screen.className = "screen";
    screen.appendChild(brandHeader());

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>Thank you</h2>
      <p>We've sent your result to your email. If you requested a GenX Leadership
      conversation, someone from the team will follow up shortly.</p>
    `;
    screen.appendChild(card);
    root.appendChild(screen);
  }

  render();
})();
