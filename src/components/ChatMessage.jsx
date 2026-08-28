import MessageActions from "./MessageActions";

function ChatMessage({
  message,
  onEdit,
  onDelete,
  onCopy,
  onRegenerate,
  onFeedback,
}) {
  if (!message) return null;

  const role = message.role || "assistant";
  const isUser = role === "user";

  return (
    <article
      className={`chat-message ${
        isUser ? "user" : "assistant"
      }`}
    >
      <div className="chat-message-header">
        <div className="chat-message-avatar">
          {isUser ? "You" : "AI"}
        </div>

        <span className="chat-message-role">
          {isUser ? "You" : "DevForge AI"}
        </span>
      </div>

      <div className="chat-message-content">
        {message.content || ""}
      </div>

      <MessageActions
        message={message}
        isUser={isUser}
        onEdit={onEdit}
        onDelete={onDelete}
        onCopy={onCopy}
        onRegenerate={onRegenerate}
        onFeedback={onFeedback}
      />
    </article>
  );
}

export default ChatMessage;