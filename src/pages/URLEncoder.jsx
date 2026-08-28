import { useState } from "react";

function URLEncoder() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const processText = () => {
    setError("");

    if (!input.trim()) {
      setOutput("");
      setError("Please enter some text first.");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch {
      setOutput("");
      setError("Invalid encoded URL. Please check your input.");
    }
  };

  const loadExample = () => {
    setError("");

    if (mode === "encode") {
      setInput("https://example.com/search?q=hello world&category=developer");
    } else {
      setInput(
        "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26category%3Ddeveloper"
      );
    }

    setOutput("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  return (
    <div className="tool-page">
      <div className="tool-topbar">
        <button
          className="back-button"
          onClick={() => (window.location.href = "/")}
        >
          ← DevForge
        </button>

        <span className="tool-label">URL TOOL</span>
      </div>

      <section className="tool-hero">
        <span className="eyebrow">DEVELOPER TOOL</span>

        <h1>URL Encoder</h1>

        <p>Encode or decode URLs safely and instantly in your browser.</p>
      </section>

      <section className="url-container">
        <div className="mode-switch">
          <button
            className={mode === "encode" ? "mode-active" : ""}
            onClick={() => {
              setMode("encode");
              setInput("");
              setOutput("");
              setError("");
            }}
          >
            Encode
          </button>

          <button
            className={mode === "decode" ? "mode-active" : ""}
            onClick={() => {
              setMode("decode");
              setInput("");
              setOutput("");
              setError("");
            }}
          >
            Decode
          </button>
        </div>

        <div className="url-actions">
          <button className="secondary-button" onClick={loadExample}>
            Load example
          </button>

          <button className="secondary-button" onClick={clearAll}>
            Clear
          </button>
        </div>

        <div className="url-grid">
          <div className="url-card">
            <div className="url-card-header">
              <h3>
                {mode === "encode" ? "Plain URL" : "Encoded URL"}
              </h3>
            </div>

            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder={
                mode === "encode"
                  ? "Enter URL or text to encode..."
                  : "Enter encoded URL to decode..."
              }
            />
          </div>

          <div className="url-card">
            <div className="url-card-header">
              <h3>
                {mode === "encode" ? "Encoded URL" : "Decoded URL"}
              </h3>

              <button
                className="copy-button"
                onClick={copyOutput}
                disabled={!output}
              >
                Copy
              </button>
            </div>

            <textarea
              value={output}
              readOnly
              placeholder={
                mode === "encode"
                  ? "Encoded URL will appear here..."
                  : "Decoded URL will appear here..."
              }
            />
          </div>
        </div>

        <div className="url-submit">
          <button className="primary-button" onClick={processText}>
            {mode === "encode" ? "Encode URL →" : "Decode URL →"}
          </button>
        </div>

        {error && (
          <div className="url-error">
            <strong>URL Error</strong>
            <p>{error}</p>
          </div>
        )}

        {output && !error && (
          <div className="url-success">
            <strong>
              ✓ {mode === "encode" ? "URL Encoded" : "URL Decoded"}
            </strong>

            <p>
              Your {mode === "encode" ? "URL has been encoded" : "encoded URL has been decoded"}{" "}
              successfully.
            </p>
          </div>
        )}

        <div className="browser-note">
          <strong>✓ Runs entirely in your browser</strong>
          <p>
            Your URLs and text are processed locally. Nothing is sent to a
            server.
          </p>
        </div>
      </section>
    </div>
  );
}

export default URLEncoder;