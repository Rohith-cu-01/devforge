import { useState } from "react";
import "./RegexTester.css";

function RegexTester() {
  const [regex, setRegex] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  const loadExample = () => {
    setRegex("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b");
    setFlags("g");
    setTestText(
      "Contact us at hello@example.com or support@test.org"
    );
    setMatches([]);
    setError("");
  };

  const clearAll = () => {
    setRegex("");
    setFlags("g");
    setTestText("");
    setMatches([]);
    setError("");
  };

  const testRegex = () => {
    setError("");
    setMatches([]);

    if (!regex.trim()) {
      setError("Please enter a regular expression.");
      return;
    }

    try {
      const pattern = new RegExp(regex, flags);

      if (pattern.global || pattern.sticky) {
        const result = [...testText.matchAll(pattern)];

        setMatches(
          result.map((match, index) => ({
            number: index + 1,
            value: match[0],
            position: match.index,
          }))
        );
      } else {
        const match = pattern.exec(testText);

        if (match) {
          setMatches([
            {
              number: 1,
              value: match[0],
              position: match.index,
            },
          ]);
        }
      }
    } catch (err) {
      setError(`Invalid regular expression: ${err.message}`);
    }
  };

  return (
    <div className="regex-page">

      <div className="regex-topbar">
        <button
          className="regex-back"
          onClick={() => (window.location.href = "/")}
        >
          ← DevForge
        </button>

        <span>REGEX TOOL</span>
      </div>

      <header className="regex-header">
        <div className="regex-eyebrow">
          DEVELOPER TOOL
        </div>

        <h1>Regex Tester</h1>

        <p>
          Test regular expressions against your text and inspect
          matches instantly.
        </p>
      </header>

      <main className="regex-container">

        <section className="regex-panel">

          <div className="regex-panel-top">

            <div className="regex-input-wrapper">
              <label>Regular Expression</label>

              <div className="regex-input-box">
                <span>/</span>

                <input
                  value={regex}
                  onChange={(e) => setRegex(e.target.value)}
                  placeholder="Enter your regex..."
                />

                <span>/</span>
              </div>
            </div>

            <div className="regex-flags">
              <label>Flags</label>

              <input
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="g"
              />
            </div>

          </div>

          <div className="regex-toolbar">
            <button onClick={loadExample}>
              Load example
            </button>

            <button onClick={clearAll}>
              Clear
            </button>
          </div>

          <div className="regex-text-section">

            <label>Test Text</label>

            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test your regular expression..."
            />

          </div>

          <button
            className="regex-test-button"
            onClick={testRegex}
          >
            Test Regex →
          </button>

        </section>

        {error && (
          <section className="regex-error-box">
            <div className="error-title">
              Regex Error
            </div>

            <p>{error}</p>
          </section>
        )}

        {!error && matches.length > 0 && (
          <section className="regex-results">

            <div className="results-header">
              <div>
                <span>RESULTS</span>
                <h2>Matches Found</h2>
              </div>

              <div className="match-badge">
                {matches.length}{" "}
                {matches.length === 1 ? "match" : "matches"}
              </div>
            </div>

            <div className="matches-list">

              {matches.map((match) => (
                <div
                  className="match-row"
                  key={match.number}
                >
                  <div className="match-number">
                    {match.number}
                  </div>

                  <div className="match-info">
                    <strong>{match.value}</strong>

                    <span>
                      Position: {match.position}
                    </span>
                  </div>
                </div>
              ))}

            </div>

          </section>
        )}

        {!error &&
          regex &&
          testText &&
          matches.length === 0 && (
            <section className="no-match-box">
              <h3>No Matches</h3>

              <p>
                The regular expression did not match anything
                in your test text.
              </p>
            </section>
          )}

        <section className="regex-security">

          <strong>
            ✓ Runs entirely in your browser
          </strong>

          <p>
            Your regular expression and test text stay on your device.
          </p>

        </section>

      </main>
    </div>
  );
}

export default RegexTester;