const fs = require("fs");
const path = require("path");

function validFile(str) {
    const DATA_PATH = path.join(__dirname, "product_data.json");

    //check if path exists
    if (!fs.existsSync(DATA_PATH)) {
        throw new Error(`Data file not found at path: ${DATA_PATH}`);
    }
    return DATA_PATH;
}

//loads all products from the JSON file
function loadProducts() {

  const DATA_PATH = validFile("product_data.json");

  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw);

  // convert object { partNumber: item } to array of objects with partNumber field
  const items = Object.entries(data).map(([partNumber, item]) => ({
    partNumber,
    ...item
  }));

  return items;
}


//fetches all products
function getAllProducts() {
  return loadProducts();
}

//fetches a product by its part number
function getProductByPartNumber(partNumber) {
  const products = loadProducts();
  return products.find(
    (p) => p.partNumber.toUpperCase() === partNumber.toUpperCase()
  );
}

//fetches products by category
function getProductsByCategory(category) {
  const products = loadProducts();
  return products.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}

//searches products by text query
function searchProductsByText(query) {
  const products = loadProducts();
  const cleaned = query.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const keywords = cleaned.split(" ").filter(Boolean);

  return products
    .map((item) => {
      const haystack = `
        ${item.partNumber}
        ${item.title}
        ${item.description}
        ${item.category}
        ${item.models?.join(" ") || ""}
      `.toLowerCase();

      let score = 0;

      keywords.forEach((word) => {
        if (haystack.includes(word)) score += 1;
        if (item.partNumber.toLowerCase().includes(word)) score += 3;
        if (item.title.toLowerCase().includes(word)) score += 2;
      });

      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

module.exports = {
  getAllProducts,
  getProductByPartNumber,
  getProductsByCategory,
  searchProductsByText
};
