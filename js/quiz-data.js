// GenX Leadership B2B Perspective Scan — canonical question bank and copy.
// Source of truth: "GenX Leadership B2B Perspective Scan: Pilot Master
// Memory File", version 0.1. Do not merge with the Freedom Room B2C quiz.
// Keep BQ1-BQ15 IDs stable.

const QUIZ_VERSION = "b2b_v0.1";

const AREAS = [
  "marketClarity",
  "leadershipAlignment",
  "executionSystems",
  "marketingPerformance",
  "aiEnablement",
];

const AREA_LABELS = {
  marketClarity: "Market Clarity",
  leadershipAlignment: "Leadership Alignment",
  executionSystems: "Execution Systems",
  marketingPerformance: "Marketing Performance",
  aiEnablement: "AI Enablement",
};

// Response scale — 0-3 scored, "not_sure" unscored.
const RESPONSE_SCALE = [
  {
    value: 0,
    label: "Not in place",
    description: "There is little or no evidence that this currently happens.",
  },
  {
    value: 1,
    label: "Informal",
    description: "It happens occasionally or depends on particular individuals.",
  },
  {
    value: 2,
    label: "Defined but inconsistent",
    description: "A recognised process exists, but it is not applied or reviewed consistently.",
  },
  {
    value: 3,
    label: "Consistent and reviewed",
    description: "It is standard practice and is regularly reviewed or improved.",
  },
  {
    value: "not_sure",
    label: "Not sure",
    description: "I do not have enough information to judge.",
  },
];

const NOT_SURE_REASONS = [
  { value: "outside_role", label: "Outside my area of responsibility" },
  { value: "info_unavailable", label: "Information is not available to me" },
  { value: "not_applicable", label: "This does not apply to our organisation" },
  { value: "unclear_wording", label: "I am unsure what the statement means" },
];

// Respondent-fit / unscored context, asked before scored items.
const RESPONDENT_CONTEXT_QUESTIONS = [
  {
    id: "role",
    label: "Which best describes your role?",
    type: "select",
    options: [
      "Founder or owner",
      "Chief executive or executive director",
      "C-suite or executive-team member",
      "Business-unit leader",
      "Senior functional leader",
      "Manager",
      "Other",
    ],
  },
  {
    id: "function",
    label: "Which function are you primarily responsible for?",
    type: "select",
    options: [
      "General management / cross-functional",
      "Sales or commercial",
      "Marketing",
      "Operations",
      "Finance",
      "Technology / IT",
      "HR / People",
      "Other",
    ],
  },
  {
    id: "visibility",
    label: "How much visibility do you have across the organisation?",
    type: "select",
    options: [
      "Full cross-functional visibility",
      "Visibility across most functions",
      "Visibility mainly within my own function or team",
      "Limited visibility beyond my immediate role",
    ],
  },
  {
    id: "companySize",
    label: "Approximately how many employees work in the organisation?",
    type: "select",
    options: ["1-10", "11-50", "51-200", "201-500", "500+"],
  },
  {
    id: "sector",
    label: "Which sector best describes the organisation?",
    type: "select",
    options: [
      "Professional or financial services",
      "Technology or software",
      "Manufacturing or industrial",
      "Retail or e-commerce",
      "Healthcare or life sciences",
      "Education",
      "Construction or real estate",
      "Nonprofit or public sector",
      "Other",
    ],
  },
];

// Qualification fields — collected after scored items, never affect scoring.
const QUALIFICATION_QUESTIONS = [
  {
    id: "urgentConcern",
    label: "What is the most urgent business concern on your mind right now?",
    type: "textarea",
  },
  {
    id: "timeline",
    label: "What is your desired timeline for making progress on this?",
    type: "select",
    options: [
      "Immediately",
      "Within 1 month",
      "Within 1 quarter",
      "Within 6-12 months",
      "No fixed timeline",
    ],
  },
  {
    id: "consequence",
    label: "What happens if this issue stays unresolved for another year?",
    type: "textarea",
  },
  {
    id: "consideringSupport",
    label: "Are you currently considering external support for this?",
    type: "select",
    options: ["Yes, actively", "Open to it", "Not yet", "Not sure"],
  },
  {
    id: "preferredFollowUp",
    label: "How would you prefer to be followed up with?",
    type: "select",
    options: ["Email", "Phone call", "Video call", "No preference"],
  },
];

