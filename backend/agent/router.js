// backend/agent/router.js
const { isInScope } = require("./guardrails");
const { callLLM } = require("./llm");
const { classifyIntent } = require("./classifyIntent");

const { handleCompatibilityQuery } = require("./tools/compatibility");
const { getInstallInstructions } = require("./tools/install");
const { getTroubleshootInstructions } = require("./tools/troubleshoot");
const { searchProducts } = require("./tools/search");

//HELPER FUNCTIONS

//Normalizes different response types to string
function normalizeResponse(output) {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.join("\n\n");
  if (typeof output === "object" && output !== null) return JSON.stringify(output, null, 2);
  return String(output);
}

//Extracts part number from text
function extractPartNumber(text) {
  const match = text.match(/(ps\d{5,})/i);
  return match ? match[1].toUpperCase() : null;
}

//Extracts model number from text
function extractModelNumber(text) {
  const words = text.split(/[\s,?\.]+/);

  for (const w of words) {
    const upper = w.toUpperCase();
    if (/^PS\d{5,}$/.test(upper)) continue;
    if (/[A-Z]/.test(upper) && /\d/.test(upper) && upper.length >= 6) return upper;
  }
  return null;
}

//heuristic scope check 
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


//checks if user wants installation help
function wantsInstall(lower) {
  return (
    lower.includes("install") ||
    lower.includes("installation") ||
    lower.includes("replace") ||
    lower.includes("walk me through") ||
    lower.includes("how do i change")
  );
}

//checks if user wants compatibility info
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

//checks if user is describing a symptom
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

//Router Logic
async function agentRouter(userMessage) {
  const lower = userMessage.toLowerCase();

  // Conversational responses (bypass scope)
  const greetingWords = ["hi", "hello", "hey", "yo", "greetings", "sup"];
  const thanksWords = ["thank you", "thanks", "thx", "appreciate it", "ty"];
  const closingWords = ["bye", "goodbye", "see you", "farewell"];

  //default response for greetings 
  if (greetingWords.some(w => lower === w || lower.startsWith(w))) {
    return "Hi! How can I help you with refrigerator or dishwasher parts today?";
  }

  //default response for thanking
  if (thanksWords.some(w => lower.includes(w))) {
    return "You're welcome! If you need help checking compatibility or finding a part, just let me know.";}

    //default response for closings
  if (closingWords.some(w => lower.includes(w))) {
    return "Goodbye! Feel free to reach out if you need assistance with refrigerator or dishwasher parts.";}

  // Checking symptoms 
  if (wantsSymptom(lower)) {
    return normalizeResponse(
      await searchProducts("symptom:" + userMessage)
    );
  }

 //Extract part and model numbers
  const partNumber = extractPartNumber(userMessage);
  const modelNumber = extractModelNumber(userMessage);

  //Determine Intent of users message
  const needsInstall = wantsInstall(lower);
  const needsCompat = wantsCompatibility(lower);

  //Install and Compatibility combined logic
  if (partNumber && needsInstall && needsCompat) {
    return (
      `I see you're asking about **${partNumber}** and mentioned both installation and compatibility.\n\n` +
      `Would you like **compatibility** or **installation instructions**?`
    );
  }

//Compatibility logic
  if (needsCompat) {
    const result = await handleCompatibilityQuery(partNumber, modelNumber, userMessage);
    return normalizeResponse(result);
  }

  // Installation logic
  if (needsInstall) {
    //check if valid part number is provided
    if (!partNumber) {
      return "Please include a valid part number such as **PS10010001**.";
    }
    const result = await getInstallInstructions(partNumber);
    return normalizeResponse(result);
  }

  //LLM Intent Classification
  let intent = "general";
  try {
    intent = await classifyIntent(userMessage);
  } catch (_) {}

  //search
  if (intent === "symptom_search") {
    return normalizeResponse(await searchProducts("symptom:" + userMessage));
  }

  //compatibility
  if (intent === "compatibility") {
    return normalizeResponse(
      await handleCompatibilityQuery(partNumber, modelNumber, userMessage)
    );
  }

  //installation
  if (intent === "installation") {
    if (!partNumber) return "Please include a valid part number.";
    return normalizeResponse(await getInstallInstructions(partNumber));
  }

  //troubleshoot
  if (intent === "troubleshoot") {
    return normalizeResponse(await getTroubleshootInstructions(userMessage));
  }

  //general search
  if (intent === "general_search") {
    return normalizeResponse(searchProducts(userMessage));
  }

 //check if user query in scope
  let ok = true;
  try {
    ok = await isInScope(userMessage);
  } catch (_) {
    ok = true;
  }

  //not in sope
  if (!ok && !heuristicInScope(lower)) {
    return "Sorry, I can only help with refrigerator and dishwasher related questions.";
  }

 //default general help
  return await callLLM("General Product Help:\n" + userMessage);
}

module.exports = { agentRouter };
