require("dotenv").config();
const express = require("express")
const cors = require("cors")

const app = express()
const { agentRouter } = require("./agent/router")

app.use(cors())
app.use(express.json())

//simplified endpoint 
app.post("/api/chat", async (req,res)=>{
    const userMessage = req.body.message;
    const reply = await agentRouter(userMessage);
    res.json({reply}) 
});

//server running
const PORT = 5000;
app.listen(PORT, ()=>{
    console.log(`Backend server running at http://localhost:${PORT}`)
});