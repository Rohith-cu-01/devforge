import { useState } from "react";

function Base64Encoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode");
  const [error, setError] = useState("");
const [copied, setCopied] = useState(false);

  const exampleText = "Hello DevForge! Build faster. Work smarter.";

  const encodeBase64 = () => {
    setError("");

    try {
      const encoded = btoa(
        unescape(encodeURIComponent(input))
      );

      setOutput(encoded);
    } catch {
      setOutput("");
      setError("Unable to encode this text.");
    }
  };

  const decodeBase64 = () => {
    setError("");

    try {
      const decoded = decodeURIComponent(
        escape(atob(input))
      );

      setOutput(decoded);
    } catch {
      setOutput("");
      setError("Invalid Base64 input.");
    }
  };

  const processText = () => {
    if (!input.trim()) {
      setError("Please enter some text first.");
      setOutput("");
      return;
    }

    if (mode === "encode") {
      encodeBase64();
    } else {
      decodeBase64();
    }
  };

  const loadExample = () => {
    if (mode === "encode") {
      setInput(exampleText);
    } else {
      setInput("SGVsbG8gRGV2Rm9yZ2UhIEJ1aWxkIGZhc3Rlci4gV29yayBzbWFydGVyLg==");
    }

    setOutput("");
    setError("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const copyOutput = async () => {
  if (!output) return;

  try {
    await navigator.clipboard.writeText(output);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = output;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }
};

  return (
    <div className="base64-page">
      <div className="base64-topbar">
        <button
          className="back-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← DevForge
        </button>

        <span>BASE64 TOOL</span>
      </div>

      <section className="base64-header">
        <span className="eyebrow">DEVELOPER TOOL</span>

        <h1>Base64 Encoder</h1>

        <p>
          Encode and decode Base64 text quickly and securely in your browser.
        </p>
      </section>

      <section className="base64-tool">
        <div className="base64-mode">
          <button
            className={mode === "encode" ? "active" : ""}
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
            className={mode === "decode" ? "active" : ""}
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

        <div className="base64-actions">
          <button onClick={loadExample}>
            Load example
          </button>

          <button onClick={clearAll}>
            Clear
          </button>
        </div>

        <div className="base64-grid">
          <div className="base64-panel">
            <div className="base64-panel-header">
              <span>
                {mode === "encode" ? "Plain Text" : "Base64 Input"}
              </span>
            </div>

            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Paste Base64 text here..."
              }
            />
          </div>

          <div className="base64-panel">
            <div className="base64-panel-header">
              <span>
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </span>

              <button
  className="small-button"
  onClick={copyOutput}
  disabled={!output}
>
  {copied ? "Copied ✓" : "Copy"}
</button>
            </div>

            <textarea
              value={output}
              readOnly
              placeholder={
                mode === "encode"
                  ? "Encoded Base64 will appear here..."
                  : "Decoded text will appear here..."
              }
            />
          </div>
        </div>

        <button
          className="primary-button"
          onClick={processText}
        >
          {mode === "encode"
            ? "Encode Base64 →"
            : "Decode Base64 →"}
        </button>

        {error && (
          <div className="base64-error">
            <strong>Base64 Error</strong>
            <span>{error}</span>
          </div>
        )}

        <div className="base64-note">
          <strong>Runs entirely in your browser</strong>
          <p>
            Your text is processed locally. Nothing is sent to a server.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Base64Encoder;