// The 15 stable scored items, three per area, in fixed pilot order.
const QUESTIONS = [
  {
    id: "BQ1",
    area: "marketClarity",
    text: "Our company uses current customer evidence when making important market, product, or service decisions.",
    signal: "Customer intelligence",
  },
  {
    id: "BQ2",
    area: "marketClarity",
    text: "Our leaders can clearly explain why priority customers should choose us over their strongest alternative.",
    signal: "Differentiated value",
  },
  {
    id: "BQ3",
    area: "marketClarity",
    text: "Before a major investment, we test the decision against current market evidence.",
    signal: "Evidence before investment",
  },
  {
    id: "BQ4",
    area: "leadershipAlignment",
    text: "Managers can clearly explain the organisation's current priorities.",
    signal: "Shared direction",
  },
  {
    id: "BQ5",
    area: "leadershipAlignment",
    text: "Every important business result has one clearly accountable owner.",
    signal: "Outcome ownership",
  },
  {
    id: "BQ6",
    area: "leadershipAlignment",
    text: "Managers know which decisions they can make without senior approval.",
    signal: "Decision rights",
  },
  {
    id: "BQ7",
    area: "executionSystems",
    text: "Critical recurring work can continue when a key employee is unavailable.",
    signal: "Process resilience",
  },
  {
    id: "BQ8",
    area: "executionSystems",
    text: "Leaders regularly review measures connected to business results, not only activity.",
    signal: "Outcome measurement",
  },
  {
    id: "BQ9",
    area: "executionSystems",
    text: "When an important target is missed, we complete a structured review and assign a corrective action.",
    signal: "Corrective learning",
  },
  {
    id: "BQ10",
    area: "marketingPerformance",
    text: "We can connect marketing activity to qualified leads, customers, or revenue.",
    signal: "Commercial marketing measurement",
  },
  {
    id: "BQ11",
    area: "marketingPerformance",
    text: "We can identify where potential customers disengage before purchasing.",
    signal: "Customer-journey visibility",
  },
  {
    id: "BQ12",
    area: "marketingPerformance",
    text: "We test defined marketing ideas and use the evidence to decide what to do next.",
    signal: "Marketing experimentation",
  },
  {
    id: "BQ13",
    area: "aiEnablement",
    text: "We choose AI initiatives because they address a defined business need.",
    signal: "Outcome-led AI selection",
  },
  {
    id: "BQ14",
    area: "aiEnablement",
    text: "Employees have clear rules about what information may and may not be shared with AI tools.",
    signal: "AI information governance",
  },
  {
    id: "BQ15",
    area: "aiEnablement",
    text: "We measure whether AI-supported work improves its intended outcome, such as time, cost, quality, or risk.",
    signal: "AI value measurement",
  },
];

// Item-level first actions (Section 8).
const ITEM_ACTIONS = {
  BQ1: "Collect current evidence for one important decision from five relevant customers, lost prospects, or frontline records.",
  BQ2: "Ask three leaders to explain why a priority customer should choose the company; compare the answers and evidence.",
  BQ3: "Add an evidence gate to one pending major investment: assumption, evidence required, owner, and decision date.",
  BQ4: "Ask five managers to name the top three priorities and compare their answers with the approved priorities.",
  BQ5: "Assign one accountable owner to each current strategic outcome and document supporting contributors separately.",
  BQ6: "Map five recurring management decisions as local, consultative, or senior-approval decisions.",
  BQ7: "Document and test the minimum continuity information for one critical recurring process.",
  BQ8: "Replace or supplement one activity measure with a measure connected to the intended business result.",
  BQ9: "Run one structured missed-target review with cause, corrective action, owner, date, and follow-up check.",
  BQ10: "Trace one campaign from activity to qualified opportunity, customer, or revenue using agreed definitions.",
  BQ11: "Map the current funnel and identify the stage with the weakest reliable visibility or largest material drop-off.",
  BQ12: "Write one marketing hypothesis with a measure, comparison, decision rule, and next-decision date.",
  BQ13: "Require a defined business need and intended outcome before approving one AI use case.",
  BQ14: "Publish a one-page interim guide covering approved tools, prohibited information, and an escalation contact.",
  BQ15: "Define a baseline and one benefit measure plus one quality or risk check for an AI-supported workflow.",
};

// Verification questions per area, used in result profiles.
const VERIFICATION_QUESTIONS = {
  marketClarity:
    "What recent customer or market evidence materially changed an important decision?",
  leadershipAlignment:
    "If five managers were asked to name the organisation's three current priorities and their own decision authority, how similar would their answers be?",
  executionSystems:
    "Which critical process would be most disrupted if one key person were unavailable for four weeks, and what evidence supports that answer?",
  marketingPerformance:
    "Can one recent campaign be traced from spend and audience through qualified opportunity, customer outcome, and resulting decision?",
  aiEnablement:
    "For each current AI initiative, can the organisation name the intended outcome, responsible owner, permitted information, baseline, success measure, and review date?",
};

