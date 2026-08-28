import { useEffect, useState } from "react";
import "../styles/DevForgeWorkspace.css";

const navTop = [
  ["new-chat", "✎", "New chat"],
  ["library", "▥", "Library"],
  ["projects", "□", "Projects"],
  ["scheduled", "◷", "Scheduled"],
  ["share", "↗", "Share"],
  ["codex", "⌘", "Codex"],
];

const moreItems = [
  ["images", "▧", "Images"],
  ["maps", "⌖", "Maps"],
  ["gpts", "◇", "GPTs"],
];

const routes = {
  "new-chat": "/ai-prompt-generator?new=true",
  library: "/library",
  projects: "/projects",
  scheduled: "/scheduled",
  share: "/share",
  codex: "/codex",
  images: "/images",
  maps: "/maps",
  gpts: "/gpts",
};

function getChatHistory() {
  try {
    const saved = localStorage.getItem(
      "devforge-chat-history"
    );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export default function DevForgeShell({
  children,
}) {
  const [open, setOpen] = useState(() => {
    try {
      return (
        localStorage.getItem(
          "devforge-sidebar"
        ) !== "closed"
      );
    } catch {
      return true;
    }
  });

  const [mobile, setMobile] =
    useState(false);

  const [moreOpen, setMoreOpen] =
    useState(false);

  const [history, setHistory] =
    useState(getChatHistory);

  /* =========================================
     SAVE SIDEBAR STATE
     ========================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "devforge-sidebar",
        open ? "open" : "closed"
      );
    } catch (error) {
      console.error(
        "Unable to save sidebar state:",
        error
      );
    }
  }, [open]);

  /* =========================================
     REFRESH CHAT HISTORY
     ========================================= */

  useEffect(() => {
    const refreshHistory = () => {
      setHistory(getChatHistory());
    };

    window.addEventListener(
      "storage",
      refreshHistory
    );

    const interval = setInterval(
      refreshHistory,
      1000
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshHistory
      );

      clearInterval(interval);
    };
  }, []);

  /* =========================================
     NAVIGATION
     ========================================= */

  const go = (key) => {
    setMoreOpen(false);
    setMobile(false);

    const route = routes[key];

    if (!route) {
      return;
    }

    /* NEW CHAT */

    if (key === "new-chat") {
      localStorage.removeItem(
        "devforge-current-chat"
      );

      localStorage.removeItem(
        "devforge-current-chat-id"
      );

      window.location.href = route;

      return;
    }

    window.location.href = route;
  };

  /* =========================================
     LOAD CHAT
     ========================================= */

  const loadChat = (chat) => {
    if (!chat) {
      return;
    }

    try {
      localStorage.setItem(
        "devforge-current-chat",
        JSON.stringify(
          chat.messages || []
        )
      );

      if (chat.id !== undefined) {
        localStorage.setItem(
          "devforge-current-chat-id",
          String(chat.id)
        );
      }
    } catch (error) {
      console.error(
        "Unable to load chat:",
        error
      );
    }

    setMoreOpen(false);
    setMobile(false);

    window.location.href =
      "/ai-prompt-generator";
  };

  /* =========================================
     PINNED / RECENT
     ========================================= */

  const pinned = history
    .filter(
      (chat) => chat?.pinned === true
    )
    .slice(0, 5);

  const recent = history
    .filter(
      (chat) => chat?.pinned !== true
    )
    .slice(0, 5);

  /* =========================================
     CLOSE MORE WHEN CLICKING OUTSIDE
     ========================================= */

  useEffect(() => {
    const handleClick = (event) => {
      if (
        !event.target.closest(
          ".df-more-wrapper"
        )
      ) {
        setMoreOpen(false);
      }
    };

    document.addEventListener(
      "click",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );
    };
  }, []);

  return (
    <div
      className={`df-shell ${
        open
          ? "df-shell-open"
          : "df-shell-closed"
      }`}
    >

      {/* =====================================
          MOBILE OVERLAY
          ===================================== */}

      {mobile && (
        <div
          className="df-overlay"
          onClick={() =>
            setMobile(false)
          }
        />
      )}

      {/* =====================================
          SIDEBAR
          ===================================== */}

      <aside
        className={`df-sidebar ${
          mobile
            ? "df-mobile-open"
            : ""
        }`}
      >

        {/* ===================================
            SIDEBAR HEADER
            =================================== */}

        <div className="df-sidebar-top">

          <button
            type="button"
            className="df-brand"
            onClick={() => {
              setMoreOpen(false);
              setMobile(false);
              window.location.href = "/";
            }}
            title="DevForge"
          >
            <span className="df-brand-mark">
              &lt;/&gt;
            </span>

            {open && (
              <span>
                DevForge
              </span>
            )}
          </button>

          {open && (
            <button
              type="button"
              className="df-search-button"
              title="Search chats"
              onClick={() => {
                const input =
                  document.querySelector(
                    ".df-chat-search-input"
                  );

                input?.focus();
              }}
            >
              ⌕
            </button>
          )}

          <button
            type="button"
            className="df-collapse"
            onClick={() => {
              setOpen(
                (value) => !value
              );

              setMoreOpen(false);
            }}
            title={
              open
                ? "Collapse sidebar"
                : "Open sidebar"
            }
          >
            {open ? "‹" : "›"}
          </button>

        </div>

        {/* ===================================
            MAIN NAVIGATION

            New chat
            Library
            Projects
            Scheduled
            Codex
            =================================== */}

        <nav className="df-nav">

          {navTop.map(
            ([key, icon, label]) => (
              <button
                type="button"
                key={key}
                className="df-nav-item"
                onClick={() =>
                  go(key)
                }
                title={
                  open
                    ? label
                    : label
                }
              >
                <span className="df-nav-icon">
                  {icon}
                </span>

                {open && (
                  <span>
                    {label}
                  </span>
                )}
              </button>
            )
          )}

        </nav>

        {/* ===================================
            CHAT HISTORY
            =================================== */}

        {open &&
          history.length > 0 && (
            <div className="df-history-container">

              {/* PINNED */}

              {pinned.length > 0 && (
                <section className="df-history">

                  <div className="df-history-title">
                    PINNED
                  </div>

                  {pinned.map(
                    (chat) => (
                      <button
                        type="button"
                        key={chat.id}
                        className="df-chat-link"
                        onClick={() =>
                          loadChat(chat)
                        }
                        title={
                          chat.title ||
                          "New chat"
                        }
                      >
                        <span>
                          ★
                        </span>

                        <span>
                          {chat.title ||
                            "New chat"}
                        </span>
                      </button>
                    )
                  )}

                </section>
              )}

              {/* RECENT */}

              {recent.length > 0 && (
                <section className="df-history">

                  <div className="df-history-title">
                    RECENT
                  </div>

                  {recent.map(
                    (chat) => (
                      <button
                        type="button"
                        key={chat.id}
                        className="df-chat-link"
                        onClick={() =>
                          loadChat(chat)
                        }
                        title={
                          chat.title ||
                          "New chat"
                        }
                      >
                        <span>
                          ◉
                        </span>

                        <span>
                          {chat.title ||
                            "New chat"}
                        </span>
                      </button>
                    )
                  )}

                </section>
              )}

            </div>
          )}

        {/* ===================================
            CHAT SEARCH
            =================================== */}

        {open && (
          <div className="df-chat-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              className="df-chat-search-input"
              placeholder="Search chats..."
              onChange={(event) => {
                const value =
                  event.target.value
                    .toLowerCase();

                const filtered =
                  getChatHistory().filter(
                    (chat) =>
                      (
                        chat.title ||
                        ""
                      )
                        .toLowerCase()
                        .includes(value)
                  );

                setHistory(filtered);
              }}
            />

          </div>
        )}

        {/* ===================================
            MORE
            =================================== */}

        <div className="df-more-wrapper">

          <button
            type="button"
            className={`df-more-button ${
              moreOpen
                ? "active"
                : ""
            }`}
            onClick={(event) => {
              event.stopPropagation();

              setMoreOpen(
                (value) => !value
              );
            }}
            title="More"
          >
            <span className="df-nav-icon">
              •••
            </span>

            {open && (
              <span>
                More
              </span>
            )}
          </button>

          {open && moreOpen && (
            <div className="df-more-menu">

              {/* IMAGES */}

              {moreItems.map(
                ([key, icon, label]) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() =>
                      go(key)
                    }
                  >
                    <span>
                      {icon}
                    </span>

                    <span>
                      {label}
                    </span>
                  </button>
                )
              )}

              {/* SETTINGS */}

              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);

                  window.location.href =
                    "/ai-prompt-generator";
                }}
              >
                <span>
                  ⚙
                </span>

                <span>
                  Settings
                </span>
              </button>

              {/* HELP */}

              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);

                  alert(
                    "DevForge Help"
                  );
                }}
              >
                <span>
                  ?
                </span>

                <span>
                  Help
                </span>
              </button>

            </div>
          )}

        </div>

        {/* ===================================
            LOCAL STATUS
            =================================== */}

        {open && (
          <div className="df-local-status">

            <span />

            <span>
              Local workspace
            </span>

          </div>
        )}

      </aside>

      {/* =====================================
          MAIN CONTENT
          ===================================== */}

      <main className="df-main">

        {/* MOBILE HEADER */}

        <header className="df-mobile-header">

          <button
            type="button"
            onClick={() =>
              setMobile(true)
            }
            title="Open sidebar"
          >
            ☰
          </button>

          <strong>
            DevForge
          </strong>

          <button
            type="button"
            onClick={() =>
              go("new-chat")
            }
            title="New chat"
          >
            ✎
          </button>

        </header>

        {children}

      </main>

    </div>
  );
}