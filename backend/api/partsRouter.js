const express = require("express");
const {
  getAllProducts,
  getProductByPartNumber,
  getProductsByCategory,
  searchProductsByText
} = require("../data/products");

const router = express.Router();

// GET /api/parts
router.get("/", (req, res) => {
  const parts = getAllProducts();
  res.json(parts);
});

// GET /api/parts/:partNumber
router.get("/:partNumber", (req, res) => {
  const part = getProductByPartNumber(req.params.partNumber);
  if (!part) {
    return res.status(404).json({ error: "Part not found" });
  }
  res.json(part);
});

// GET /api/parts/search?q=...
router.get("/search/text", (req, res) => {
  const q = req.query.q || "";
  const results = searchProductsByText(q);
  res.json(results);
});

// GET /api/parts/category/:category (Refrigerator, Dishwasher)
router.get("/category/:category", (req, res) => {
  const category = req.params.category;
  const results = getProductsByCategory(category);
  res.json(results);
});

module.exports = router;
