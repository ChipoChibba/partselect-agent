const fs = require("fs");
const path = require("path");

function cleanQuery(q) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")    // remove punctuation
    .split(" ")
    .filter(w => w.length > 1 && !["find", "search", "for", "a", "the", "show"].includes(w));
}

function scoreItem(partNumber, item, keywords) {
  let text = `
     ${partNumber}
     ${item.title}
     ${item.description}
     ${item.category}
     ${item.models.join(" ")}
  `.toLowerCase();

  let score = 0;

  // Boost exact part-number match inside text
  keywords.forEach(word => {
    if (text.includes(word)) score += 3;
    if (item.title.toLowerCase().includes(word)) score += 3;
    if (item.category.toLowerCase().includes(word)) score += 2;
    if (item.description.toLowerCase().includes(word)) score += 1;
    if (item.models.some(m => m.toLowerCase().includes(word))) score += 4;
  });

  return score;
}

function searchProducts(query) {
  try {
    const filePath = path.join(__dirname, "..", "..", "data", "product_data.json");
    if (!fs.existsSync(filePath)) throw new Error("Product data not found");

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Normalize input
    let keywords = cleanQuery(query);
    console.log("Keywords:", keywords);

    // Exact part number fast-path
    const upper = query.toUpperCase();
    if (data[upper]) {
      return formatSingle(upper, data[upper]);
    }

    // Score + rank
    const results = Object.entries(data)
      .map(([partNumber, item]) => ({
        partNumber,
        item,
        score: scoreItem(partNumber, item, keywords)
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    if (results.length === 0) {
      return `No results found for "${query}". Try part number, category, or model number.`;
    }

    return results.map(r => formatSingle(r.partNumber, r.item)).join("\n\n");

  } catch (err) {
    console.log("Search error:", err.message);
    throw new Error("Search failed");
  }
}

function formatSingle(partNumber, item) {
  return `### 🔧 ${item.title}
**Part Number:** ${partNumber}  
**Category:** ${item.category}  
**Models:** ${item.models.join(", ")}  
**Description:** ${item.description}  
**Price:** $${item.price}

---`;
}

module.exports = { searchProducts };