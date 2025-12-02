// backend/agent/tools/search.js
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "..", "data", "product_data.json");

// ---------------- LOAD PRODUCT DATA ----------------
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    console.error("❌ Failed to load product data:", err.message);
    return {};
  }
}

// ---------------- CLEANING HELPERS ----------------
function clean(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------- SCORING LOGIC ----------------
function scoreItem(item, partNumber, keywords, fullSymptomPhrase) {
  const haystack =
    `${partNumber} ${item.title} ${item.description} ${item.category} ${item.symptoms?.join(" ") || ""}`
      .toLowerCase();

  let score = 0;

  // 1) Exact full symptom phrase match → strongest signal
  if (fullSymptomPhrase && item.symptoms) {
    const symptomsLower = item.symptoms.map(s => s.toLowerCase());
    if (symptomsLower.some(s => s.includes(fullSymptomPhrase))) {
      score += 200; // Dominates all other rankings
    }
  }

  // 2) Keyword scoring fallback for general queries
  for (const kw of keywords) {
    if (item.title.toLowerCase().includes(kw)) score += 25;
    if (item.symptoms?.some(s => s.toLowerCase().includes(kw))) score += 20;
    if (item.category.toLowerCase().includes(kw)) score += 8;
    if (item.description.toLowerCase().includes(kw)) score += 6;
    if (partNumber.toLowerCase().includes(kw)) score += 10;
  }

  return score;
}

// ---------------- MAIN SEARCH FUNCTION ----------------
function searchProducts(query) {
  const data = loadData();

  const isSymptom = query.startsWith("symptom:");
  const raw = query.replace("symptom:", "");
  const cleaned = clean(raw);

  const keywords = cleaned.split(" ").filter(Boolean);
  const fullSymptomPhrase = isSymptom ? cleaned : null;

  // ---------------- EXACT PART NUMBER LOOKUP ----------------
  const exactMatch = query.toUpperCase().match(/PS\d{5,}/);
  if (exactMatch) {
    const partNumber = exactMatch[0];
    if (data[partNumber]) {
      return [formatResult(partNumber, data[partNumber])]; // return only 1
    }
  }

  // ---------------- SCORE + FILTER RESULTS ----------------
  const scored = [];

  for (const [partNumber, item] of Object.entries(data)) {
    const score = scoreItem(item, partNumber, keywords, fullSymptomPhrase);
    if (score > 0) {
      scored.push({ partNumber, item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return [`No products found matching "${cleaned}".`];
  }

  // Return top 3 always (general search + symptom search)
  return scored.slice(0, 3).map(r => formatResult(r.partNumber, r.item));
}

// ---------------- FORMAT OUTPUT ----------------
function formatResult(partNumber, item) {
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
