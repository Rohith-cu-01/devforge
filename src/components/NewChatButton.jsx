function NewChatButton({
  onClick,
  collapsed = false,
}) {
  return (
    <button
      className={`new-chat-button ${
        collapsed ? "collapsed" : ""
      }`}
      onClick={onClick}
      title="Start a new chat"
    >
      <span className="new-chat-button-icon">
        ＋
      </span>

      {!collapsed && (
        <span>New chat</span>
      )}
    </button>
  );
}

export default NewChatButton;