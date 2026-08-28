import { useState } from "react";

function Codex() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);

  const sendPrompt = () => {
    if (!prompt.trim()) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        text: prompt.trim(),
      },
    ]);

    setPrompt("");
  };

  return (
    <div className="workspace-page">

      <header className="workspace-page-header">

        <div>
          <h1>Codex</h1>

          <p className="workspace-subtitle">
            Build apps, websites, and developer tools
            with AI.
          </p>
        </div>

        <button
          className="workspace-new-button"
          onClick={() => {
            setMessages([]);
            setPrompt("");
          }}
        >
          ＋ New
        </button>

      </header>

      <section className="codex-hero">

        <div className="codex-icon">
          &lt;/&gt;
        </div>

        <h2>
          Build with Codex
        </h2>

        <p>
          Start with an idea and let AI help you
          write and improve your code.
        </p>

      </section>

      {messages.length > 0 && (
        <div className="codex-messages">

          {messages.map((message) => (
            <div
              className="codex-message"
              key={message.id}
            >
              <span className="codex-message-icon">
                👤
              </span>

              <div>
                <strong>You</strong>
                <p>{message.text}</p>
              </div>
            </div>
          ))}

        </div>
      )}

      <div className="codex-input">

        <span>＋</span>

        <textarea
          placeholder="Describe what you want to build..."
          value={prompt}
          onChange={(event) =>
            setPrompt(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();
              sendPrompt();
            }
          }}
        />

        <button
          onClick={sendPrompt}
          disabled={!prompt.trim()}
        >
          ↑
        </button>

      </div>

      <p className="codex-hint">
        Press Enter to send • Shift + Enter for a
        new line
      </p>

    </div>
  );
}

export default Codex;