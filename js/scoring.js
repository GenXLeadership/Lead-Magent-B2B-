// GenX Leadership B2B Perspective Scan — pure, DOM-free scoring engine.
// Implements Sections 4, 6, 9, and 18 of the pilot master memory file.
// Inputs/outputs use plain objects/arrays only so this file can be unit
// tested without a browser.

const TIE_THRESHOLD = 0.25;
const MIN_ELIGIBLE_AREAS = 4;
const STRENGTH_FLOOR = 1.5;

/**
 * @param {Object} responses - map of question id -> { value: 0|1|2|3|"not_sure", notSureReason?: string }
 * @returns {Object} per-area stats: { scorableCount, mean, eligible, reducedConfidence, relevanceNotEstablished, limitedVisibility, notApplicableCount, otherUnscoredCount }
 */
function calculateAreaScores(responses) {
  const areaStats = {};

  AREAS.forEach((area) => {
    const items = QUESTIONS.filter((q) => q.area === area);
    const scorableValues = [];
    let notApplicableCount = 0;
    let otherUnscoredCount = 0;

    items.forEach((item) => {
      const response = responses[item.id];
      if (!response) return;
      if (response.value === "not_sure") {
        if (response.notSureReason === "not_applicable") {
          notApplicableCount += 1;
        } else {
          otherUnscoredCount += 1;
        }
        return;
      }
      if (typeof response.value === "number") {
        scorableValues.push(response.value);
      }
    });

    const scorableCount = scorableValues.length;
    const eligible = scorableCount >= 2;
    const mean = eligible
      ? scorableValues.reduce((sum, v) => sum + v, 0) / scorableCount
      : null;

    areaStats[area] = {
      scorableCount,
      mean,
      eligible,
      reducedConfidence: eligible && scorableCount === 2,
      relevanceNotEstablished: notApplicableCount >= 2,
      limitedVisibility: otherUnscoredCount >= 2,
      notApplicableCount,
      otherUnscoredCount,
    };
  });

  return areaStats;
}

/**
 * @param {Object} responses
 * @returns {Object} { V1, V2, V3, V4, V5 } booleans plus supporting counts
 */
function calculateVisibilityFlags(responses) {
  let outsideRole = 0;
  let infoUnavailable = 0;
  let unclearWording = false;
  let totalNotSure = 0;
  const notApplicableByArea = {};
  AREAS.forEach((area) => (notApplicableByArea[area] = 0));

  QUESTIONS.forEach((item) => {
    const response = responses[item.id];
    if (!response || response.value !== "not_sure") return;
    totalNotSure += 1;
    switch (response.notSureReason) {
      case "outside_role":
        outsideRole += 1;
        break;
      case "info_unavailable":
        infoUnavailable += 1;
        break;
      case "not_applicable":
        notApplicableByArea[item.area] += 1;
        break;
      case "unclear_wording":
        unclearWording = true;
        break;
      default:
        break;
    }
  });

  const V3 = AREAS.some((area) => notApplicableByArea[area] >= 2);

  return {
    V1: outsideRole >= 2,
    V2: infoUnavailable >= 2,
    V3,
    V4: unclearWording,
    V5: totalNotSure >= 5,
    totalNotSure,
  };
}

/**
 * Determines whether the scan should return Limited Visibility, No Single
 * Constraint (broadly similar), a tied Connected Constraints result, or a
 * single primary constraint hypothesis.
 *
 * @param {Object} areaStats - output of calculateAreaScores
 * @returns {Object} routing decision
 */
