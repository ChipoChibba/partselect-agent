import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import "./ChatBotLauncher.css";

function ChatBotLauncher() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
        <div className={`chatbot-container ${expanded ? "expanded" : ""}`}>
          <div className="chatbot-header">
            <span>Instalily Assistant</span>

            <div className="header-buttons">
              {/* Expand / collapse button */}
              <button
                className="expand-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "🡣" : "🡡"}
              </button>

              {/* Close button */}
              <button
                className="close-btn"
                onClick={() => {
                  setExpanded(false);
                  setOpen(false);
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chatbot-content chatbot-mode">
            <ChatWindow />
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBotLauncher;
