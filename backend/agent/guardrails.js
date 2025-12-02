// backend/agent/guardrails.js
const { classifyIntent } = require("./classifyIntent");

async function isInScope(userMessage) {
  try {
    // Auto-allow any message with a valid PS number
    if (/(ps\d{5,})/i.test(userMessage)) return true;

    const result = await classifyIntent(userMessage);

    return result === "IN_SCOPE";
  } catch (err) {
    console.error("Guardrail error:", err.message);
    // fail-open: don’t block user
    return true;
  }
}

module.exports = { isInScope };