// GenX discussion topics per area, used in result profiles.
const DISCUSSION_TOPICS = {
  marketClarity:
    "How customer evidence, positioning, and evidence gates currently influence strategic and investment decisions.",
  leadershipAlignment:
    "How strategic priorities, outcome ownership, and decision rights travel from senior leadership into management practice.",
  executionSystems:
    "Where continuity, outcome measurement, and corrective-learning systems are strong or overly dependent on individuals.",
  marketingPerformance:
    "How marketing activity is connected to business outcomes, where funnel visibility breaks, and how experiments influence decisions.",
  aiEnablement:
    "How AI initiatives are selected, governed, measured, and connected to real operating outcomes.",
};

// Full result-profile copy (Section 6), keyed by area.
const RESULT_PROFILES = {
  marketClarity: {
    label: "Constraint hypothesis: Market Clarity",
    coreMeaning:
      "Your responses suggest that important commercial decisions may not consistently begin with current evidence about customers, alternatives, and demand. The issue may not be a shortage of ideas. It may be that the organisation lacks a dependable method for deciding which ideas deserve investment.",
    howItMayAppear: [
      "leaders describe customer needs differently",
      "positioning changes depending on who explains it",
      "major initiatives rely heavily on internal confidence",
      "campaigns, products, or services are funded before key assumptions are tested",
      "weak results are interpreted as an execution failure even when the original market assumption was uncertain",
    ],
    whatItMayCost: [
      "investment in low-relevance offers or campaigns",
      "avoidable repositioning and rework",
      "slow learning about why customers choose or reject the company",
      "disagreement between commercial, product, and leadership teams",
    ],
    sevenDayAction:
      "Choose one pending commercial decision. Write down the three assumptions on which it depends, identify the most uncertain assumption, and collect one piece of current customer or market evidence before committing further resources.",
    interpretationBoundary:
      "A low score does not prove that the company misunderstands its market. It indicates that the respondent does not consistently observe a reliable, evidence-led market decision process.",
  },
  leadershipAlignment: {
    label: "Constraint hypothesis: Leadership Alignment",
    coreMeaning:
      "Your responses suggest that priorities, ownership, or decision authority may not be understood consistently across leadership levels. The organisation may have a strategy while still lacking the shared interpretation required for coordinated action.",
    howItMayAppear: [
      "managers name different priorities",
      "important results have several contributors but no final owner",
      "routine decisions move upward for approval",
      "senior leaders become bottlenecks",
      "teams work hard in directions that do not reinforce each other",
    ],
    whatItMayCost: [
      "slow decisions and repeated escalation",
      "duplicated or conflicting work",
      "unclear accountability after missed outcomes",
      "managers waiting for permission or protecting themselves through excessive approval",
    ],
    sevenDayAction:
      "Select one important outcome. Record the intended result, one accountable owner, the decisions that owner may make, and the decisions that still require escalation. Confirm the same understanding with everyone directly involved.",
    interpretationBoundary:
      "A low score does not prove that leaders are ineffective. It suggests that the respondent sees possible inconsistency in how direction, accountability, or authority is translated.",
  },
  executionSystems: {
    label: "Constraint hypothesis: Execution Systems",
    coreMeaning:
      "Your responses suggest that important work may depend too heavily on individuals, activity tracking, or informal recovery. The company may be capable of delivering while remaining vulnerable when people, priorities, or conditions change.",
    howItMayAppear: [
      "critical work slows when one person is absent",
      "process knowledge remains in people's heads",
      "leadership meetings review tasks completed but not outcomes achieved",
      "missed targets generate explanation without corrective ownership",
      "the same operational issue returns",
    ],
    whatItMayCost: [
      "avoidable disruption and key-person risk",
      "inconsistent customer experience",
      "leadership time spent rescuing recurring problems",
      "weak organisational learning after missed results",
    ],
    sevenDayAction:
      "Choose one critical recurring process. Identify its owner, backup owner, required access, essential steps, result measure, and the point at which an exception must be escalated. Test whether another qualified person can locate and use that information.",
    interpretationBoundary:
      "A low score does not establish operational failure. It identifies a reported concern about repeatability, resilience, measurement, or learning.",
  },
  marketingPerformance: {
    label: "Constraint hypothesis: Marketing Performance",
    coreMeaning:
      "Your responses suggest that the organisation may be producing marketing activity without a complete view of commercial contribution, customer drop-off, or evidence-led optimisation. The problem may be measurement and learning rather than the amount of marketing.",
    howItMayAppear: [
      "reports emphasise reach, impressions, clicks, or output without a clear commercial connection",
      "teams cannot locate the most important conversion loss",
      "campaign decisions depend on opinion, precedent, or platform recommendations",
      "successful activity is repeated without understanding why it worked",
      "marketing and sales use different funnel definitions",
    ],
    whatItMayCost: [
      "budget decisions based on incomplete signals",
      "inability to distinguish weak positioning, weak conversion, and weak media execution",
      "recurring campaigns that generate activity without sufficient commercial value",
      "conflict over whether marketing is working",
    ],
    sevenDayAction:
      "Select one important marketing pathway. Define its stages, one measure for each stage, the largest observed drop-off, and one testable explanation for that drop-off. Do not begin by changing every channel.",
    interpretationBoundary:
      "This result is relevant only if marketing is an important demand or growth mechanism for the organisation. A low score does not prove that marketing caused weak commercial performance.",
  },
  aiEnablement: {
    label: "Constraint hypothesis: AI Enablement",
    coreMeaning:
      "Your responses suggest that AI use may be developing without a fully connected system for business selection, information governance, and value measurement. The appropriate response is not automatically “use more AI.” It is to make AI use purposeful, controlled, and measurable where it is relevant.",
    howItMayAppear: [
      "tools are adopted before a business problem is defined",
      "teams run disconnected experiments without shared priorities",
      "employees are unsure what information may be entered into external tools",
      "usage or licences are counted without measuring workflow improvement",
      "time savings are claimed without checking quality, risk, or downstream rework",
    ],
    whatItMayCost: [
      "wasted tool and implementation expenditure",
      "confidentiality, privacy, intellectual-property, or quality exposure",
      "fragmented practices across teams",
      "automation of a weak process",
      "inability to decide whether an AI initiative should scale, change, or stop",
    ],
    sevenDayAction:
      "Choose one current or proposed AI use case. Complete a one-page record containing the business need, intended users, permitted data, prohibited data, expected benefit, quality and risk checks, baseline, success measure, owner, and review date.",
    interpretationBoundary:
      "Low AI adoption is not automatically a weakness. AI may be irrelevant, premature, constrained, or deliberately limited. The result concerns the quality of enablement where AI use is appropriate.",
  },
};

