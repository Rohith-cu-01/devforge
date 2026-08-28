import { useState } from "react";

function MessageActions({
  message,
  isUser = false,
  onEdit,
  onDelete,
  onCopy,
  onRegenerate,
  onFeedback,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = message?.content || "";

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1200);

      onCopy?.(message);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      "Delete this message?"
    );

    if (!confirmed) return;

    onDelete?.(message);
  };

  const handleFeedback = (value) => {
    onFeedback?.(message, value);
  };

  return (
    <div className="message-actions">
      {!isUser && (
        <>
          <button
            title="Good response"
            className={
              message.feedback === "up"
                ? "selected"
                : ""
            }
            onClick={() =>
              handleFeedback("up")
            }
          >
            👍
          </button>

          <button
            title="Bad response"
            className={
              message.feedback === "down"
                ? "selected"
                : ""
            }
            onClick={() =>
              handleFeedback("down")
            }
          >
            👎
          </button>
        </>
      )}

      <button
        title="Copy"
        onClick={handleCopy}
      >
        {copied ? "✓" : "Copy"}
      </button>

      {isUser && (
        <button
          title="Edit message"
          onClick={() =>
            onEdit?.(message)
          }
        >
          ✎ Edit
        </button>
      )}

      {!isUser && (
        <button
          title="Regenerate response"
          onClick={() =>
            onRegenerate?.(message)
          }
        >
          ↻ Regenerate
        </button>
      )}

      <button
        title="Delete message"
        onClick={handleDelete}
      >
        🗑 Delete
      </button>
    </div>
  );
}

export default MessageActions;