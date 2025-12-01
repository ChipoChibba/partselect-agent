const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

//simplified endpoint 
app.post("/api/chat", (req,res)=>{
    const userMessage = req.body.message || "";
    res.json({reply:`You said: ${userMessage}`}) 
});

//server running
const PORT = 5000;
app.listen(PORT, ()=>{
    console.log(`Backend server running at http://localhost:${PORT}`)
});