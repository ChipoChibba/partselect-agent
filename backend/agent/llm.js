const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//Calls the LLM with a prompt and returns the response
async function callLLM(prompt) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("LLM error:", err);
    return "Error: Could not reach AI.";
  }
}

module.exports = { callLLM };
