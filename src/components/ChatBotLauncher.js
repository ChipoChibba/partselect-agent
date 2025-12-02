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

            {/* LOGO + TITLE */}
            <div className="header-left">
              <img
                src="/partselect-logo.png"
                alt="PartSelect Logo"
                className="chatbot-logo"
              />
              <div className="header-text">
                <div className="header-title">Patsy (AI Helper)</div>
                <div className="header-subtitle">I'm here to help</div>
              </div>
            </div>

            {/* Expand + Close Buttons */}
            <div className="header-buttons">
              <button
                className="expand-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "🡣" : "🡡"}
              </button>

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
