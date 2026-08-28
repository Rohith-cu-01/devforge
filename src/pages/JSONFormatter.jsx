import { useState } from "react";

function JSONFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const parseJSON = () => {
    if (!input.trim()) {
      setError("Please enter some JSON first.");
      setSuccess("");
      setOutput("");
      return null;
    }

    try {
      return JSON.parse(input);
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setSuccess("");
      setOutput("");
      return null;
    }
  };

  const formatJSON = () => {
    const parsed = parseJSON();

    if (parsed === null) return;

    setOutput(JSON.stringify(parsed, null, 2));
    setError("");
    setSuccess("Valid JSON ✓");
    setCopied(false);
  };

  const minifyJSON = () => {
    const parsed = parseJSON();

    if (parsed === null) return;

    setOutput(JSON.stringify(parsed));
    setError("");
    setSuccess("JSON minified ✓");
    setCopied(false);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setSuccess("");
    setCopied(false);
  };

  const loadExample = () => {
    const example = {
      name: "Rohith",
      age: 19,
      role: "Developer",
      skills: ["Python", "React", "JavaScript"],
      active: true,
    };

    setInput(JSON.stringify(example, null, 2));
    setOutput("");
    setError("");
    setSuccess("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy. Please copy manually.");
    }
  };

  const downloadJSON = () => {
    if (!output) return;

    const blob = new Blob([output], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "formatted.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const goHome = () => {
    window.location.href = "/";
  };

  const characterCount = input.length;

  const lineCount = input
    ? input.split("\n").length
    : 0;

  return (
    <div className="json-page">

      <div className="json-topbar">
        <button
          className="back-button"
          onClick={goHome}
        >
          ← DevForge
        </button>

        <span className="tool-label">
          JSON TOOL
        </span>
      </div>

      <div className="json-header">
        <span className="eyebrow">
          DEVELOPER TOOL
        </span>

        <h1>JSON Formatter</h1>

        <p>
          Format, validate, minify and download JSON instantly.
        </p>
      </div>

      <div className="json-toolbar">

        <button onClick={loadExample}>
          Load example
        </button>

        <div className="json-stats">
          <span>
            {characterCount} characters
          </span>

          <span>
            {lineCount} lines
          </span>

          <span>
            Runs in browser
          </span>
        </div>

      </div>

      <div className="json-workspace">

        <div className="json-panel">

          <div className="panel-header">

            <span>
              Input JSON
            </span>

            <button onClick={clearAll}>
              Clear
            </button>

          </div>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="Paste your JSON here..."
            spellCheck="false"
          />

        </div>

        <div className="json-panel">

          <div className="panel-header">

            <span>
              Formatted JSON
            </span>

            <div className="output-buttons">

              <button
                onClick={copyOutput}
                disabled={!output}
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>

              <button
                onClick={downloadJSON}
                disabled={!output}
              >
                Download
              </button>

            </div>

          </div>

          <textarea
            value={output}
            readOnly
            placeholder="Your formatted JSON will appear here..."
            spellCheck="false"
          />

        </div>

      </div>

      <div className="json-actions">

        <button
          className="format-button"
          onClick={formatJSON}
        >
          Format JSON →
        </button>

        <button
          className="minify-button"
          onClick={minifyJSON}
        >
          Minify JSON
        </button>

      </div>

      {success && (
        <div className="json-success">
          <strong>
            {success}
          </strong>

          <span>
            Your JSON has been processed successfully.
          </span>
        </div>
      )}

      {error && (
        <div className="json-error">
          <strong>
            JSON Error
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      <div className="json-info">

        <div>
          <strong>
            What is JSON?
          </strong>

          <p>
            JSON is a lightweight data format commonly used
            for APIs, configuration files and data exchange.
          </p>
        </div>

        <div>
          <strong>
            Private by design
          </strong>

          <p>
            Your JSON is processed directly in your browser.
            It is not uploaded to our server.
          </p>
        </div>

      </div>

    </div>
  );
}

export default JSONFormatter;