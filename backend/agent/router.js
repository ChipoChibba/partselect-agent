// backend/agent/router.js
const { isInScope } = require("./guardrails");
const { callLLM } = require("./llm");
const { classifyIntent } = require("./classifyIntent");

const { handleCompatibilityQuery } = require("./tools/compatibility");
const { getInstallInstructions } = require("./tools/install");
const { getTroubleshootInstructions } = require("./tools/troubleshoot");
const { searchProducts } = require("./tools/search");

// --------------------------------------------------
// Helpers
// --------------------------------------------------
function normalizeResponse(output) {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.join("\n\n");
  if (typeof output === "object" && output !== null) return JSON.stringify(output, null, 2);
  return String(output);
}

function extractPartNumber(text) {
  const match = text.match(/(ps\d{5,})/i);
  return match ? match[1].toUpperCase() : null;
}

function extractModelNumber(text) {
  const words = text.split(/[\s,?\.]+/);

  for (const w of words) {
    const upper = w.toUpperCase();
    if (/^PS\d{5,}$/.test(upper)) continue;
    if (/[A-Z]/.test(upper) && /\d/.test(upper) && upper.length >= 6) return upper;
  }
  return null;
}

// --------------------------------------------------
// SMART SCOPE (Dishwasher ALWAYS allowed)
// --------------------------------------------------
function heuristicInScope(lower) {
  return (
    lower.includes("fridge") ||
    lower.includes("refrigerator") ||
    lower.includes("dishwasher") ||
    lower.includes("dish washer") ||
    lower.includes("freezer") ||
    lower.includes("appliance") ||
    lower.includes("ps") ||
    lower.includes("model")
  );
}

// --------------------------------------------------
// Intent keyword helpers
// --------------------------------------------------
function wantsInstall(lower) {
  return (
    lower.includes("install") ||
    lower.includes("installation") ||
    lower.includes("replace") ||
    lower.includes("walk me through") ||
    lower.includes("how do i change")
  );
}

function wantsCompatibility(lower) {
  return (
    lower.includes("compatible") ||
    lower.includes("fits ") ||
    lower.includes("fit ") ||
    lower.includes("work with") ||
    lower.includes("works with") ||
    lower.includes("what models") ||
    lower.includes("what parts")
  );
}

function wantsSymptom(lower) {
  return (
    lower.includes("poor cleaning") ||
    lower.includes("not cleaning") ||
    lower.includes("cleaning issue") ||
    lower.includes("not cooling") ||
    lower.includes("warm") ||
    lower.includes("frost") ||
    lower.includes("frost buildup")
  );
}

// --------------------------------------------------
// 🔥 FINAL — The router
// --------------------------------------------------
async function agentRouter(userMessage) {
  const lower = userMessage.toLowerCase();

  // ------------------------------------------------------
  // 1️⃣ SYMPTOMS MUST BE FIRST (fixes 5.2, 6.1, 6.3)
  // ------------------------------------------------------
  if (wantsSymptom(lower)) {
    return normalizeResponse(
      await searchProducts("symptom:" + userMessage)
    );
  }

  // ------------------------------------------------------
  // 2️⃣ Extract part + model
  // ------------------------------------------------------
  const partNumber = extractPartNumber(userMessage);
  const modelNumber = extractModelNumber(userMessage);

  const needsInstall = wantsInstall(lower);
  const needsCompat = wantsCompatibility(lower);

  // ------------------------------------------------------
  // 3️⃣ Handle BOTH install + compatibility
  // ------------------------------------------------------
  if (partNumber && needsInstall && needsCompat) {
    return (
      `I see you're asking about **${partNumber}** and mentioned both installation and compatibility.\n\n` +
      `Would you like **compatibility** or **installation instructions**?`
    );
  }

  // ------------------------------------------------------
  // 4️⃣ Compatibility logic
  // ------------------------------------------------------
  if (needsCompat) {
    const result = await handleCompatibilityQuery(partNumber, modelNumber, userMessage);
    return normalizeResponse(result);
  }

  // ------------------------------------------------------
  // 5️⃣ Installation logic
  // ------------------------------------------------------
  if (needsInstall) {
    if (!partNumber) {
      return "Please include a valid part number such as **PS10010001**.";
    }
    const result = await getInstallInstructions(partNumber);
    return normalizeResponse(result);
  }

  // ------------------------------------------------------
  // 6️⃣ LLM Intent classification fallback
  // ------------------------------------------------------
  let intent = "general";
  try {
    intent = await classifyIntent(userMessage);
  } catch (_) {}

  if (intent === "symptom_search") {
    return normalizeResponse(await searchProducts("symptom:" + userMessage));
  }

  if (intent === "compatibility") {
    return normalizeResponse(
      await handleCompatibilityQuery(partNumber, modelNumber, userMessage)
    );
  }

  if (intent === "installation") {
    if (!partNumber) return "Please include a valid part number.";
    return normalizeResponse(await getInstallInstructions(partNumber));
  }

  if (intent === "troubleshoot") {
    return normalizeResponse(await getTroubleshootInstructions(userMessage));
  }

  if (intent === "general_search") {
    return normalizeResponse(searchProducts(userMessage));
  }

  // ------------------------------------------------------
  // 7️⃣ SCOPE CHECK (LAST)
  // ------------------------------------------------------
  let ok = true;
  try {
    ok = await isInScope(userMessage);
  } catch (_) {
    ok = true;
  }

  if (!ok && !heuristicInScope(lower)) {
    return "Sorry, I can only help with refrigerator and dishwasher related questions.";
  }

  // ------------------------------------------------------
  // 8️⃣ Final LLM fallback
  // ------------------------------------------------------
  return await callLLM("General Product Help:\n" + userMessage);
}

module.exports = { agentRouter };
