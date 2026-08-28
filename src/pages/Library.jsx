import { useEffect, useMemo, useState } from "react";

import {
  getFiles,
  saveFile,
  deleteFile,
  renameFile,
  clearLibrary,
  downloadFile,
  formatFileSize,
  getFileCategory,
} from "../lib/libraryDB";

import "../styles/Library.css";

function Library() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);

  const [menuId, setMenuId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameText, setRenameText] = useState("");

  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("devforge-library-pinned")
      ) || [];
    } catch {
      return [];
    }
  });

  const [previewFile, setPreviewFile] = useState(null);

  /* =========================================
     SAVE PINNED FILES
  ========================================= */

  useEffect(() => {
    localStorage.setItem(
      "devforge-library-pinned",
      JSON.stringify(pinnedIds)
    );
  }, [pinnedIds]);

  /* =========================================
     LOAD FILES
  ========================================= */

  const loadFiles = async () => {
    try {
      setLoading(true);

      const result = await getFiles();

      setFiles(result || []);
    } catch (error) {
      console.error(
        "Library loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  /* =========================================
     UPLOAD
  ========================================= */

  const handleFiles = async (fileList) => {
    if (!fileList?.length) return;

    try {
      for (const file of Array.from(fileList)) {
        await saveFile(file);
      }

      await loadFiles();
    } catch (error) {
      console.error(
        "Library upload error:",
        error
      );

      alert(
        "Unable to save the file."
      );
    }
  };

  const handleUpload = (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  /* =========================================
     DRAG AND DROP
  ========================================= */

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    handleFiles(
      event.dataTransfer.files
    );
  };

  /* =========================================
     SEARCH + CATEGORY
  ========================================= */

  const filteredFiles = useMemo(() => {
    const term =
      search
        .trim()
        .toLowerCase();

    const result = files.filter((file) => {
      const matchesSearch =
        !term ||
        file.name
          .toLowerCase()
          .includes(term) ||
        (file.type || "")
          .toLowerCase()
          .includes(term);

      const fileCategory =
        getFileCategory(file);

      const matchesCategory =
        category === "All" ||
        fileCategory === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

    return result.sort((a, b) => {
      const aPinned =
        pinnedIds.includes(a.id);

      const bPinned =
        pinnedIds.includes(b.id);

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      return (
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
      );
    });
  }, [
    files,
    search,
    category,
    pinnedIds,
  ]);

  /* =========================================
     PIN / UNPIN
  ========================================= */

  const togglePin = (id) => {
    setPinnedIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [
        id,
        ...current,
      ];
    });

    setMenuId(null);
  };

  /* =========================================
     RENAME
  ========================================= */

  const startRename = (file) => {
    setRenameId(file.id);
    setRenameText(file.name);
    setMenuId(null);
  };

  const cancelRename = () => {
    setRenameId(null);
    setRenameText("");
  };

  const finishRename = async () => {
    if (renameId === null) {
      return;
    }

    const newName =
      renameText.trim();

    if (!newName) {
      cancelRename();
      return;
    }

    try {
      await renameFile(
        renameId,
        newName
      );

      await loadFiles();
    } catch (error) {
      console.error(
        "Rename error:",
        error
      );

      alert(
        "Unable to rename file."
      );
    }

    cancelRename();
  };

  /* =========================================
     DELETE
  ========================================= */

  const handleDelete = async (id) => {
    setMenuId(null);

    const confirmed =
      window.confirm(
        "Delete this file from Library?"
      );

    if (!confirmed) return;

    try {
      await deleteFile(id);

      setPinnedIds((current) =>
        current.filter(
          (item) => item !== id
        )
      );

      if (
        previewFile?.id === id
      ) {
        setPreviewFile(null);
      }

      await loadFiles();
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Unable to delete file."
      );
    }
  };

  /* =========================================
     CLEAR LIBRARY
  ========================================= */

  const handleClear = async () => {
    if (!files.length) return;

    const confirmed =
      window.confirm(
        "Delete all Library files?"
      );

    if (!confirmed) return;

    try {
      await clearLibrary();

      setFiles([]);
      setPinnedIds([]);
      setPreviewFile(null);
    } catch (error) {
      console.error(
        "Clear Library error:",
        error
      );
    }
  };

  /* =========================================
     FILE ICON
  ========================================= */

  const getFileIcon = (file) => {
    const type =
      file.type || "";

    if (
      type.startsWith("image/")
    ) {
      return "▧";
    }

    if (
      type.includes("pdf")
    ) {
      return "PDF";
    }

    if (
      type.includes("javascript") ||
      type.includes("json") ||
      type.includes("css") ||
      type.includes("html") ||
      type.includes("typescript")
    ) {
      return "</>";
    }

    if (
      type.startsWith("text/")
    ) {
      return "TXT";
    }

    return "□";
  };

  /* =========================================
     FILE DATE
  ========================================= */

  const formatDate = (date) => {
    if (!date) return "";

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "";
    }

    return parsed.toLocaleString(
      [],
      {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /* =========================================
     PREVIEW
  ========================================= */

  const openPreview = (file) => {
    if (!file?.blob) {
      alert(
        "Preview is unavailable for this file."
      );

      return;
    }

    setPreviewFile(file);
    setMenuId(null);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const previewURL =
    previewFile?.blob
      ? URL.createObjectURL(
          previewFile.blob
        )
      : null;

  useEffect(() => {
    return () => {
      if (previewURL) {
        URL.revokeObjectURL(
          previewURL
        );
      }
    };
  }, [previewURL]);

  /* =========================================
     OPEN IN NEW TAB
  ========================================= */

  const openFile = (file) => {
    if (!file?.blob) {
      return;
    }

    const url =
      URL.createObjectURL(
        file.blob
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

    setMenuId(null);
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div
      className="library-page"
      onClick={() =>
        setMenuId(null)
      }
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <header className="library-header">
        <div>
          <h1>Library</h1>
        </div>

        <div className="library-header-actions">
          <div className="library-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <label className="library-new-button">
            <span>＋</span>

            New

            <input
              type="file"
              multiple
              hidden
              onChange={
                handleUpload
              }
            />

            <span className="new-arrow">
              ˅
            </span>
          </label>
        </div>
      </header>

      {/* =====================================
          TOOLBAR
      ===================================== */}

      <div className="library-toolbar">
        <div className="library-tabs">
          {[
            "All",
            "Image",
            "Document",
            "Code",
            "PDF",
          ].map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {item === "Image"
                ? "Images"
                : item ===
                  "Document"
                ? "Documents"
                : item}
            </button>
          ))}
        </div>

        <div className="library-view-actions">
          <button
            title="Pinned files"
            className={
              category === "Pinned"
                ? "active"
                : ""
            }
            onClick={() =>
              setCategory(
                category === "Pinned"
                  ? "All"
                  : "Pinned"
              )
            }
          >
            ★
          </button>

          <button
            className={
              view === "grid"
                ? "active"
                : ""
            }
            onClick={() =>
              setView("grid")
            }
            title="Grid view"
          >
            ▦
          </button>

          <button
            className={
              view === "list"
                ? "active"
                : ""
            }
            onClick={() =>
              setView("list")
            }
            title="List view"
          >
            ☷
          </button>
        </div>
      </div>

      {/* =====================================
          DRAG DROP
      ===================================== */}

      <div
        className={
          dragging
            ? "library-drop-area dragging"
            : "library-drop-area"
        }
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() =>
          setDragging(false)
        }
        onDrop={handleDrop}
      >
        {dragging
          ? "Drop files here"
          : "Drag and drop files here"}
      </div>

      {/* =====================================
          CONTENT
      ===================================== */}

      {loading ? (
        <div className="library-empty">
          <div className="library-empty-icon">
            ◌
          </div>

          <h2>
            Loading Library...
          </h2>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">
            ▱
          </div>

          <h2>
            {files.length === 0
              ? "Your Library is empty"
              : "No files found"}
          </h2>

          <p>
            {files.length === 0
              ? "Upload files, images, or documents to keep them here."
              : "Try another search or category."}
          </p>

          {files.length === 0 && (
            <label className="library-upload-empty">
              Upload files

              <input
                type="file"
                multiple
                hidden
                onChange={
                  handleUpload
                }
              />
            </label>
          )}
        </div>
      ) : view === "list" ? (
        <div className="library-list">
          <div className="library-list-head">
            <span>Name</span>
            <span>Modified</span>
            <span>Size</span>
            <span></span>
          </div>

          {filteredFiles
            .filter((file) => {
              if (
                category ===
                "Pinned"
              ) {
                return pinnedIds.includes(
                  file.id
                );
              }

              return true;
            })
            .map((file) => (
              <div
                className="library-row"
                key={file.id}
              >
                {/* NAME */}

                <div className="library-file-name">
                  <div className="library-file-icon">
                    {getFileIcon(file)}
                  </div>

                  {renameId ===
                  file.id ? (
                    <input
                      className="library-rename-input"
                      value={
                        renameText
                      }
                      autoFocus
                      onChange={(event) =>
                        setRenameText(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          finishRename();
                        }

                        if (
                          event.key ===
                          "Escape"
                        ) {
                          cancelRename();
                        }
                      }}
                      onBlur={
                        finishRename
                      }
                    />
                  ) : (
                    <span
                      title={
                        file.name
                      }
                      onDoubleClick={() =>
                        openPreview(
                          file
                        )
                      }
                      style={{
                        cursor:
                          "pointer",
                      }}
                    >
                      {file.name}
                    </span>
                  )}

                  {pinnedIds.includes(
                    file.id
                  ) && (
                    <span
                      title="Pinned"
                      style={{
                        color:
                          "#a78bfa",
                        fontSize:
                          "12px",
                      }}
                    >
                      ★
                    </span>
                  )}
                </div>

                {/* DATE */}

                <span className="library-date">
                  {formatDate(
                    file.updatedAt ||
                      file.createdAt
                  )}
                </span>

                {/* SIZE */}

                <span className="library-size">
                  {formatFileSize(
                    file.size
                  )}
                </span>

                {/* MENU */}

                <div
                  className="library-menu-wrapper"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <button
                    className="library-menu-button"
                    onClick={() =>
                      setMenuId(
                        menuId ===
                          file.id
                          ? null
                          : file.id
                      )
                    }
                  >
                    •••
                  </button>

                  {menuId ===
                    file.id && (
                    <div className="library-menu">
                      <button
                        onClick={() =>
                          openPreview(
                            file
                          )
                        }
                      >
                        👁 Preview
                      </button>

                      <button
                        onClick={() =>
                          openFile(
                            file
                          )
                        }
                      >
                        ↗ Open
                      </button>

                      <button
                        onClick={() =>
                          downloadFile(
                            file
                          )
                        }
                      >
                        ↓ Download
                      </button>

                      <button
                        onClick={() =>
                          togglePin(
                            file.id
                          )
                        }
                      >
                        {pinnedIds.includes(
                          file.id
                        )
                          ? "☆ Unpin"
                          : "★ Pin"}
                      </button>

                      <button
                        onClick={() =>
                          startRename(
                            file
                          )
                        }
                      >
                        ✎ Rename
                      </button>

                      <button
                        className="delete"
                        onClick={() =>
                          handleDelete(
                            file.id
                          )
                        }
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* ===================================
           GRID
        =================================== */

        <div className="library-grid">
          {filteredFiles
            .filter((file) => {
              if (
                category ===
                "Pinned"
              ) {
                return pinnedIds.includes(
                  file.id
                );
              }

              return true;
            })
            .map((file) => (
              <article
                className="library-card"
                key={file.id}
              >
                <div className="library-card-icon">
                  {getFileIcon(file)}
                </div>

                {pinnedIds.includes(
                  file.id
                ) && (
                  <div
                    style={{
                      position:
                        "absolute",
                      top: "12px",
                      right: "12px",
                      color:
                        "#a78bfa",
                    }}
                  >
                    ★
                  </div>
                )}

                <div className="library-card-info">
                  {renameId ===
                  file.id ? (
                    <input
                      className="library-rename-input"
                      value={
                        renameText
                      }
                      autoFocus
                      onChange={(event) =>
                        setRenameText(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          finishRename();
                        }

                        if (
                          event.key ===
                          "Escape"
                        ) {
                          cancelRename();
                        }
                      }}
                      onBlur={
                        finishRename
                      }
                    />
                  ) : (
                    <h3
                      title={
                        file.name
                      }
                      onDoubleClick={() =>
                        openPreview(
                          file
                        )
                      }
                      style={{
                        cursor:
                          "pointer",
                      }}
                    >
                      {file.name}
                    </h3>
                  )}

                  <p>
                    {formatFileSize(
                      file.size
                    )}
                    {" • "}
                    {getFileCategory(
                      file
                    )}
                  </p>
                </div>

                <div className="library-card-actions">
                  <button
                    title="Preview"
                    onClick={() =>
                      openPreview(
                        file
                      )
                    }
                  >
                    👁
                  </button>

                  <button
                    title={
                      pinnedIds.includes(
                        file.id
                      )
                        ? "Unpin"
                        : "Pin"
                    }
                    onClick={() =>
                      togglePin(
                        file.id
                      )
                    }
                  >
                    {pinnedIds.includes(
                      file.id
                    )
                      ? "★"
                      : "☆"}
                  </button>

                  <button
                    title="Download"
                    onClick={() =>
                      downloadFile(
                        file
                      )
                    }
                  >
                    ↓
                  </button>

                  <button
                    title="Rename"
                    onClick={() =>
                      startRename(
                        file
                      )
                    }
                  >
                    ✎
                  </button>

                  <button
                    className="delete"
                    title="Delete"
                    onClick={() =>
                      handleDelete(
                        file.id
                      )
                    }
                  >
                    🗑
                  </button>
                </div>
              </article>
            ))}
        </div>
      )}

      {/* =====================================
          FOOTER
      ===================================== */}

      {files.length > 0 && (
        <div className="library-footer">
          <span>
            {filteredFiles.filter(
              (file) =>
                category !==
                  "Pinned" ||
                pinnedIds.includes(
                  file.id
                )
            ).length}{" "}
            of {files.length} files
          </span>

          <button
            onClick={handleClear}
          >
            Clear Library
          </button>
        </div>
      )}

      {/* =====================================
          PREVIEW MODAL
      ===================================== */}

      {previewFile && (
        <div
          className="settings-overlay"
          onClick={
            closePreview
          }
        >
          <div
            className="settings-modal"
            style={{
              width:
                "min(900px, 95vw)",
              maxHeight: "90vh",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="settings-header">
              <h2>
                👁 {previewFile.name}
              </h2>

              <button
                onClick={
                  closePreview
                }
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: "20px",
                maxHeight:
                  "calc(90vh - 80px)",
                overflow:
                  "auto",
              }}
            >
              {previewFile.type?.startsWith(
                "image/"
              ) ? (
                <img
                  src={previewURL}
                  alt={
                    previewFile.name
                  }
                  style={{
                    display: "block",
                    maxWidth:
                      "100%",
                    maxHeight:
                      "65vh",
                    margin:
                      "0 auto",
                    objectFit:
                      "contain",
                  }}
                />
              ) : previewFile.type?.includes(
                  "pdf"
                ) ? (
                <iframe
                  src={previewURL}
                  title={
                    previewFile.name
                  }
                  style={{
                    width: "100%",
                    height:
                      "65vh",
                    border: "1px solid #292d3a",
                    borderRadius:
                      "8px",
                  }}
                />
              ) : previewFile.type?.startsWith(
                  "text/"
                ) ||
                previewFile.name.match(
                  /\.(js|jsx|ts|tsx|json|css|html|xml|md|txt)$/i
                ) ? (
                <TextPreview
                  file={
                    previewFile
                  }
                />
              ) : (
                <div
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "50px 20px",
                    color:
                      "#858b9d",
                  }}
                >
                  <h3>
                    Preview unavailable
                  </h3>

                  <p>
                    This file type cannot
                    be previewed in the browser.
                  </p>

                  <button
                    className="settings-done"
                    onClick={() =>
                      downloadFile(
                        previewFile
                      )
                    }
                  >
                    ↓ Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   TEXT PREVIEW
========================================= */

function TextPreview({ file }) {
  const [text, setText] =
    useState("Loading...");

  useEffect(() => {
    let active = true;

    const readFile = async () => {
      try {
        const content =
          await file.blob.text();

        if (active) {
          setText(content);
        }
      } catch {
        if (active) {
          setText(
            "Unable to read this file."
          );
        }
      }
    };

    readFile();

    return () => {
      active = false;
    };
  }, [file]);

  return (
    <pre
      style={{
        margin: 0,
        padding: "18px",
        maxHeight: "65vh",
        overflow: "auto",
        border:
          "1px solid #292d3a",
        borderRadius: "10px",
        background: "#0b0d13",
        color: "#d9dbe4",
        fontSize: "12px",
        lineHeight: "1.6",
        whiteSpace:
          "pre-wrap",
        overflowWrap:
          "anywhere",
      }}
    >
      {text}
    </pre>
  );
}

export default Library;