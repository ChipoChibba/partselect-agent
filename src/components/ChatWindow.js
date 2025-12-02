// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { getAIMessage } from "../api/api";
import { marked } from "marked";

function ChatWindow() {
  const defaultMessage = [
    { role: "assistant", content: "Hi, I’m Patsy! How can I help you today?" }
  ];

  const [messages, setMessages] = useState(defaultMessage);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");

    setTyping(true);
    const newMessage = await getAIMessage(userInput);
    setTyping(false);

    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="chatwindow-wrapper">

      {/* Scrollable messages */}
      <div className="messages-scroll-area">
        {messages.map((msg, i) => (
          <div key={i} className={`${msg.role}-row`}>

            {/* Assistant avatar only */}
            {msg.role === "assistant" && (
              <div className="avatar-col">
                <img
                  src="/partselect_logo.png"
                  className="avatar assistant-avatar"
                  alt="Patsy"
                />
              </div>
            )}

            {/* Bubble */}
            <div
              className={`bubble ${msg.role}-bubble`}
              dangerouslySetInnerHTML={{
                __html: marked(msg.content).replace(/<p>|<\/p>/g, "")
              }}
            />
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="assistant-row">
            <div className="avatar-col">
              <img
                src="/partselect_logo.png"
                className="avatar assistant-avatar"
                alt="Patsy"
              />
            </div>

            <div className="bubble assistant-bubble typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* Input bar */}
      <div className="input-bar">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
        />
        <button className="send-button" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
