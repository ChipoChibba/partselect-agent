import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import "./ChatBotLauncher.css";

function ChatBotLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating chatbot button */}
      {!open && (
        <div className="chatbot-button" onClick={() => setOpen(true)}>
          🤖
        </div>
      )}

      {/* Chat popup */}
      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <span>Instalily Assistant</span>
            <button className="close-btn" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* ChatWindow wrapped in .chatbot-mode for CSS overrides */}
          <div className="chatbot-content chatbot-mode">
            <ChatWindow />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBotLauncher;
