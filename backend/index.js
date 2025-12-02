require("dotenv").config();
const express = require("express");
const cors = require("cors");

const partsRouter = require("./api/partsRouter");
const { agentRouter } = require("./agent/router");

const app = express();

app.use(cors());
app.use(express.json());

// Add Parts API (new)
app.use("/api/parts", partsRouter);

// Chat endpoint (existing)
app.post("/api/chat", async (req, res) => {
    const userMessage = req.body.message;
    const reply = await agentRouter(userMessage);
    res.json({ reply });
});

// Server running
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
