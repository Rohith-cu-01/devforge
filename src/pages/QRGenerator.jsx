import { useState } from "react";

function QRGenerator() {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const generateQR = () => {
    if (!text.trim()) {
      setQrUrl("");
      return;
    }

    const encodedText = encodeURIComponent(text.trim());

    setQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`
    );
  };

  const loadExample = () => {
    setText("https://github.com/");
    setQrUrl("");
  };

  const clearAll = () => {
    setText("");
    setQrUrl("");
  };

  return (
    <div className="tool-page">
      <div className="tool-page-header">
        <button
          className="back-button"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          ← DevForge
        </button>

        <span className="tool-label">QR TOOL</span>
      </div>

      <section className="tool-hero">
        <span className="eyebrow">UTILITY TOOL</span>

        <h1>QR Generator</h1>

        <p>
          Create QR codes from text or links instantly in your browser.
        </p>
      </section>

      <section className="tool-workspace">
        <div className="workspace-header">
          <strong>QR Code Generator</strong>

          <div className="workspace-actions">
            <button onClick={loadExample}>
              Load example
            </button>

            <button onClick={clearAll}>
              Clear
            </button>
          </div>
        </div>

        <div className="qr-input-area">
          <label>Text or URL</label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or URL to generate a QR code..."
          />
        </div>

        <button
          className="primary-button"
          onClick={generateQR}
        >
          Generate QR →
        </button>
      </section>

      {qrUrl && (
        <section className="qr-result">
          <span className="eyebrow">RESULT</span>

          <h2>Your QR Code</h2>

          <div className="qr-card">
            <img
              src={qrUrl}
              alt="Generated QR Code"
            />

            <p>{text}</p>

            <a
              href={qrUrl}
              download="devforge-qr-code.png"
              target="_blank"
              rel="noreferrer"
            >
              Download QR →
            </a>
          </div>
        </section>
      )}

      <section className="browser-note">
        <strong>✓ Runs in your browser</strong>

        <p>
          Your text is processed locally in your browser.
        </p>
      </section>
    </div>
  );
}

export default QRGenerator;