// Reported-strength copy per area (Section 7).
const STRENGTH_COPY = {
  marketClarity:
    "Market Clarity appears to be one of the more consistent areas in your responses. You report that customer evidence, differentiation, and market evidence influence important decisions. Verify this strength by checking whether leaders and recent decision records show the same pattern.",
  leadershipAlignment:
    "Leadership Alignment appears relatively consistent. Your responses suggest that priorities, ownership, and decision authority are understood. The next test is whether managers across functions describe them in the same way.",
  executionSystems:
    "Execution Systems appears relatively consistent. You report that critical work can continue, outcome measures are reviewed, and missed targets lead to corrective action. Verify this through a recent disruption or missed-target example.",
  marketingPerformance:
    "Marketing Performance appears relatively consistent. Your responses suggest that the organisation can connect activity to commercial outcomes, locate customer drop-off, and use testing to guide decisions. Confirm that the evidence is available across marketing, sales, and finance.",
  aiEnablement:
    "AI Enablement appears relatively consistent. You report that AI initiatives begin with business needs, information rules are clear, and value is measured. Verify that current use cases have owners, baselines, controls, and review dates.",
};

// Approved GenX CTA copy. Service specifics (name/price/duration/booking
// URL) are NOT yet confirmed by the business — placeholders below per the
// master spec's Section 10 CTA boundary. Swap when confirmed.
const CTA_COPY = {
  heading: "Discuss Your GenX Leadership Scan",
  body:
    "Your result is a starting hypothesis, not a finished diagnosis. A focused GenX Leadership conversation can examine the evidence behind the result, test whether another constraint sits underneath it, and identify the most useful next decision.",
  buttonLabel: "Request a GenX Leadership Review",
  // GenX team: paste the real booking/application URL here once confirmed.
  // Left empty on purpose — the button renders but does not navigate
  // anywhere until this is filled in (see buildCta() in js/app.js).
  buttonHref: "",
};

const LIMITATIONS_STATEMENT =
  "This scan is a structured reflection based on one respondent's view of organisational practice during the past six months. It is not a validated company assessment, audit, certification, or proof of a root cause. Verify the result with relevant leaders, operational evidence, customer evidence, and professional judgment before making a significant decision.";

const EMPLOYMENT_USE_STATEMENT =
  "Results must not be used for hiring, promotion, performance evaluation, disciplinary action, or employment eligibility.";

const RESPONDENT_PROMISE =
  "This scan summarises your perspective on where your organisation may be constrained and prepares a focused verification conversation. It is not a validated assessment of the company.";
