// backend/agent/tools/install.js
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "..", "data", "product_data.json");

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    console.error("❌ Failed to load product_data.json:", err.message);
    return {};
  }
}

// Small library of more specific steps for some parts
const STATIC_STEPS = {
  PS10010001: [
    "Unplug the refrigerator from power.",
    "Remove shelves or panels blocking access to the evaporator cover.",
    "Remove screws securing the evaporator fan cover panel.",
    "Disconnect the fan motor wiring harness.",
    "Unclip or unscrew the old fan motor and remove it.",
    "Install the new fan motor in the same orientation.",
    "Reconnect the wiring harness and reassemble the cover and shelves.",
    "Restore power and verify the fan runs and cooling improves.",
  ],
  PS20020001: [
    "Turn off power to the dishwasher at the breaker.",
    "Pull out the top rack to access the adjuster assemblies.",
    "Remove the old adjusters and wheels by releasing the locking tabs.",
    "Position the new left and right adjusters on the rack.",
    "Secure them with the supplied clips or screws.",
    "Reinstall the rack on the rails and ensure it slides smoothly.",
  ],
  // Add more known parts as desired...
};

function formatInstallMarkdown(partNumber, item, steps) {
  const titleLine = item
    ? `## Installation Instructions for ${item.title} (${partNumber})\n\n`
    : `## Installation Instructions for ${partNumber}\n\n`;

  const safety =
    "⚠️ **Safety first:** Always disconnect power to the appliance before beginning any repair. " +
    "If you are not comfortable performing these steps, contact a qualified technician.\n\n";

  const models =
    item && item.models && item.models.length
      ? `**Common models this part fits:** ${item.models.join(", ")}\n\n`
      : "";

  const description = item?.description
    ? `**What this part does:** ${item.description}\n\n`
    : "";

  const stepsMd =
    "### Step-by-step:\n" +
    steps.map((s, i) => `${i + 1}. ${s}`).join("\n") +
    "\n";

  return titleLine + safety + models + description + stepsMd;
}

async function getInstallInstructions(partNumber) {
  const data = loadData();
  const item = data[partNumber];

  if (!item) {
    return `❌ I couldn't find any data for part **${partNumber}**. Please double-check the part number.`;
  }

  // Use specific static steps if we have them
  if (STATIC_STEPS[partNumber]) {
    return formatInstallMarkdown(partNumber, item, STATIC_STEPS[partNumber]);
  }

  // Fallback: generic but data-aware instructions
  const genericSteps = [
    "Disconnect power to the appliance to avoid electrical shock.",
    "Locate the part in the appliance using your model's diagram or manual.",
    "Remove any panels, shelves, or racks that block access to the part.",
    "Disconnect wiring connectors, hoses, or mounting screws holding the old part.",
    "Carefully remove the old part, noting its orientation and connections.",
    "Install the new part in the same orientation, reusing screws and connectors.",
    "Reassemble any panels or parts you removed earlier.",
    "Restore power and run a test cycle to confirm the repair was successful.",
  ];

  return formatInstallMarkdown(partNumber, item, genericSteps);
}

module.exports = { getInstallInstructions };
