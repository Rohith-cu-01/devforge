import { useState } from "react";
import "../styles/ChatSidebar.css";

function ChatSidebar({
  chatHistory = [],
  pinnedChats = [],
  currentChatId,
  searchTerm = "",
  setSearchTerm,
  loadChat,
  togglePinChat,
  deleteChat,
  clearHistory,
  newChat,
}) {
  const [moreOpen, setMoreOpen] = useState(false);

  const filteredHistory = [...chatHistory]
    .filter((chat) =>
      String(chat.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aPinned = pinnedChats.includes(a.id);
      const bPinned = pinnedChats.includes(b.id);

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      return (
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
      );
    });

  const pinnedHistory = filteredHistory.filter((chat) =>
    pinnedChats.includes(chat.id)
  );

  const normalHistory = filteredHistory.filter(
    (chat) => !pinnedChats.includes(chat.id)
  );

  const goTo = (path) => {
    window.location.href = path;
  };

  const handleNewChat = () => {
    setMoreOpen(false);
    newChat();
  };

  return (
    <aside className="chat-sidebar">

      {/* HEADER */}

      <div className="chat-sidebar-header">

        <button
          className="chat-sidebar-brand"
          onClick={() => goTo("/")}
        >
          <span className="chat-sidebar-brand-text">
            <span className="chat-sidebar-logo">
              &lt;/&gt;
            </span>
            <span>DevForge</span>
          </span>

          <span className="chat-sidebar-collapse">
            ‹
          </span>
        </button>

        <button
          className="chat-sidebar-search-button"
          onClick={() => {
            document
              .querySelector(".chat-sidebar-search-input")
              ?.focus();
          }}
          title="Search"
        >
          ⌕
        </button>

      </div>

      {/* NEW CHAT */}

      <button
        className="chat-sidebar-new-chat"
        onClick={handleNewChat}
      >
        <span className="new-chat-icon">
          ✎
        </span>

        <span>
          New chat
        </span>
      </button>

      {/* MAIN NAVIGATION */}

      <nav className="chat-sidebar-nav">

        <button onClick={() => goTo("/library")}>
          <span className="sidebar-nav-icon">
            ▥
          </span>
          <span>Library</span>
        </button>

        <button onClick={() => goTo("/projects")}>
          <span className="sidebar-nav-icon">
            □
          </span>
          <span>Projects</span>
        </button>

        <button onClick={() => goTo("/scheduled")}>
          <span className="sidebar-nav-icon">
            ◷
          </span>
          <span>Scheduled</span>
        </button>

        <button onClick={() => goTo("/codex")}>
          <span className="sidebar-nav-icon">
            ◈
          </span>
          <span>Codex</span>
        </button>

      </nav>

      {/* MORE */}

      <div className="chat-sidebar-more-wrapper">

        <button
          className={`chat-sidebar-more ${
            moreOpen ? "active" : ""
          }`}
          onClick={() =>
            setMoreOpen((value) => !value)
          }
        >
          <span className="more-dots">
            •••
          </span>

          <span>
            More
          </span>
        </button>

        {moreOpen && (
          <div className="chat-sidebar-more-menu">

            <button onClick={() => goTo("/images")}>
              <span>▧</span>
              Images
            </button>

            <button onClick={() => goTo("/maps")}>
              <span>⌖</span>
              Maps
            </button>

            <button onClick={() => goTo("/gpts")}>
              <span>◇</span>
              GPTs
            </button>

            <button>
              <span>⚙</span>
              Settings
            </button>

            <button>
              <span>?</span>
              Help
            </button>

          </div>
        )}

      </div>

      {/* CHAT HISTORY */}

      <div className="chat-sidebar-history">

        {/* SEARCH */}

        <div className="chat-sidebar-search">

          <span>
            ⌕
          </span>

          <input
            className="chat-sidebar-search-input"
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>

        {/* PINNED */}

        {pinnedHistory.length > 0 && (
          <section className="chat-sidebar-section">

            <div className="chat-sidebar-section-title">

              <span>
                PINNED
              </span>

              <span>
                {pinnedChats.length}/5
              </span>

            </div>

            {pinnedHistory.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                chat={chat}
                pinned={true}
                active={currentChatId === chat.id}
                loadChat={loadChat}
                togglePinChat={togglePinChat}
                deleteChat={deleteChat}
              />
            ))}

          </section>
        )}

        {/* RECENT */}

        {normalHistory.length > 0 && (
          <section className="chat-sidebar-section">

            <div className="chat-sidebar-section-title">
              <span>
                RECENT
              </span>
            </div>

            {normalHistory.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                chat={chat}
                pinned={false}
                active={currentChatId === chat.id}
                loadChat={loadChat}
                togglePinChat={togglePinChat}
                deleteChat={deleteChat}
              />
            ))}

          </section>
        )}

        {/* EMPTY */}

        {filteredHistory.length === 0 && (
          <div className="chat-sidebar-empty">

            <span>
              💬
            </span>

            <p>
              {searchTerm
                ? "No chats found"
                : "No chat history yet"}
            </p>

          </div>
        )}

      </div>

      {/* CLEAR HISTORY */}

      {chatHistory.length > 0 && (
        <div className="chat-sidebar-footer">

          <button onClick={clearHistory}>
            Clear history
          </button>

        </div>
      )}

    </aside>
  );
}

function ChatHistoryItem({
  chat,
  pinned,
  active,
  loadChat,
  togglePinChat,
  deleteChat,
}) {
  return (
    <div
      className={`chat-sidebar-chat ${
        active ? "chat-sidebar-chat-active" : ""
      }`}
    >

      <button
        className="chat-sidebar-chat-title"
        onClick={() => loadChat(chat)}
        title={chat.title}
      >
        <span className="chat-sidebar-chat-icon">
          {pinned ? "📌" : "💬"}
        </span>

        <span className="chat-sidebar-chat-name">
          {chat.title}
        </span>
      </button>

      <div className="chat-sidebar-chat-actions">

        <button
          className={`chat-sidebar-pin ${
            pinned ? "pinned" : ""
          }`}
          onClick={() =>
            togglePinChat(chat.id)
          }
          title={pinned ? "Unpin chat" : "Pin chat"}
        >
          {pinned ? "★" : "☆"}
        </button>

        <button
          className="chat-sidebar-delete"
          onClick={() =>
            deleteChat(chat.id)
          }
          title="Delete chat"
        >
          ×
        </button>

      </div>

    </div>
  );
}

export default ChatSidebar;