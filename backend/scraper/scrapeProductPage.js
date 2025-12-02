// scraper/scrapeProductPage.js
const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeProductPage(url) {
  const res = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0 (InstalilyBot)" }
  });

  const $ = cheerio.load(res.data);

  const partNumber = $(".nf__part__detail__part-number strong").first().text().trim();
  const manufacturer = $(".nf__part__detail__part-number strong").eq(1).text().trim();
  const title = $(".nf__part__detail__title span").text().trim();
  const price = $(".price").text().trim().replace("$", "");

  const symptoms = $(".nf__part__detail__symptoms ul li")
    .map((i, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  // Extract leading text before symptoms
  const desc = $(".nf__part__detail")
    .clone()
    .children()
    .remove()
    .end()
    .text()
    .trim()
    .replace(/\s+/g, " ");

  return {
    url,
    title,
    partNumber,
    manufacturer,
    price: parseFloat(price),
    symptoms,
    description: desc
  };
}

module.exports = { scrapeProductPage };
