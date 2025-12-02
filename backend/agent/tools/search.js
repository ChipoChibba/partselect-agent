// backend/agent/tools/search.js
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "..", "data", "product_data.json");

// loads product data safely
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  } catch (err) {
    console.error("Failed to load product data:", err.message);
    return {};
  }
}

// cleans input text for keyword extraction
function clean(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// scores an item based on keywords and symptom phrase
function scoreItem(item, partNumber, keywords, fullSymptomPhrase) {
  let score = 0;

  // Full symptom phrase match 
  if (fullSymptomPhrase && item.symptoms) {
    const symptomsLower = item.symptoms.map(s => s.toLowerCase());
    if (symptomsLower.some(s => s.includes(fullSymptomPhrase))) {
      score += 200; // Dominates all other rankings
    }
  }

  // Keyword matches
  for (const kw of keywords) {
    if (item.title.toLowerCase().includes(kw)) score += 25;
    if (item.symptoms?.some(s => s.toLowerCase().includes(kw))) score += 20;
    if (item.category.toLowerCase().includes(kw)) score += 8;
    if (item.description.toLowerCase().includes(kw)) score += 6;
    if (partNumber.toLowerCase().includes(kw)) score += 10;
  }

  return score;
}

// main search function
function searchProducts(query) {
  const data = loadData();

  const isSymptom = query.startsWith("symptom:");
  const raw = query.replace("symptom:", "");
  const cleaned = clean(raw);

  const keywords = cleaned.split(" ").filter(Boolean);
  const fullSymptomPhrase = isSymptom ? cleaned : null;

  //exact part number match
  const exactMatch = query.toUpperCase().match(/PS\d{5,}/);
  if (exactMatch) {
    const partNumber = exactMatch[0];
    if (data[partNumber]) {
      return [formatResult(partNumber, data[partNumber])]; // return only 1
    }
  }

  // scored and filter results 
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

  // Return top 3 always 
  return scored.slice(0, 3).map(r => formatResult(r.partNumber, r.item));
}

// formats a single search result
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
