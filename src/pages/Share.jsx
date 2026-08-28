import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "../styles/share.css";

function Share({ shareId }) {
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // =========================================================
  // GET SHARE ID
  // =========================================================

  useEffect(() => {
    const loadSharedChat = async () => {
      try {
        setLoading(true);
        setError("");

        // Use shareId passed from App.jsx.
        // If it was not passed, get it from the URL.
        let id = shareId;

        if (!id) {
          const pathParts =
            window.location.pathname.split("/");

          const lastPart =
            pathParts[pathParts.length - 1];

          id = lastPart;
        }

        id = decodeURIComponent(id || "").trim();

        if (!id || id === "share") {
          throw new Error(
            "Invalid share link."
          );
        }

        // Only allow UUID-style share IDs.
        if (
          !/^[a-zA-Z0-9-]+$/.test(id)
        ) {
          throw new Error(
            "Invalid share ID."
          );
        }

        console.log(
          "Loading shared conversation:",
          id
        );

        // =====================================================
        // LOAD ONLY THIS SHARED CHAT
        // =====================================================

        const response = await fetch(
          `http://localhost:5000/api/share/${id}`
        );

        let data = null;

        try {
          data = await response.json();
        } catch {
          throw new Error(
            "Invalid response from DevForge server."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Shared conversation not found."
          );
        }

        if (
          !data ||
          !Array.isArray(data.messages)
        ) {
          throw new Error(
            "Invalid shared conversation data."
          );
        }

        // Store ONLY the conversation returned
        // for this share ID.
        setChat(data);
      } catch (err) {
        console.error(
          "Shared chat error:",
          err
        );

        setError(
          err.message ||
            "Unable to load this conversation."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSharedChat();
  }, [shareId]);

  // =========================================================
  // COPY SHARE LINK
  // =========================================================

  const copyShareLink = async () => {
    const shareUrl =
      window.location.href;

    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      window.prompt(
        "Copy this link:",
        shareUrl
      );
    }
  };

  // =========================================================
  // OPEN DEVFORGE
  // =========================================================

  const openDevForge = () => {
    window.location.href =
      "/ai-prompt-generator";
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="share-page">

        <div className="share-loading">

          <div className="share-spinner" />

          <span>
            Loading conversation...
          </span>

        </div>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !chat) {
    return (
      <div className="share-page">

        <div className="share-error-page">

          <div className="share-brand">

            <span className="brand-mark">
              ✦
            </span>

            <span>
              DevForge
            </span>

          </div>

          <h1>
            Conversation unavailable
          </h1>

          <p>
            {error ||
              "This shared conversation could not be found."}
          </p>

          <button
            type="button"
            onClick={openDevForge}
            className="open-devforge-button"
          >
            Open DevForge
            <span>→</span>
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // ONLY MESSAGES FROM THIS SHARE
  // =========================================================

  const messages =
    Array.isArray(chat.messages)
      ? chat.messages
      : [];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="share-page">

      {/* =====================================================
          TOP HEADER
          ===================================================== */}

      <header className="shared-topbar">

        <div className="shared-topbar-inner">

          <button
            type="button"
            className="shared-brand"
            onClick={openDevForge}
          >

            <span className="brand-mark">
              ✦
            </span>

            <span>
              DevForge
            </span>

          </button>

          <div className="shared-topbar-right">

            <button
              type="button"
              className="top-share-button"
              onClick={copyShareLink}
            >

              <span className="share-icon">
                ↗
              </span>

              {copied
                ? "Copied"
                : "Share"}

            </button>

            <button
              type="button"
              className="top-menu-button"
              onClick={() =>
                setShowMenu(
                  (current) => !current
                )
              }
              aria-label="More options"
            >
              •••
            </button>

            {showMenu && (
              <div className="share-menu">

                <button
                  type="button"
                  onClick={() => {
                    copyShareLink();
                    setShowMenu(false);
                  }}
                >
                  {copied
                    ? "✓ Copied"
                    : "Copy link"}
                </button>

                <button
                  type="button"
                  onClick={openDevForge}
                >
                  Open DevForge
                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* =====================================================
          CONVERSATION
          ===================================================== */}

      <main className="shared-conversation">

        <div className="shared-conversation-header">

          <div className="shared-eyebrow">

            <span />

            DEVFORGE

          </div>

          <h1>
            {chat.title ||
              "Shared conversation"}
          </h1>

          <p>
            Anyone with this link can view
            this conversation.
          </p>

        </div>

        {/* ===================================================
            MESSAGES
            =================================================== */}

        <div className="shared-messages">

          {messages.map(
            (message, index) => {

              const isUser =
                message.role === "user";

              const content =
                message.content || "";

              return (
                <div
                  className={`shared-message-row ${
                    isUser
                      ? "user-row"
                      : "assistant-row"
                  }`}
                  key={
                    message.id ||
                    `${message.role}-${index}`
                  }
                >

                  <div className="shared-message">

                    {/* MESSAGE HEADER */}

                    <div className="shared-message-header">

                      <div
                        className={`shared-avatar ${
                          isUser
                            ? "user-avatar"
                            : "ai-avatar"
                        }`}
                      >
                        {isUser
                          ? "You"
                          : "DF"}
                      </div>

                      <span className="shared-message-name">

                        {isUser
                          ? "You"
                          : "DevForge AI"}

                      </span>

                    </div>

                    {/* MESSAGE CONTENT */}

                    <div className="shared-message-content">

                      {isUser ? (

                        <div className="user-content">
                          {content}
                        </div>

                      ) : (

                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                          ]}
                          components={{

                            code({
                              inline,
                              className,
                              children,
                              ...props
                            }) {

                              const codeText =
                                String(
                                  children
                                ).replace(
                                  /\n$/,
                                  ""
                                );

                              if (inline) {
                                return (
                                  <code
                                    className="shared-inline-code"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }

                              const language =
                                className
                                  ?.replace(
                                    "language-",
                                    ""
                                  ) ||
                                "code";

                              const copyCode =
                                async () => {
                                  try {
                                    await navigator.clipboard.writeText(
                                      codeText
                                    );
                                  } catch {
                                    window.prompt(
                                      "Copy code:",
                                      codeText
                                    );
                                  }
                                };

                              return (
                                <div className="shared-code-block">

                                  <div className="shared-code-header">

                                    <span>
                                      {language}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={
                                        copyCode
                                      }
                                    >
                                      Copy
                                    </button>

                                  </div>

                                  <pre>
                                    <code
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  </pre>

                                </div>
                              );
                            },

                            a({
                              children,
                              href,
                              ...props
                            }) {

                              return (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              );
                            },

                            table({
                              children,
                            }) {

                              return (
                                <div className="shared-table-wrapper">

                                  <table>
                                    {children}
                                  </table>

                                </div>
                              );
                            },

                          }}
                        >
                          {content}
                        </ReactMarkdown>

                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* ===================================================
            BOTTOM SHARE SECTION
            =================================================== */}

        <div className="shared-bottom">

          <div className="shared-lock">

            <span>
              🔒
            </span>

            <div>

              <strong>
                Shared conversation
              </strong>

              <p>
                This conversation is shared
                from DevForge AI.
              </p>

            </div>

          </div>

          <button
            type="button"
            className="bottom-copy-button"
            onClick={copyShareLink}
          >
            {copied
              ? "✓ Link copied"
              : "Copy link"}
          </button>

        </div>

      </main>

    </div>
  );
}

export default Share;