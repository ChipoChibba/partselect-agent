// scraper/scrapeCategory.js
const axios = require("axios");
const cheerio = require("cheerio");

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchHtml(url) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (InstalilyBot)"
    }
  });
  return res.data;
}

async function scrapeCategory(baseUrl, maxPages = 20) {
  const links = new Set();

  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1 ? baseUrl : `${baseUrl}?Page=${page}`;
    console.log("Scraping:", url);

    let html = "";
    try {
      html = await fetchHtml(url);
    } catch (err) {
      console.log("❌ Fetch error:", err.message);
      break;
    }

    const $ = cheerio.load(html);

    $(".nf__part__left-col__img a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("/PS")) {
        links.add("https://www.partselect.com" + href.split("?")[0]);
      }
    });

    if ($(".nf__part").length === 0) break;

    await sleep(700);
  }

  return Array.from(links);
}

module.exports = { scrapeCategory };
