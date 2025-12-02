// backend/agent/classifyIntent.js
const { callLLM } = require("./llm");

/**
 * Uses LLM to classify user intent with STRICT reasoning.
 * This forces the model to return EXACT category keywords.
 */
async function classifyIntent(userMessage) {
  const prompt = `
You are an intent classifier for an appliance parts assistant.
Your job is ONLY to return one of the following labels:

- installation
- compatibility
- symptom_search
- troubleshoot
- general_search
- out_of_scope
- general

Rules:
1. Do NOT explain your reasoning.
2. Do NOT add extra text.
3. ONLY output one single label.
4. Use "installation" if user asks: replace, install, remove, how do I install, walk me through replacement.
5. Use "compatibility" if user asks: compatible, fit, works with, what models, what parts fit.
6. Use "symptom_search" if user describes a problem: leaking, frost buildup, not cooling, poor cleaning, noise.
7. Use "troubleshoot" if user asks how to fix or diagnose: not working, broken, solve, troubleshoot.
8. Use "general_search" if user asks: search, find, show me, look up.
9. If question is outside appliances, return "out_of_scope".
10. Otherwise return "general".

User message:
"${userMessage}"

Return label only:
`;

  try {
    const result = await callLLM(prompt);
    const label = result.trim().toLowerCase();

    const VALID = [
      "installation",
      "compatibility",
      "symptom_search",
      "troubleshoot",
      "general_search",
      "out_of_scope",
      "general"
    ];

    if (VALID.includes(label)) return label;

    return "general";

  } catch (err) {
    console.error("Intent classification error:", err.message);
    return "general"; // fallback
  }
}

module.exports = { classifyIntent };
