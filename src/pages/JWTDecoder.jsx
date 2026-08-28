import { useState } from "react";

function decodeBase64Url(value) {
  try {
    const base64 = value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const decoded = decodeURIComponent(
      atob(padded)
        .split("")
        .map(
          (char) =>
            "%" +
            ("00" + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function JWTDecoder() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const decodeToken = () => {
    setError("");
    setHeader(null);
    setPayload(null);
    setSignature("");
    setCopied("");

    const parts = token.trim().split(".");

    if (parts.length !== 3) {
      setError(
        "Invalid JWT. A JWT must contain three parts separated by dots."
      );
      return;
    }

    const decodedHeader = decodeBase64Url(parts[0]);
    const decodedPayload = decodeBase64Url(parts[1]);

    if (!decodedHeader || !decodedPayload) {
      setError("Unable to decode the JWT header or payload.");
      return;
    }

    setHeader(decodedHeader);
    setPayload(decodedPayload);
    setSignature(parts[2]);
  };

  const loadExample = () => {
    setToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldkZvcmdlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    );

    setHeader(null);
    setPayload(null);
    setSignature("");
    setError("");
  };

  const clearAll = () => {
    setToken("");
    setHeader(null);
    setPayload(null);
    setSignature("");
    setError("");
    setCopied("");
  };

  const copyValue = async (value, name) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(name);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch {
      setError("Unable to copy.");
    }
  };

  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="jwt-page">

      <div className="jwt-topbar">
        <button
          className="back-button"
          onClick={goHome}
        >
          ← DevForge
        </button>

        <span className="tool-label">
          JWT TOOL
        </span>
      </div>

      <div className="jwt-header">
        <span className="eyebrow">
          DEVELOPER TOOL
        </span>

        <h1>JWT Decoder</h1>

        <p>
          Decode and inspect JWT headers, payloads and signatures.
        </p>
      </div>

      <div className="jwt-input-panel">

        <div className="jwt-panel-header">
          <span>JWT Token</span>

          <div>
            <button onClick={loadExample}>
              Load example
            </button>

            <button onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        <textarea
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setError("");
          }}
          placeholder="Paste your JWT token here..."
          spellCheck="false"
        />

        <button
          className="decode-button"
          onClick={decodeToken}
        >
          Decode JWT →
        </button>

      </div>

      {error && (
        <div className="jwt-error">
          <strong>JWT Error</strong>
          <span>{error}</span>
        </div>
      )}

      {header && payload && (
        <div className="jwt-results">

          <div className="jwt-result-card">

            <div className="jwt-result-header">
              <div>
                <span>HEADER</span>
                <h2>Header</h2>
              </div>

              <button
                onClick={() =>
                  copyValue(
                    JSON.stringify(header, null, 2),
                    "header"
                  )
                }
              >
                {copied === "header" ? "Copied ✓" : "Copy"}
              </button>
            </div>

            <pre>
              {JSON.stringify(header, null, 2)}
            </pre>

          </div>

          <div className="jwt-result-card">

            <div className="jwt-result-header">
              <div>
                <span>PAYLOAD</span>
                <h2>Payload</h2>
              </div>

              <button
                onClick={() =>
                  copyValue(
                    JSON.stringify(payload, null, 2),
                    "payload"
                  )
                }
              >
                {copied === "payload" ? "Copied ✓" : "Copy"}
              </button>
            </div>

            <pre>
              {JSON.stringify(payload, null, 2)}
            </pre>

          </div>

          <div className="jwt-result-card">

            <div className="jwt-result-header">
              <div>
                <span>SIGNATURE</span>
                <h2>Signature</h2>
              </div>

              <button
                onClick={() =>
                  copyValue(signature, "signature")
                }
              >
                {copied === "signature"
                  ? "Copied ✓"
                  : "Copy"}
              </button>
            </div>

            <pre className="signature">
              {signature}
            </pre>

          </div>

        </div>
      )}

      <div className="jwt-warning">

        <strong>⚠ Important security note</strong>

        <p>
          Decoding a JWT does not verify its signature.
          Do not treat decoded claims as trustworthy unless
          the token has been properly verified by your server.
        </p>

      </div>

    </div>
  );
}

export default JWTDecoder;