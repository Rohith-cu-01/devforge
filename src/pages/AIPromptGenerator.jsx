import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./AIPromptGenerator.css";

function AIPromptGenerator() {
  // =========================================================
  // CURRENT CHAT
  // =========================================================

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("devforge-current-chat");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // =========================================================
  // CHAT HISTORY
  // =========================================================

  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("devforge-chat-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // =========================================================
  // PINNED CHATS
  // =========================================================

  const [pinnedChats, setPinnedChats] = useState(() => {
    try {
      const saved = localStorage.getItem("devforge-pinned-chats");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // =========================================================
  // CURRENT CHAT ID
  // =========================================================

  const [currentChatId, setCurrentChatId] = useState(() => {
    try {
      const saved = localStorage.getItem("devforge-current-chat-id");
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  // =========================================================
  // BASIC STATE
  // =========================================================

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [mode, setMode] = useState("deep");

  // =========================================================
  // EXTRA FEATURES
  // =========================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [feedback, setFeedback] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  // =========================================================
  // SHARE
  // =========================================================

  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // =========================================================
  // SETTINGS
  // =========================================================

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("devforge-ai-settings");

      return saved
        ? JSON.parse(saved)
        : {
            fastLength: 512,
            deepLength: 2048,
            temperature: 0.7,
          };
    } catch {
      return {
        fastLength: 512,
        deepLength: 2048,
        temperature: 0.7,
      };
    }
  });

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // =========================================================
  // SAVE CURRENT CHAT
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "devforge-current-chat",
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error("Unable to save current chat:", error);
    }
  }, [messages]);

  // =========================================================
  // SAVE CHAT HISTORY
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "devforge-chat-history",
        JSON.stringify(chatHistory)
      );
    } catch (error) {
      console.error("Unable to save chat history:", error);
    }
  }, [chatHistory]);

  // =========================================================
  // SAVE PINNED CHATS
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "devforge-pinned-chats",
        JSON.stringify(pinnedChats)
      );
    } catch (error) {
      console.error("Unable to save pinned chats:", error);
    }
  }, [pinnedChats]);

  // =========================================================
  // SAVE CURRENT CHAT ID
  // =========================================================

  useEffect(() => {
    try {
      if (currentChatId) {
        localStorage.setItem(
          "devforge-current-chat-id",
          String(currentChatId)
        );
      } else {
        localStorage.removeItem("devforge-current-chat-id");
      }
    } catch (error) {
      console.error("Unable to save current chat ID:", error);
    }
  }, [currentChatId]);

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "devforge-ai-settings",
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Unable to save settings:", error);
    }
  }, [settings]);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // =========================================================
  // CHAT TITLE
  // =========================================================

  const getChatTitle = (chatMessages) => {
    const firstUserMessage = chatMessages.find(
      (message) => message.role === "user"
    );

    if (!firstUserMessage) {
      return "New Chat";
    }

    return (
      firstUserMessage.content
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 45) || "New Chat"
    );
  };

  // =========================================================
  // SAVE CHAT TO HISTORY
  // =========================================================

  const saveChatToHistory = (chatMessages, chatId = null) => {
    if (!chatMessages.length) {
      return;
    }

    const firstUserMessage = chatMessages.find(
      (message) => message.role === "user"
    );

    if (!firstUserMessage) {
      return;
    }

    const id = chatId || currentChatId || Date.now();

    if (!currentChatId) {
      setCurrentChatId(id);
    }

    const title = getChatTitle(chatMessages);

    setChatHistory((current) => {
      const existing = current.find(
        (chat) => chat.id === id
      );

      const updatedChat = {
        id,
        title,
        messages: chatMessages,
        createdAt:
          existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const withoutCurrent = current.filter(
        (chat) => chat.id !== id
      );

      return [updatedChat, ...withoutCurrent].slice(0, 30);
    });

    return id;
  };

  // =========================================================
  // CREATE SHARE LINK
  // =========================================================

  const createShareLink = async () => {
  if (!messages.length) {
    alert("There is no conversation to share.");
    return;
  }

  if (loading) {
    return;
  }

  setShareLoading(true);

  try {
    // Send ONLY the currently opened chat
    const currentMessages = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const response = await fetch(
      "http://localhost:5000/api/share",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: getChatTitle(currentMessages),
          messages: currentMessages,
        }),
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to create share link."
      );
    }

    if (!data.id) {
      throw new Error(
        "Share ID was not returned by the server."
      );
    }

    // Generate link for ONLY this conversation
    const generatedUrl =
      `${window.location.origin}/share/${data.id}`;

    // Copy ONLY the link
    try {
      await navigator.clipboard.writeText(
        generatedUrl
      );

      setShareCopied(true);

      setTimeout(() => {
        setShareCopied(false);
      }, 2000);

    } catch (clipboardError) {
      console.error(
        "Clipboard error:",
        clipboardError
      );

      // Fallback if browser blocks clipboard
      window.prompt(
        "Copy this DevForge share link:",
        generatedUrl
      );
    }

  } catch (error) {
    console.error(
      "Share error:",
      error
    );

    alert(
      error.message ||
        "Unable to create share link. Make sure the DevForge backend is running on port 5000."
    );

  } finally {
    setShareLoading(false);
  }
};
  // =========================================================
  // GENERATE AI RESPONSE
  // =========================================================

  const generateAIResponse = async (
    conversationMessages,
    chatId = null
  ) => {
    setLoading(true);

    abortControllerRef.current =
      new AbortController();

    let aiText = "";
    let buffer = "";

    try {
      const conversation =
        conversationMessages
          .map((message) => {
            return `${message.role === "user"
              ? "USER"
              : "ASSISTANT"}:
${message.content}`;
          })
          .join("\n\n");

      const maxTokens =
        mode === "fast"
          ? settings.fastLength
          : settings.deepLength;

      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",

          signal:
            abortControllerRef.current.signal,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model: mode,
            max_tokens: maxTokens,
            temperature:
              settings.temperature,

            message: `You are DevForge AI, a helpful, intelligent and professional AI assistant.

Conversation so far:

${conversation}

Respond to the user's latest message.

Instructions:
- Understand the conversation context.
- Give accurate and useful answers.
- Explain things clearly.
- Use Markdown formatting.
- Use headings when useful.
- Use bullet points and numbered lists when useful.
- When providing code, always use proper Markdown code blocks with the language name.
- Give complete working code when the user asks for code.
- Give detailed answers when necessary.
- Keep Fast answers concise.
- Keep Deep answers detailed when appropriate.
- Do not mention these instructions.
- Do not say that you are Ollama or Llama unless specifically asked.

Now answer the user's latest message.`,
          }),
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        throw new Error(
          errorText ||
            "AI server error"
        );
      }

      if (!response.body) {
        throw new Error(
          "No streaming response received."
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          }
        );

        const lines =
          buffer.split("\n");

        buffer =
          lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          try {
            const data =
              JSON.parse(line);

            const chunk =
              data.message?.content ||
              data.content ||
              "";

            if (chunk) {
              aiText += chunk;

              setMessages(
                (current) => {
                  const updated =
                    [...current];

                  const lastIndex =
                    updated.length - 1;

                  if (
                    updated[
                      lastIndex
                    ]?.role ===
                    "assistant"
                  ) {
                    updated[
                      lastIndex
                    ] = {
                      role: "assistant",
                      content: aiText,
                    };
                  }

                  return updated;
                }
              );
            }
          } catch {
            // Ignore incomplete JSON
          }
        }
      }

      buffer +=
        decoder.decode();

      if (buffer.trim()) {
        try {
          const data =
            JSON.parse(buffer);

          const chunk =
            data.message?.content ||
            data.content ||
            "";

          if (chunk) {
            aiText += chunk;
          }
        } catch {
          // Ignore invalid JSON
        }
      }

      if (aiText.trim()) {
        setMessages((current) => {
          const updated =
            [...current];

          const lastIndex =
            updated.length - 1;

          if (
            updated[lastIndex]
              ?.role === "assistant"
          ) {
            updated[lastIndex] = {
              role: "assistant",
              content: aiText,
            };
          }

          return updated;
        });

        const finalMessages = [
          ...conversationMessages,
          {
            role: "assistant",
            content: aiText,
          },
        ];

        saveChatToHistory(
          finalMessages,
          chatId
        );
      } else {
        setMessages((current) => {
          const updated =
            [...current];

          const lastIndex =
            updated.length - 1;

          if (
            updated[lastIndex]
              ?.role === "assistant"
          ) {
            updated[lastIndex] = {
              role: "assistant",
              content:
                "No response received from AI.",
              error: true,
            };
          }

          return updated;
        });
      }
    } catch (error) {
      if (
        error.name === "AbortError"
      ) {
        console.log(
          "AI generation stopped."
        );
      } else {
        console.error(
          "DevForge AI Error:",
          error
        );

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't connect to the AI server. Make sure the DevForge backend and Ollama are running.",
            error: true,
          },
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current =
        null;
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async () => {
    if (loading) {
      abortControllerRef.current?.abort();
      return;
    }

    const text =
      input.trim();

    if (!text) {
      return;
    }

    const userMessage = {
      role: "user",
      content: text,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    const chatId =
      currentChatId ||
      Date.now();

    if (!currentChatId) {
      setCurrentChatId(chatId);
    }

    setMessages(
      updatedMessages
    );

    setInput("");

    await generateAIResponse(
      updatedMessages,
      chatId
    );
  };

  // =========================================================
  // EDIT MESSAGE
  // =========================================================

  const startEdit = (index) => {
    if (loading) {
      return;
    }

    if (
      messages[index]?.role !==
      "user"
    ) {
      return;
    }

    setEditingIndex(index);

    setEditText(
      messages[index].content
    );
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  // =========================================================
  // EDIT + REGENERATE
  // =========================================================

  const regenerateFromEdit =
    async () => {
      const text =
        editText.trim();

      if (
        !text ||
        loading ||
        editingIndex === null
      ) {
        return;
      }

      const previousMessages =
        messages.slice(
          0,
          editingIndex
        );

      const userMessage = {
        role: "user",
        content: text,
      };

      const newMessages = [
        ...previousMessages,
        userMessage,
      ];

      setEditingIndex(null);
      setEditText("");
      setInput("");

      setMessages(
        newMessages
      );

      const chatId =
        currentChatId ||
        Date.now();

      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      await generateAIResponse(
        newMessages,
        chatId
      );
    };

  // =========================================================
  // REGENERATE AI RESPONSE
  // =========================================================

  const regenerateResponse =
    async (assistantIndex) => {
      if (loading) {
        return;
      }

      if (
        messages[assistantIndex]
          ?.role !== "assistant"
      ) {
        return;
      }

      const previousUser =
        messages[
          assistantIndex - 1
        ];

      if (
        !previousUser ||
        previousUser.role !==
          "user"
      ) {
        return;
      }

      const baseMessages =
        messages.slice(
          0,
          assistantIndex
        );

      setMessages(
        baseMessages
      );

      const chatId =
        currentChatId ||
        Date.now();

      if (!currentChatId) {
        setCurrentChatId(chatId);
      }

      await generateAIResponse(
        baseMessages,
        chatId
      );
    };

  // =========================================================
  // FEEDBACK
  // =========================================================

  const setMessageFeedback = (
    index,
    value
  ) => {
    setFeedback(
      (current) => ({
        ...current,
        [index]:
          current[index] === value
            ? null
            : value,
      })
    );
  };

  // =========================================================
  // DELETE MESSAGE
  // =========================================================

  const deleteMessage = (
    index
  ) => {
    if (loading) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this message?"
      );

    if (!confirmed) {
      return;
    }

    setMessages(
      (current) =>
        current.filter(
          (_, messageIndex) =>
            messageIndex !==
            index
        )
    );
  };

  // =========================================================
  // PIN / UNPIN CHAT
  // =========================================================

  const togglePinChat = (
    chatId
  ) => {
    setPinnedChats(
      (current) => {
        const alreadyPinned =
          current.includes(
            chatId
          );

        if (alreadyPinned) {
          return current.filter(
            (id) =>
              id !== chatId
          );
        }

        if (current.length >= 5) {
          alert(
            "You can pin maximum 5 chats."
          );

          return current;
        }

        return [
          chatId,
          ...current,
        ];
      }
    );
  };

  // =========================================================
  // SEARCH HISTORY
  // =========================================================

  const filteredHistory =
    [...chatHistory]
      .filter((chat) =>
        chat.title
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
      )
      .sort((a, b) => {
        const aPinned =
          pinnedChats.includes(
            a.id
          );

        const bPinned =
          pinnedChats.includes(
            b.id
          );

        if (
          aPinned &&
          !bPinned
        ) {
          return -1;
        }

        if (
          !aPinned &&
          bPinned
        ) {
          return 1;
        }

        return (
          new Date(
            b.updatedAt ||
              b.createdAt
          ) -
          new Date(
            a.updatedAt ||
              a.createdAt
          )
        );
      });

  const pinnedHistory =
    filteredHistory.filter(
      (chat) =>
        pinnedChats.includes(
          chat.id
        )
    );

  const normalHistory =
    filteredHistory.filter(
      (chat) =>
        !pinnedChats.includes(
          chat.id
        )
    );

  // =========================================================
  // NEW CHAT
  // =========================================================

  const newChat = () => {
    if (loading) {
      abortControllerRef.current?.abort();
    }

    if (messages.length > 0) {
      saveChatToHistory(
        messages,
        currentChatId
      );
    }

    setMessages([]);
    setInput("");
    setCopied(null);
    setShareCopied(false);
    setFeedback({});
    setEditingIndex(null);
    setEditText("");
    setLoading(false);
    setCurrentChatId(null);

    localStorage.removeItem(
      "devforge-current-chat"
    );

    localStorage.removeItem(
      "devforge-current-chat-id"
    );
  };

  // =========================================================
  // LOAD CHAT
  // =========================================================

  const loadChat = (
    chat
  ) => {
    if (loading) {
      abortControllerRef.current?.abort();
    }

    setMessages(
      chat.messages || []
    );

    setCurrentChatId(
      chat.id
    );

    setInput("");
    setCopied(null);
    setShareCopied(false);
    setFeedback({});
    setEditingIndex(null);
    setEditText("");
    setLoading(false);

    localStorage.setItem(
      "devforge-current-chat",
      JSON.stringify(
        chat.messages || []
      )
    );
  };

  // =========================================================
  // DELETE CHAT
  // =========================================================

  const deleteChat = (
    chatId
  ) => {
    const confirmed =
      window.confirm(
        "Delete this chat?"
      );

    if (!confirmed) {
      return;
    }

    setChatHistory(
      (current) =>
        current.filter(
          (chat) =>
            chat.id !== chatId
        )
    );

    setPinnedChats(
      (current) =>
        current.filter(
          (id) =>
            id !== chatId
        )
    );

    if (
      currentChatId ===
      chatId
    ) {
      setMessages([]);
      setCurrentChatId(null);

      localStorage.removeItem(
        "devforge-current-chat"
      );

      localStorage.removeItem(
        "devforge-current-chat-id"
      );
    }
  };

  // =========================================================
  // CLEAR HISTORY
  // =========================================================

  const clearHistory = () => {
    const confirmed =
      window.confirm(
        "Delete all chat history?"
      );

    if (!confirmed) {
      return;
    }

    setChatHistory([]);
    setPinnedChats([]);

    localStorage.removeItem(
      "devforge-chat-history"
    );

    localStorage.removeItem(
      "devforge-pinned-chats"
    );
  };

  // =========================================================
  // COPY MESSAGE
  // =========================================================

  const copyMessage = async (
    content,
    index
  ) => {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopied(index);

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch {
      setCopied(null);
    }
  };

  // =========================================================
  // COPY CODE
  // =========================================================

  const copyCode = async (
    code,
    codeIndex
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(
        `code-${codeIndex}`
      );

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch {
      setCopied(null);
    }
  };

  // =========================================================
  // EXPORT CHAT
  // =========================================================

  const exportChat = () => {
    if (!messages.length) {
      alert(
        "There is no conversation to export."
      );

      return;
    }

    const text =
      messages
        .map((message) => {
          return `${message.role === "user"
            ? "You"
            : "DevForge AI"}:

${message.content}

----------------------------------------

`;
        })
        .join("");

    const blob =
      new Blob(
        [
          `DEVFORGE AI CONVERSATION

Exported: ${new Date().toLocaleString()}

========================================

${text}`,
        ],
        {
          type:
            "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `DevForge-Chat-${Date.now()}.txt`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // GENERATE PDF
  // =========================================================

  const generatePDF = (
    content
  ) => {
    try {
      const pdf =
        new jsPDF();

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 15;

      const usableWidth =
        pageWidth -
        margin * 2;

      let y = 20;

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(18);

      pdf.text(
        "DevForge AI",
        margin,
        y
      );

      y += 10;

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(10);

      pdf.text(
        `Mode: ${
          mode === "fast"
            ? "Fast"
            : "Deep"
        }`,
        margin,
        y
      );

      y += 6;

      pdf.text(
        `Generated: ${new Date().toLocaleString()}`,
        margin,
        y
      );

      y += 10;

      pdf.line(
        margin,
        y,
        pageWidth -
          margin,
        y
      );

      y += 8;

      const cleanText =
        content
          .replace(
            /```[a-zA-Z0-9_-]*\n?/g,
            ""
          )
          .replace(
            /```/g,
            ""
          )
          .replace(
            /^#{1,6}\s/gm,
            ""
          )
          .replace(
            /\*\*(.*?)\*\*/g,
            "$1"
          )
          .replace(
            /\*(.*?)\*/g,
            "$1"
          )
          .replace(
            /`(.*?)`/g,
            "$1"
          )
          .replace(
            /\[(.*?)\]\(.*?\)/g,
            "$1"
          )
          .replace(
            /^\s*[-*]\s+/gm,
            "• "
          )
          .trim();

      const lines =
        cleanText.split("\n");

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(11);

      for (
        const line of lines
      ) {
        const trimmed =
          line.trim();

        if (!trimmed) {
          y += 5;
          continue;
        }

        const wrapped =
          pdf.splitTextToSize(
            trimmed,
            usableWidth
          );

        for (
          const wrappedLine of
          wrapped
        ) {
          if (
            y >
            pageHeight - 20
          ) {
            pdf.addPage();
            y = 20;
          }

          pdf.text(
            wrappedLine,
            margin,
            y
          );

          y += 6;
        }

        y += 1;
      }

      const totalPages =
        pdf.internal.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page);

        pdf.setFontSize(8);

        pdf.text(
          `DevForge AI • Page ${page} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          {
            align: "center",
          }
        );
      }

      pdf.save(
        `DevForge-AI-${Date.now()}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF Generation Error:",
        error
      );

      alert(
        "Unable to generate PDF."
      );
    }
  };

  // =========================================================
  // KEYBOARD
  // =========================================================

  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  // =========================================================
  // MARKDOWN
  // =========================================================

  const renderMarkdown = (
    content,
    index
  ) => {
    return (
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
            const code =
              String(children).replace(
                /\n$/,
                ""
              );

            const match =
              /language-(\w+)/.exec(
                className || ""
              );

            const codeIndex =
              `${index}-${code.length}`;

            if (inline) {
              return (
                <code
                  className="inline-code"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="code-block">
                <div className="code-header">
                  <span>
                    {match
                      ? match[1]
                      : "code"}
                  </span>

                  <button
                    type="button"
                    className="code-copy-button"
                    onClick={() =>
                      copyCode(
                        code,
                        codeIndex
                      )
                    }
                  >
                    {copied ===
                    `code-${codeIndex}`
                      ? "Copied ✓"
                      : "Copy"}
                  </button>
                </div>

                <pre>
                  <code {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          h1({ children }) {
            return (
              <h2>
                {children}
              </h2>
            );
          },

          h2({ children }) {
            return (
              <h3>
                {children}
              </h3>
            );
          },

          h3({ children }) {
            return (
              <h4>
                {children}
              </h4>
            );
          },

          table({ children }) {
            return (
              <div className="markdown-table">
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
    );
  };

  // =========================================================
  // HISTORY ITEM
  // =========================================================

  const renderHistoryItem = (
    chat
  ) => {
    const isPinned =
      pinnedChats.includes(
        chat.id
      );

    return (
      <div
        className={`chat-history-item ${
          isPinned
            ? "pinned-chat-item"
            : ""
        } ${
          currentChatId ===
          chat.id
            ? "active-chat-history"
            : ""
        }`}
        key={chat.id}
      >
        <button
          type="button"
          className="chat-history-title"
          onClick={() =>
            loadChat(chat)
          }
        >
          {isPinned && (
            <span className="pin-icon">
              📌
            </span>
          )}

          <span>
            {chat.title}
          </span>
        </button>

        <button
          type="button"
          className={`chat-pin-button ${
            isPinned
              ? "pinned"
              : ""
          }`}
          onClick={() =>
            togglePinChat(
              chat.id
            )
          }
          title={
            isPinned
              ? "Unpin chat"
              : "Pin chat"
          }
        >
          {isPinned
            ? "📌"
            : "☆"}
        </button>

        <button
          type="button"
          className="chat-history-delete"
          onClick={() =>
            deleteChat(
              chat.id
            )
          }
          title="Delete chat"
        >
          ×
        </button>
      </div>
    );
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="tool-page ai-chat-page">

      {/* SHARE COPIED MESSAGE */}

      {shareCopied && (
        <div
          className="share-copied-toast"
          role="status"
        >
          Link copied ✓
        </div>
      )}

      {/* HEADER */}

      <div className="tool-page-header">

        <div className="tool-header-left">

          <button
            type="button"
            className="back-button"
            onClick={() => {
              window.location.href =
                "/";
            }}
          >
            ← DevForge
          </button>

          <span className="tool-label">
            AI ASSISTANT
          </span>

          <button
            type="button"
            className="settings-button"
            onClick={() =>
              setShowSettings(true)
            }
          >
            ⚙ Settings
          </button>

          <button
            type="button"
            className="export-button"
            onClick={exportChat}
            disabled={
              !messages.length
            }
          >
            📤 Export
          </button>

        </div>

        {/* RIGHT HEADER */}

        <div className="tool-header-right">

          {/* SHARE */}

          <button
            type="button"
            className="share-button"
            onClick={
              createShareLink
            }
            disabled={
              !messages.length ||
              shareLoading ||
              loading
            }
            title="Copy share link"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V3" />
              <path d="M7 8l5-5 5 5" />
              <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
            </svg>

            <span>
              {shareLoading
                ? "Creating..."
                : shareCopied
                ? "Copied"
                : "Share"}
            </span>
          </button>

          {/* MORE */}

          <button
            type="button"
            className="more-button"
            title="More"
          >
            •••
          </button>

          {/* NEW CHAT */}

          <button
            type="button"
            className="new-chat-button"
            onClick={newChat}
          >
            + New Chat
          </button>

        </div>
      </div>

      {/* HERO */}

      {messages.length === 0 && (
        <section className="tool-hero ai-chat-hero">

          <span className="eyebrow">
            DEVFORGE AI
          </span>

          <h1>
            How can I help?
          </h1>

          <p>
            Ask questions, write code,
            solve problems, learn concepts,
            or create anything you need.
          </p>

        </section>
      )}

      {/* CHAT */}

      <section className="ai-chat-container">

        {/* MODEL SELECTOR */}

        <div className="ai-model-selector">

          <button
            type="button"
            className={
              mode === "fast"
                ? "active-model"
                : ""
            }
            onClick={() =>
              setMode("fast")
            }
            disabled={loading}
          >
            ⚡ Fast
          </button>

          <button
            type="button"
            className={
              mode === "deep"
                ? "active-model"
                : ""
            }
            onClick={() =>
              setMode("deep")
            }
            disabled={loading}
          >
            🧠 Deep
          </button>

        </div>

        {/* CHAT HISTORY */}

        {chatHistory.length > 0 && (
          <div className="chat-history">

            <div className="chat-history-header">

              <strong>
                💬 Chat History
              </strong>

              <span className="pinned-count">
                📌{" "}
                {pinnedChats.length}
                /5
              </span>

              <button
                type="button"
                onClick={
                  clearHistory
                }
              >
                Clear All
              </button>

            </div>

            <input
              className="history-search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="🔎 Search chats..."
            />

            {pinnedHistory.length >
              0 && (
              <>
                <div className="history-section-title">
                  📌 Pinned
                </div>

                <div className="chat-history-list">
                  {pinnedHistory.map(
                    renderHistoryItem
                  )}
                </div>
              </>
            )}

            {normalHistory.length >
              0 && (
              <>
                <div className="history-section-title">
                  🕘 Recent
                </div>

                <div className="chat-history-list">
                  {normalHistory.map(
                    renderHistoryItem
                  )}
                </div>
              </>
            )}

            {filteredHistory.length ===
              0 && (
              <div className="no-history">
                No chats found.
              </div>
            )}

          </div>
        )}

        {/* SUGGESTIONS */}

        {messages.length === 0 && (
          <div className="ai-suggestions">

            <button
              type="button"
              onClick={() =>
                setInput(
                  "Create a Python student management system with complete code and explanation."
                )
              }
            >
              💻 Create Python code
            </button>

            <button
              type="button"
              onClick={() =>
                setInput(
                  "Explain JavaScript promises in simple language with examples."
                )
              }
            >
              📚 Explain a concept
            </button>

            <button
              type="button"
              onClick={() =>
                setInput(
                  "Create a professional marketing plan for a new mobile app."
                )
              }
            >
              📈 Create a marketing plan
            </button>

            <button
              type="button"
              onClick={() =>
                setInput(
                  "Help me build a modern portfolio website."
                )
              }
            >
              🌐 Build a website
            </button>

          </div>
        )}

        {/* MESSAGES */}

        <div className="ai-messages">

          {messages.map(
            (message, index) => (

              <div
                className={`ai-message ${
                  message.role ===
                  "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
                key={index}
              >

                <div className="message-avatar">
                  {message.role ===
                  "user"
                    ? "You"
                    : "AI"}
                </div>

                <div className="message-content">

                  <div className="message-name">
                    {message.role ===
                    "user"
                      ? "You"
                      : "DevForge AI"}
                  </div>

                  {/* EDIT */}

                  {editingIndex ===
                  index ? (

                    <div className="edit-message-box">

                      <textarea
                        value={
                          editText
                        }
                        onChange={(
                          event
                        ) =>
                          setEditText(
                            event.target.value
                          )
                        }
                        autoFocus
                      />

                      <div className="edit-actions">

                        <button
                          type="button"
                          onClick={
                            regenerateFromEdit
                          }
                        >
                          Save &
                          Regenerate
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelEdit
                          }
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div className="message-text">

                      {message.role ===
                      "assistant"
                        ? renderMarkdown(
                            message.content,
                            index
                          )
                        : message.content}

                    </div>

                  )}

                  {/* USER ACTIONS */}

                  {message.role ===
                    "user" &&
                    editingIndex !==
                      index && (

                    <div className="message-actions">

                      <button
                        type="button"
                        className="message-copy"
                        onClick={() =>
                          startEdit(
                            index
                          )
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="message-copy"
                        onClick={() =>
                          copyMessage(
                            message.content,
                            index
                          )
                        }
                      >
                        {copied ===
                        index
                          ? "Copied ✓"
                          : "Copy"}
                      </button>

                      <button
                        type="button"
                        className="message-copy danger-action"
                        onClick={() =>
                          deleteMessage(
                            index
                          )
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  )}

                  {/* AI ACTIONS */}

                  {message.role ===
                    "assistant" &&
                    !message.error &&
                    message.content && (

                    <div className="message-actions">

                      <button
                        type="button"
                        className={`message-copy feedback-button ${
                          feedback[
                            index
                          ] === "up"
                            ? "selected-feedback"
                            : ""
                        }`}
                        onClick={() =>
                          setMessageFeedback(
                            index,
                            "up"
                          )
                        }
                        title="Good response"
                      >
                        👍
                      </button>

                      <button
                        type="button"
                        className={`message-copy feedback-button ${
                          feedback[
                            index
                          ] === "down"
                            ? "selected-feedback"
                            : ""
                        }`}
                        onClick={() =>
                          setMessageFeedback(
                            index,
                            "down"
                          )
                        }
                        title="Bad response"
                      >
                        👎
                      </button>

                      <button
                        type="button"
                        className="message-copy"
                        onClick={() =>
                          copyMessage(
                            message.content,
                            index
                          )
                        }
                      >
                        {copied ===
                        index
                          ? "Copied ✓"
                          : "Copy"}
                      </button>

                      <button
                        type="button"
                        className="message-copy"
                        onClick={() =>
                          generatePDF(
                            message.content
                          )
                        }
                      >
                        📄 PDF
                      </button>

                      <button
                        type="button"
                        className="message-copy regenerate-button"
                        onClick={() =>
                          regenerateResponse(
                            index
                          )
                        }
                        disabled={
                          loading
                        }
                      >
                        🔄 Regenerate
                      </button>

                      <button
                        type="button"
                        className="message-copy danger-action"
                        onClick={() =>
                          deleteMessage(
                            index
                          )
                        }
                      >
                        🗑
                      </button>

                    </div>

                  )}

                </div>

              </div>

            )
          )}

          {/* TYPING */}

          {loading && (
            <div className="ai-message assistant-message">

              <div className="message-avatar">
                AI
              </div>

              <div className="message-content">

                <div className="message-name">
                  DevForge AI
                </div>

                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>

              </div>

            </div>
          )}

          <div
            ref={
              messagesEndRef
            }
          />

        </div>

        {/* INPUT */}

        <div className="ai-input-container">

          <textarea
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder={
              mode === "fast"
                ? "Message DevForge AI... ⚡ Fast"
                : "Message DevForge AI... 🧠 Deep"
            }
            rows="1"
            disabled={loading}
          />

          <button
            type="button"
            className={`ai-send-button ${
              loading
                ? "stop-generation-button"
                : ""
            }`}
            onClick={sendMessage}
            disabled={
              !input.trim() &&
              !loading
            }
            title={
              loading
                ? "Stop generating"
                : "Send message"
            }
          >
            {loading
              ? "■"
              : "↑"}
          </button>

        </div>

        <p className="ai-input-hint">
          {loading
            ? "AI is generating • Click ■ to stop"
            : "Enter to send • Shift + Enter for new line"}
        </p>

      </section>

      {/* SETTINGS */}

      {showSettings && (
        <div className="settings-overlay">

          <div className="settings-modal">

            <div className="settings-header">

              <h2>
                ⚙ AI Settings
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowSettings(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <div className="settings-body">

              <label>
                ⚡ Fast response length

                <span>
                  {
                    settings.fastLength
                  }
                </span>
              </label>

              <input
                type="range"
                min="128"
                max="1024"
                step="128"
                value={
                  settings.fastLength
                }
                onChange={(
                  event
                ) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      fastLength:
                        Number(
                          event.target.value
                        ),
                    })
                  )
                }
              />

              <label>
                🧠 Deep response length

                <span>
                  {
                    settings.deepLength
                  }
                </span>
              </label>

              <input
                type="range"
                min="512"
                max="4096"
                step="256"
                value={
                  settings.deepLength
                }
                onChange={(
                  event
                ) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      deepLength:
                        Number(
                          event.target.value
                        ),
                    })
                  )
                }
              />

              <label>
                🎯 Creativity

                <span>
                  {
                    settings.temperature
                  }
                </span>
              </label>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={
                  settings.temperature
                }
                onChange={(
                  event
                ) =>
                  setSettings(
                    (current) => ({
                      ...current,
                      temperature:
                        Number(
                          event.target.value
                        ),
                    })
                  )
                }
              />

              <div className="settings-info">

                Current mode:

                <strong>
                  {mode === "fast"
                    ? " ⚡ Fast"
                    : " 🧠 Deep"}
                </strong>

              </div>

            </div>

            <button
              type="button"
              className="settings-done"
              onClick={() =>
                setShowSettings(
                  false
                )
              }
            >
              Done
            </button>

          </div>

        </div>
      )}

      {/* FOOTER */}

      <section className="browser-note">

        <strong>
          ✓ Powered by DevForge AI
        </strong>

        <p>
          Your messages are processed
          locally through Ollama.
        </p>

      </section>

    </div>
  );
}

export default AIPromptGenerator;