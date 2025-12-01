export async function getAIMessage(userMessage) {
  // 1. Send POST request to your backend
  const response = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: userMessage }),
  });

  // 2. Convert backend JSON into a JS object
  const data = await response.json();

  // 3. Return the assistant message in the correct shape for ChatWindow
  return {
    role: "assistant",
    content: data.reply,
  };
}
