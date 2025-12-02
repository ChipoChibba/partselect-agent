// scraper/runFullScrape.js
global.File = class {};
const fs = require("fs");
const { scrapeCategory } = require("./scrapeCategory");
const { scrapeProductPage } = require("./scrapeProductPage");
const path = require("path");


async function scrapeAndCollect(categoryName, categoryUrl) {
  console.log(`\n🔍 Fetching ${categoryName} category links...`);
  const productUrls = await scrapeCategory(categoryUrl);

  console.log(`✔ ${productUrls.length} ${categoryName} products found.`);

  const results = {};

  for (const url of productUrls) {
    console.log(`Scraping ${categoryName} product → ${url}`);

    try {
      const data = await scrapeProductPage(url);
      results[data.partNumber] = { ...data, category: categoryName };
    } catch (err) {
      console.log("❌ Product scrape error:", err.message);
    }
  }

  return results;
}

async function run() {
  const finalData = {};

  // Scrape DISHWASHER
  const dishwasherData = await scrapeAndCollect(
    "Dishwasher",
    "https://www.partselect.com/Dishwasher-Parts.htm"
  );

  // Scrape REFRIGERATOR
  const refrigeratorData = await scrapeAndCollect(
    "Refrigerator",
    "https://www.partselect.com/Refrigerator-Parts.htm"
  );

  Object.assign(finalData, dishwasherData, refrigeratorData);

 fs.writeFileSync(
  path.join(__dirname, "..", "data", "product_data.json"),
  JSON.stringify(finalData, null, 2)
);

  console.log("\n🎉 DONE! Full dataset saved to product_data.json");
  console.log("Total parts scraped:", Object.keys(finalData).length);
}

run();
