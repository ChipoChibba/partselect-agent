const fs = require("fs");
const path = require("path");

// Load dataset once (faster)
const DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "product_data.json"))
);


// ------------------------------------------------------
// Keyword Helper
// ------------------------------------------------------
function cleanQuery(q) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter(w =>
      w.length > 1 &&
      !["find", "search", "show", "me", "for", "a", "the", "part"].includes(w)
    );
}


// ------------------------------------------------------
// SYMPTOM MAPPING
// (VERY IMPORTANT: users don't type exact symptom names)
// ------------------------------------------------------
const SYMPTOM_MAP = {
  "poor cleaning": ["poor cleaning", "not cleaning", "dishes dirty", "bad cleaning"],
  "frost buildup": ["frost", "ice", "buildup", "freezer frost"],
  "not cooling": ["warm fridge", "warm", "not cold", "not cooling"],
  leaking: ["leak", "leaking", "water leak", "drip"],
  "not draining": ["not draining", "standing water", "won't drain"],
  sagging: ["sagging", "rack sag", "rack won't slide", "wheel broken"],
  "not dispensing": ["not dispensing", "soap stuck", "detergent not releasing"],
};


// Reverse lookup: phrase → canonical symptom
function detectSymptom(query) {
  const lower = query.toLowerCase();

  for (const symptom in SYMPTOM_MAP) {
    const variants = SYMPTOM_MAP[symptom];
    if (variants.some(v => lower.includes(v))) {
      return symptom;
    }
  }

  return null;
}


// ------------------------------------------------------
// SCORING FUNCTION — brain of the search
// ------------------------------------------------------
function scoreItem(partNumber, item, keywords, symptom) {
  let text = `
    ${partNumber}
    ${item.title}
    ${item.description}
    ${item.category}
    ${(item.models || []).join(" ")}
    ${(item.symptoms || []).join(" ")}
  `.toLowerCase();

  let score = 0;

  // Keyword scoring
  keywords.forEach(word => {
    if (text.includes(word)) score += 4;          // strong match
    if (item.title.toLowerCase().includes(word)) score += 5; 
    if (item.description.toLowerCase().includes(word)) score += 2;
  });

  // Symptom boosting
  if (symptom && item.symptoms?.length > 0) {
    if (item.symptoms.map(s => s.toLowerCase()).includes(symptom)) {
      score += 15; // major boost
    }
  }

  return score;
}


// ------------------------------------------------------
// Main search function
// ------------------------------------------------------
function searchProducts(query) {
  const lower = query.toLowerCase();

  // Detect symptom first
  const symptom = detectSymptom(query);

  const cleanQ = cleanQuery(query);

  // Exact part number shortcut
  const exact = query.trim().toUpperCase();
  if (DATA[exact]) {
    return formatItem(exact, DATA[exact]);
  }

  let results = Object.entries(DATA).map(([partNumber, item]) => ({
    partNumber,
    item,
    score: 0
  }));

  // ------------------------------------------------------
  // STRICT SYMPTOM FILTER MODE
  // ------------------------------------------------------
  if (symptom) {
    const symptomLower = symptom.toLowerCase();

    results = results.filter(({ item }) =>
      item.symptoms?.map(s => s.toLowerCase()).includes(symptomLower)
    );

    if (results.length === 0) {
      return `No parts found that fix "${symptom}".`;
    }

    // Now rank only the symptom-valid items
    results = results
      .map(r => ({
        ...r,
        score: 20 + scoreItem(r.partNumber, r.item, cleanQ, symptom) // big boost
      }))
      .sort((a, b) => b.score - a.score);

    return results.map(r => formatItem(r.partNumber, r.item)).join("\n\n");
  }

  // ------------------------------------------------------
  // Normal keyword search (no symptom detected)
  // ------------------------------------------------------
  results = results
    .map(r => ({
      ...r,
      score: scoreItem(r.partNumber, r.item, cleanQ, null)
    }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    return `No results found for "${query}".`;
  }

  return results.slice(0, 10).map(r => formatItem(r.partNumber, r.item)).join("\n\n");
}


// ------------------------------------------------------
// Format markdown
// ------------------------------------------------------
function formatItem(partNumber, item) {
  return `
### 🔧 ${item.title}

**Part Number:** ${partNumber}  
**Category:** ${item.category}  
**Manufacturer:** ${item.manufacturer}  
**Price:** $${item.price}  
**Models:** ${item.models?.join(", ") || "N/A"}  
**Fixes Symptoms:** ${item.symptoms?.join(", ") || "N/A"}

**Description:**  
${item.description}

---
`;
}

module.exports = { searchProducts };
