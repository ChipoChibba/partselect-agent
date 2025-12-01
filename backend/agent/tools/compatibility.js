// Fake database of compatibility
const compatibilityDB = {
  "PS11752778": ["WDT780SAEM1", "WDT970SAHZ0", "WRS325SDHZ"],
  "PS12345678": ["WRF535SWHZ", "WDF520PADM", "WRS588FIHZ"]
};

// function to check compatibility
function checkCompatibility(partNumber, modelNumber) {
  const models = compatibilityDB[partNumber];

  if (!models) {
    return `I couldn't find the part ${partNumber} in my compatibility database.`;
  }

  const isCompatible = models.includes(modelNumber.toUpperCase());

  return isCompatible
    ? `✅ Yes, part **${partNumber}** is compatible with model **${modelNumber}**.`
    : `❌ No, part **${partNumber}** is not compatible with model **${modelNumber}**.`;
}

module.exports = { checkCompatibility };
