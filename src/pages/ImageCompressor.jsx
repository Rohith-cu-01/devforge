import { useState } from "react";

function ImageCompressor() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [quality, setQuality] = useState(70);
  const [compressed, setCompressed] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setImage(file);
    setOriginalSize(file.size);
    setCompressed(null);
    setCompressedSize(0);

    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const compressImage = () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const compressedUrl = URL.createObjectURL(blob);

          setCompressed(compressedUrl);
          setCompressedSize(blob.size);
        },
        "image/jpeg",
        quality / 100
      );
    };

    img.src = preview;
  };

  const clearAll = () => {
    setImage(null);
    setPreview("");
    setCompressed(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setQuality(70);
  };

  const reduction =
    originalSize && compressedSize
      ? Math.max(
          0,
          ((originalSize - compressedSize) / originalSize) * 100
        ).toFixed(1)
      : 0;

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

        <span className="tool-label">IMAGE TOOL</span>
      </div>

      <section className="tool-hero">
        <span className="eyebrow">UTILITY TOOL</span>

        <h1>Image Compressor</h1>

        <p>
          Reduce image size quickly without complicated software.
        </p>
      </section>

      <section className="tool-workspace">
        <div className="workspace-header">
          <strong>Compress Image</strong>

          <button
            className="back-button"
            onClick={clearAll}
          >
            Clear
          </button>
        </div>

        <div className="compressor-content">
          <label className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
            />

            <div className="upload-icon">IMG</div>

            <strong>Upload an image</strong>

            <span>
              PNG, JPG, JPEG, WEBP
            </span>
          </label>

          {preview && (
            <div className="image-preview">
              <div>
                <span className="preview-label">
                  Original
                </span>

                <img
                  src={preview}
                  alt="Original preview"
                />

                <p>
                  {formatSize(originalSize)}
                </p>
              </div>
            </div>
          )}

          <div className="quality-section">
            <div className="quality-header">
              <label>Compression Quality</label>

              <strong>{quality}%</strong>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) =>
                setQuality(Number(e.target.value))
              }
            />

            <div className="quality-labels">
              <span>Smaller size</span>
              <span>Better quality</span>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={compressImage}
          >
            Compress Image →
          </button>
        </div>
      </section>

      {compressed && (
        <section className="qr-result compressor-result">
          <span className="eyebrow">RESULT</span>

          <h2>Compressed Image</h2>

          <div className="compression-stats">
            <div>
              <span>Original</span>
              <strong>
                {formatSize(originalSize)}
              </strong>
            </div>

            <div>
              <span>Compressed</span>
              <strong>
                {formatSize(compressedSize)}
              </strong>
            </div>

            <div>
              <span>Reduced</span>
              <strong>
                {reduction}%
              </strong>
            </div>
          </div>

          <div className="qr-card">
            <img
              src={compressed}
              alt="Compressed preview"
            />

            <a
              href={compressed}
              download="devforge-compressed.jpg"
            >
              Download Image →
            </a>
          </div>
        </section>
      )}

      <section className="browser-note">
        <strong>✓ Runs entirely in your browser</strong>

        <p>
          Your images are processed locally and are not
          uploaded to a server.
        </p>
      </section>
    </div>
  );
}

export default ImageCompressor;