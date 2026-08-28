import { useState } from "react";

function UUIDGenerator() {
  const [uuids, setUuids] = useState([]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState(null);

  const generateUUID = () => {
    const newUuids = [];

    for (let i = 0; i < count; i++) {
      newUuids.push(crypto.randomUUID());
    }

    setUuids(newUuids);
    setCopied(null);
  };

  const copyUUID = async (uuid, index) => {
    await navigator.clipboard.writeText(uuid);
    setCopied(index);

    setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  const copyAll = async () => {
    if (uuids.length === 0) return;

    await navigator.clipboard.writeText(uuids.join("\n"));
    setCopied("all");

    setTimeout(() => {
      setCopied(null);
    }, 1500);
  };

  const clearUUIDs = () => {
    setUuids([]);
    setCopied(null);
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

        <span className="tool-label">UUID TOOL</span>
      </div>

      <section className="tool-hero">
        <span className="eyebrow">DEVELOPER TOOL</span>

        <h1>UUID Generator</h1>

        <p>
          Generate secure unique identifiers instantly in your browser.
        </p>
      </section>

      <section className="uuid-container">
        <div className="uuid-controls">
          <div className="control-group">
            <label>Number of UUIDs</label>

            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            >
              <option value={1}>1 UUID</option>
              <option value={5}>5 UUIDs</option>
              <option value={10}>10 UUIDs</option>
              <option value={20}>20 UUIDs</option>
              <option value={50}>50 UUIDs</option>
            </select>
          </div>

          <div className="control-actions">
            <button className="secondary-button" onClick={clearUUIDs}>
              Clear
            </button>

            <button className="primary-button" onClick={generateUUID}>
              Generate UUID →
            </button>
          </div>
        </div>

        <div className="uuid-results">
          <div className="results-header">
            <div>
              <span className="eyebrow">RESULTS</span>
              <h2>Generated UUIDs</h2>
            </div>

            {uuids.length > 0 && (
              <button className="secondary-button" onClick={copyAll}>
                {copied === "all" ? "Copied ✓" : "Copy All"}
              </button>
            )}
          </div>

          {uuids.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">ID</div>
              <h3>No UUIDs generated</h3>
              <p>
                Select the number of UUIDs and click Generate UUID.
              </p>
            </div>
          ) : (
            <div className="uuid-list">
              {uuids.map((uuid, index) => (
                <div className="uuid-item" key={uuid}>
                  <span className="uuid-number">{index + 1}</span>

                  <code>{uuid}</code>

                  <button
                    className="copy-button"
                    onClick={() => copyUUID(uuid, index)}
                  >
                    {copied === index ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="browser-note">
          <strong>✓ Runs entirely in your browser</strong>
          <p>
            UUIDs are generated locally using your browser's secure random
            number generator.
          </p>
        </div>
      </section>
    </div>
  );
}

export default UUIDGenerator;