function resolveConstraintRouting(areaStats) {
  const eligibleAreas = AREAS.filter((a) => areaStats[a].eligible);

  if (eligibleAreas.length < MIN_ELIGIBLE_AREAS) {
    return { resultType: "limited_visibility", eligibleAreas };
  }

  const means = eligibleAreas.map((a) => areaStats[a].mean);
  const minMean = Math.min(...means);
  const maxMean = Math.max(...means);

  if (eligibleAreas.length === 5 && maxMean - minMean <= TIE_THRESHOLD) {
    return { resultType: "no_single_constraint", eligibleAreas, minMean, maxMean };
  }

  const tiedLowest = eligibleAreas.filter(
    (a) => areaStats[a].mean - minMean <= TIE_THRESHOLD
  );

  if (tiedLowest.length > 1) {
    return {
      resultType: "connected_constraints",
      eligibleAreas,
      tiedAreas: tiedLowest,
      minMean,
    };
  }

  return {
    resultType: "primary",
    eligibleAreas,
    primaryArea: tiedLowest[0],
    minMean,
  };
}

/**
 * @param {Object} areaStats
 * @returns {Object} { areas: string[], mean: number|null, belowFloor: boolean }
 */
function resolveHighestArea(areaStats) {
  const eligibleAreas = AREAS.filter((a) => areaStats[a].eligible);
  if (eligibleAreas.length === 0) {
    return { areas: [], mean: null, belowFloor: false };
  }
  const maxMean = Math.max(...eligibleAreas.map((a) => areaStats[a].mean));
  const topAreas = eligibleAreas.filter((a) => areaStats[a].mean === maxMean);
  return {
    areas: topAreas,
    mean: maxMean,
    belowFloor: maxMean < STRENGTH_FLOOR,
  };
}

/**
 * Finds the lowest-scoring scorable item within the given area for the
 * first-action mapping. Ties fall back to the earliest item in stable
 * pilot order (QUESTIONS array order) and are flagged for pilot analysis.
 *
 * @param {string} area
 * @param {Object} responses
 * @returns {Object} { itemId: string|null, tie: boolean }
 */
function resolveLowestItem(area, responses) {
  const items = QUESTIONS.filter((q) => q.area === area);
  let lowestValue = null;
  const scored = [];

  items.forEach((item) => {
    const response = responses[item.id];
    if (response && typeof response.value === "number") {
      scored.push({ id: item.id, value: response.value });
    }
  });

  if (scored.length === 0) {
    return { itemId: null, tie: false };
  }

  lowestValue = Math.min(...scored.map((s) => s.value));
  const tiedItems = scored.filter((s) => s.value === lowestValue);

  return {
    itemId: tiedItems[0].id,
    tie: tiedItems.length > 1,
  };
}

/**
 * Top-level orchestration matching the Section 18 decision sequence.
 * Does not decide the tie-breaker choice itself — when routing needs a
 * participant choice (connected_constraints or no_single_constraint), the
 * caller must collect that separately and call resolveLowestItem with the
 * chosen area.
 *
 * @param {Object} responses
 * @returns {Object} full computed result object
 */
function computeResult(responses) {
  const areaStats = calculateAreaScores(responses);
  const visibilityFlags = calculateVisibilityFlags(responses);
  const routing = resolveConstraintRouting(areaStats);
  const strength = resolveHighestArea(areaStats);

  const result = {
    scanVersion: QUIZ_VERSION,
    areaStats,
    visibilityFlags,
    routing,
    strength,
  };

  if (routing.resultType === "primary") {
    const lowestItem = resolveLowestItem(routing.primaryArea, responses);
    result.primaryArea = routing.primaryArea;
    result.firstAction = {
      itemId: lowestItem.itemId,
      tie: lowestItem.tie,
      action: lowestItem.itemId ? ITEM_ACTIONS[lowestItem.itemId] : null,
    };
  }

  return result;
}

/**
 * Called once the participant has chosen which of the tied/similar areas is
 * most urgent, to finalize a connected_constraints or no_single_constraint
 * result into a concrete first action.
 *
 * @param {string} chosenArea
 * @param {Object} responses
 * @returns {Object} { primaryArea, firstAction }
 */
function resolveTieBreakerChoice(chosenArea, responses) {
  const lowestItem = resolveLowestItem(chosenArea, responses);
  return {
    primaryArea: chosenArea,
    firstAction: {
      itemId: lowestItem.itemId,
      tie: lowestItem.tie,
      action: lowestItem.itemId ? ITEM_ACTIONS[lowestItem.itemId] : null,
    },
  };
}
