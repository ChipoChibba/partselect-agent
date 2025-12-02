const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "..", "data", "product_data.json");

// func for safe loading 
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    console.error(" Failed to load product_data.json:", err.message);
    return {};
  }
}

//normalizing func
function normalize(str) {
  return str ? str.toString().trim().toUpperCase() : "";
}

// ---------- Part → Model Compatibility ----------
function checkPartToModel(partNumber, modelNumber) {
  const data = loadData();
  const item = data[partNumber];

  // part not found
  if (!item) {
    return ` Part number **${partNumber}** not found.`;
  }

  // no model provided
  if (!modelNumber) {
    return ` Please specify a model number to check compatibility with **${partNumber}**.`;
  }

  const models = item.models?.map((m) => m.toUpperCase()) || [];

  // compatible
  if (models.includes(modelNumber.toUpperCase())) {
    return `Yes, **${partNumber} (${item.title})** is listed as compatible with **model ${modelNumber}**.`;
  }

  return (
    `**${modelNumber}** is not listed as compatible with **${partNumber}**.\n\n` +
    `Models this part fits:\n${item.models?.join(", ") || "No data available."}`
  );
}

// ---------- Part → What Models Does This Fit? ----------
function whatModelsFitPart(partNumber) {
  const data = loadData();
  const item = data[partNumber];

  // response if part not found
  if (!item) {
    return `Could not find part **${partNumber}**.`;
  }

  // response if no models listed
  if (!item.models || item.models.length === 0) {
    return `No compatibility data available for **${partNumber}**.`;
  }

  return (
    `#### Models Compatible with ${partNumber} (${item.title})\n` +
    item.models.map((m) => `• ${m}`).join("\n")
  );
}

// ---------- What Parts Fit This Model? ----------
function partsCompatibleWithModel(modelNumber) {
  const data = loadData();
  const model = normalize(modelNumber);

  // response if no model provided
  if (!model) {
    return `Please provide a model number.`;
  }

  const matches = [];

  // find all parts that are compatible w this model
  for (const [part, item] of Object.entries(data)) {
    const models = item.models?.map((m) => m.toUpperCase()) || [];
    if (models.includes(model)) {
      matches.push({ part, title: item.title });
    }
  }

  // no matches found
  if (matches.length === 0) {
    return ` No parts found that are listed as compatible with model **${modelNumber}**.`;
  }

  return (
    `#### Parts Compatible with Model ${modelNumber}\n` +
    matches.map((m) => `• **${m.part}** — ${m.title}`).join("\n")
  );
}

// ---------- Router Helper ----------
function handleCompatibilityQuery(partNumber, modelNumber, originalText) {
  const part = normalize(partNumber);
  const model = normalize(modelNumber);
  const lower = originalText.toLowerCase();

  // "what models fit PS123456?"
  if (part && lower.includes("what") && lower.includes("model")) {
    return whatModelsFitPart(part);
  }

  // “what parts fit WDT750SAHZ0?”
  if (model && lower.includes("what") && lower.includes("part")) {
    return partsCompatibleWithModel(model);
  }

  // "is PS123456 compatible with WDT750SAHZ0?"
  if (part && model) {
    return checkPartToModel(part, model);
  }

  // Fallback: user mentioned compatibility but didn’t clearly ask one direction
  if (part && !model) {
    return whatModelsFitPart(part);
  }

  if (!part && model) {
    return partsCompatibleWithModel(model);
  }

// response if no part or model provided
  return (
    `Please provide either:\n` +
    `- A part number (PSXXXXX), or\n` +
    `- A model number (WDT…, WRS…, etc.)`
  );
}

module.exports = {
  handleCompatibilityQuery,
  checkPartToModel,
  whatModelsFitPart,
  partsCompatibleWithModel,
};
