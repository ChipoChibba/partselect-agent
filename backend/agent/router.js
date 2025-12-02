const { isInScope } = require("./guardrails");
const { callLLM } = require("./llm");
const { checkCompatibility } = require("./tools/compatibility");
const { getInstallInstructions } = require("./tools/install");
const { getTroubleshootInstructions } = require("./tools/troubleshoot");
const { searchProducts } = require("./tools/search");

// 🛑 Normalize ANY non-string response into a markdown string
function normalizeResponse(output) {
  if (typeof output === "string") return output;

  if (Array.isArray(output)) {
    return output
      .map(item => (typeof item === "string" ? item : JSON.stringify(item, null, 2)))
      .join("\n\n");
  }

  if (typeof output === "object" && output !== null) {
    return JSON.stringify(output, null, 2);
  }

  return String(output);
}


async function agentRouter(userMessage) {
  const lower = userMessage.toLowerCase();

  // Scope guard
  if (!isInScope(userMessage)) {
    return "Sorry, I can only assist with refrigerator and dishwasher related questions.";
  }

  // ---- INSTALLATION ----
  if (lower.includes("install") || lower.includes("installation")) {
    const partMatch = userMessage.match(/(ps\d{5,})/i);

    if (!partMatch) {
      return "Please provide a valid part number (e.g., PS11752778).";
    }

    const part = partMatch[0].toUpperCase();
    return getInstallInstructions(part);
  }

  // ---- SYMPTOM-BASED SEARCH ----
  const symptomKeywords = [
    "not cleaning",
    "poor cleaning",
    "leaking",
    "frost",
    "buildup",
    "warm",
    "not cooling",
    "no water",
    "not draining",
    "sagging",
    "not dispensing"
  ];

  if (symptomKeywords.some(k => lower.includes(k))) {
    // Force symptom mode
    return searchProducts("symptom:" + userMessage);
  }

  // ---- TROUBLESHOOT ----
  if (lower.includes("not working") || lower.includes("fix")) {
    return getTroubleshootInstructions(userMessage);
  }

  // ---- GENERAL SEARCH ----
  if (lower.includes("search") || lower.includes("find") || lower.includes("look up")) {
    const results = searchProducts(userMessage);

    // If search returned array → join as markdown
    if (Array.isArray(results)) {
      return results.join("\n\n");
    }

    return results;
  }

  // ---- COMPATIBILITY ----
  if (lower.includes("compatible") || lower.includes("fit") || lower.includes("work with")) {
    const partMatch = userMessage.match(/(ps\d{5,})/i);
    const modelMatch = userMessage.match(/\b[A-Z0-9]{4,}\b/i);

    if (!partMatch || !modelMatch) {
      return "Please provide both a part number and a model number.";
    }

    const part = partMatch[0].toUpperCase();
    const model = modelMatch[0].toUpperCase();

    return checkCompatibility(part, model);
  }

  // ---- FALLBACK ----
  return callLLM("General Product help: " + userMessage);
}

module.exports = { agentRouter };
