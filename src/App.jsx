import { useEffect, useMemo, useState } from "react";
import "./App.css";

import JSONFormatter from "./pages/JSONFormatter";
import JWTDecoder from "./pages/JWTDecoder";
import Base64Encoder from "./pages/Base64Encoder";
import RegexTester from "./pages/RegexTester";
import UUIDGenerator from "./pages/UUIDGenerator";
import URLEncoder from "./pages/URLEncoder";
import QRGenerator from "./pages/QRGenerator";
import ImageCompressor from "./pages/ImageCompressor";
import AIPromptGenerator from "./pages/AIPromptGenerator";
import Library from "./pages/Library";
import Share from "./pages/Share";

import DevForgeShell from "./components/DevForgeShell";

const tools = [
  {
    name: "JSON Formatter",
    description: "Format and validate JSON instantly.",
    icon: "{}",
    category: "Developer",
    path: "/json-formatter",
  },
  {
    name: "JWT Decoder",
    description: "Decode JWT tokens and inspect payload.",
    icon: "◈",
    category: "Developer",
    path: "/jwt-decoder",
  },
  {
    name: "Base64 Encoder",
    description: "Encode and decode Base64 text.",
    icon: "64",
    category: "Developer",
    path: "/base64-encoder",
  },
  {
    name: "Regex Tester",
    description: "Test regular expressions against text.",
    icon: ".*",
    category: "Developer",
    path: "/regex-tester",
  },
  {
    name: "UUID Generator",
    description: "Generate unique identifiers instantly.",
    icon: "ID",
    category: "Developer",
    path: "/uuid-generator",
  },
  {
    name: "URL Encoder",
    description: "Encode or decode URLs safely.",
    icon: "↗",
    category: "Developer",
    path: "/url-encoder",
  },
  {
    name: "QR Generator",
    description: "Create QR codes from text or links.",
    icon: "▦",
    category: "Utilities",
    path: "/qr-generator",
  },
  {
    name: "Image Compressor",
    description: "Reduce image size easily.",
    icon: "IMG",
    category: "Utilities",
    path: "/image-compressor",
  },
  {
    name: "AI Prompt Generator",
    description: "Create powerful AI prompts.",
    icon: "AI",
    category: "AI Tools",
    path: "/ai-prompt-generator",
  },
];

const readStorage = (key, fallback) => {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "null"
    );

    return value ?? fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const pathname = window.location.pathname;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [favorites, setFavorites] = useState(() =>
    readStorage("devforge-favorites", [])
  );

  const [recent, setRecent] = useState(() =>
    readStorage("devforge-recent", [])
  );

  const [imagePrompt, setImagePrompt] = useState("");
  const [mapSearch, setMapSearch] = useState("");

  const [gptSearch, setGptSearch] = useState("");
  const [gptCategory, setGptCategory] =
    useState("Top Picks");

  useEffect(() => {
    localStorage.setItem(
      "devforge-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "devforge-recent",
      JSON.stringify(recent)
    );
  }, [recent]);

  const openTool = (tool) => {
    setRecent((current) =>
      [
        tool.name,
        ...current.filter(
          (name) => name !== tool.name
        ),
      ].slice(0, 4)
    );

    window.location.href = tool.path;
  };

  const toggleFavorite = (name) => {
    setFavorites((current) =>
      current.includes(name)
        ? current.filter(
            (item) => item !== name
          )
        : [...current, name]
    );
  };

  const filteredTools = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return tools.filter((tool) => {
      const text =
        `${tool.name} ${tool.description}`.toLowerCase();

      return (
        text.includes(query) &&
        (
          category === "All" ||
          tool.category === category
        )
      );
    });
  }, [search, category]);

  /* =========================================================
     HOME
     ========================================================= */

  const renderHome = () => (
    <div className="workspace-home">

      <section className="workspace-hero">

        <div className="hero-badge">
          <span />
          Free developer tools
        </div>

        <h1>
          Build faster.
          <br />
          <strong>Work smarter.</strong>
        </h1>

        <p>
          A fast collection of powerful tools
          for developers, programmers and
          creators.
        </p>

        <div className="workspace-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search for a tool..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <kbd>Ctrl K</kbd>

        </div>

        <div className="hero-stats">

          <div>
            <strong>
              {tools.length}+
            </strong>

            <span>
              Free tools
            </span>
          </div>

          <div>
            <strong>0</strong>

            <span>
              Sign-up required
            </span>
          </div>

          <div>
            <strong>
              Fast
            </strong>

            <span>
              Browser-based
            </span>
          </div>

        </div>

      </section>

      {recent.length > 0 && (
        <section className="quick-section">

          <span className="eyebrow">
            RECENT
          </span>

          <h2>
            Recently used
          </h2>

          <div className="quick-list">

            {recent.map((name) => {

              const tool = tools.find(
                (item) =>
                  item.name === name
              );

              if (!tool) return null;

              return (
                <button
                  type="button"
                  className="quick-tool"
                  key={name}
                  onClick={() =>
                    openTool(tool)
                  }
                >
                  <span>
                    {tool.icon}
                  </span>

                  <span>
                    {tool.name}
                  </span>

                  <span>
                    ↗
                  </span>
                </button>
              );
            })}

          </div>

        </section>
      )}

      {favorites.length > 0 && (
        <section className="quick-section">

          <span className="eyebrow">
            SAVED
          </span>

          <h2>
            Your favorites
          </h2>

          <div className="quick-list">

            {favorites.map((name) => {

              const tool = tools.find(
                (item) =>
                  item.name === name
              );

              if (!tool) return null;

              return (
                <button
                  type="button"
                  className="quick-tool"
                  key={name}
                  onClick={() =>
                    openTool(tool)
                  }
                >
                  <span>
                    {tool.icon}
                  </span>

                  <span>
                    {tool.name}
                  </span>

                  <span>
                    ★
                  </span>
                </button>
              );
            })}

          </div>

        </section>
      )}

      <section className="tools-section">

        <div className="category-filter">

          {[
            "All",
            "Developer",
            "AI Tools",
            "Utilities",
          ].map((item) => (

            <button
              type="button"
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
              {item}
            </button>

          ))}

        </div>

        <div className="section-heading">

          <div>

            <span className="eyebrow">
              TOOLBOX
            </span>

            <h2>
              Popular developer tools
            </h2>

          </div>

          <span>
            {filteredTools.length} tools
          </span>

        </div>

        <div className="tools-grid">

          {filteredTools.map((tool) => (

            <article
              className="tool-card"
              key={tool.name}
            >

              <div className="tool-icon">
                {tool.icon}
              </div>

              <button
                type="button"
                className="favorite-button"
                onClick={() =>
                  toggleFavorite(
                    tool.name
                  )
                }
              >
                {favorites.includes(
                  tool.name
                )
                  ? "★"
                  : "☆"}
              </button>

              <span className="tool-category">
                {tool.category}
              </span>

              <h3>
                {tool.name}
              </h3>

              <p>
                {tool.description}
              </p>

              <button
                type="button"
                className="launch-tool"
                onClick={() =>
                  openTool(tool)
                }
              >
                Launch Tool ↗
              </button>

            </article>

          ))}

          {filteredTools.length === 0 && (
            <div className="empty-workspace">

              <div>⌕</div>

              <h2>
                No tools found
              </h2>

              <p>
                Try another search or
                category.
              </p>

            </div>
          )}

        </div>

      </section>

    </div>
  );

  /* =========================================================
     PROJECTS
     ========================================================= */

  const renderProjects = () => (
    <div className="workspace-page">

      <div className="professional-page-header">

        <div>

          <div className="professional-eyebrow">
            ▣ DEVFORGE WORKSPACE
          </div>

          <h1>
            Projects
          </h1>

          <p>
            Create and organize your
            projects in one place.
          </p>

        </div>

        <button
          type="button"
          className="primary-action"
        >
          + New Project
        </button>

      </div>

      <div className="empty-workspace">

        <div>▣</div>

        <h2>
          No projects yet
        </h2>

        <p>
          Create your first project
          to get started.
        </p>

        <button
          type="button"
          className="primary-action"
        >
          + New Project
        </button>

      </div>

    </div>
  );

  /* =========================================================
     SCHEDULED
     ========================================================= */

  const renderScheduled = () => (
    <div className="workspace-page">

      <div className="professional-page-header">

        <div>

          <div className="professional-eyebrow">
            ◷ AUTOMATION
          </div>

          <h1>
            Scheduled
          </h1>

          <p>
            Schedule tasks, reminders
            and monitoring.
          </p>

        </div>

        <button
          type="button"
          className="primary-action"
        >
          + Schedule
        </button>

      </div>

      <div className="schedule-box">

        <span>＋</span>

        <input
          type="text"
          placeholder="Schedule a task..."
        />

        <button type="button">
          Create
        </button>

      </div>

      <div className="schedule-items">

        {[
          [
            "☀",
            "Daily brief",
            "Personalized daily briefing",
          ],
          [
            "✉",
            "Email monitor",
            "Check important emails",
          ],
          [
            "◇",
            "Sale monitor",
            "Watch for useful sales",
          ],
          [
            "♫",
            "Concert alerts",
            "Track upcoming concerts",
          ],
        ].map(
          ([icon, title, text]) => (

            <div key={title}>

              <span className="schedule-icon">
                {icon}
              </span>

              <strong>
                {title}
              </strong>

              <span>
                {text}
              </span>

            </div>

          )
        )}

      </div>

    </div>
  );

  /* =========================================================
     IMAGES
     ========================================================= */

  const renderImages = () => {

    const examples = [
      [
        "✦",
        "Creative concept",
        "Turn an idea into a visual concept.",
      ],
      [
        "◉",
        "Portrait",
        "Create a polished character portrait.",
      ],
      [
        "▣",
        "Product design",
        "Generate clean product visuals.",
      ],
      [
        "◈",
        "Cinematic scene",
        "Create cinematic environments.",
      ],
    ];

    return (
      <div className="workspace-page creative-page">

        <div className="professional-page-header">

          <div>

            <div className="professional-eyebrow">
              ✦ DEVFORGE CREATIVE
            </div>

            <h1>
              Create images
            </h1>

            <p>
              Turn your ideas into polished
              visuals with AI-powered creation.
            </p>

          </div>

          <div className="status-pill">
            <span />
            Ready
          </div>

        </div>

        <div className="image-create-panel">

          <div className="panel-label">

            <span>
              CREATE
            </span>

            <span>
              AI IMAGE
            </span>

          </div>

          <textarea
            rows={5}
            value={imagePrompt}
            onChange={(e) =>
              setImagePrompt(
                e.target.value
              )
            }
            placeholder="Describe the image you want to create..."
          />

          <div className="panel-footer">

            <div className="panel-tools">

              <button type="button">
                ＋
              </button>

              <button type="button">
                ⚙
              </button>

            </div>

            <button
              type="button"
              className="gradient-action"
              onClick={() => {

                if (!imagePrompt.trim()) {
                  alert(
                    "Please describe the image first."
                  );

                  return;
                }

                alert(
                  "Connect your image-generation API here."
                );

              }}
            >
              ✦ Create image
              <span>→</span>
            </button>

          </div>

        </div>

        <div className="content-section-title">

          <div>

            <span>
              QUICK START
            </span>

            <h2>
              Start with an idea
            </h2>

          </div>

        </div>

        <div className="professional-image-grid">

          {examples.map(
            ([icon, title, text]) => (

              <button
                type="button"
                className="professional-image-card"
                key={title}
                onClick={() =>
                  setImagePrompt(
                    `Create a professional ${title.toLowerCase()}`
                  )
                }
              >

                <div className="professional-card-icon">
                  {icon}
                </div>

                <div>

                  <strong>
                    {title}
                  </strong>

                  <p>
                    {text}
                  </p>

                </div>

                <span>
                  →
                </span>

              </button>

            )
          )}

        </div>

        <div className="info-strip">

          <div>

            <span>✦</span>

            <div>

              <strong>
                Describe anything
              </strong>

              <p>
                Give DevForge a simple idea
                or detailed visual direction.
              </p>

            </div>

          </div>

          <div>

            <span>◈</span>

            <div>

              <strong>
                Refine your concept
              </strong>

              <p>
                Adjust your prompt until your
                concept is exactly right.
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  };

  /* =========================================================
     MAPS
     ========================================================= */

  const renderMaps = () => {

    const discover = [
      [
        "⌂",
        "Cafes",
        "Find cafes and coffee nearby.",
      ],
      [
        "◆",
        "Restaurants",
        "Discover places to eat.",
      ],
      [
        "▦",
        "Workspaces",
        "Find places to work or study.",
      ],
      [
        "＋",
        "Services",
        "Find useful services nearby.",
      ],
    ];

    return (
      <div className="workspace-page maps-page">

        <div className="professional-page-header">

          <div>

            <div className="professional-eyebrow">
              ⌖ DEVFORGE DISCOVER
            </div>

            <h1>
              Maps
            </h1>

            <p>
              Find useful places, services,
              restaurants and destinations.
            </p>

          </div>

          <div className="status-pill">
            <span />
            Location ready
          </div>

        </div>

        <div className="map-search-panel">

          <span>
            ⌕
          </span>

          <input
            value={mapSearch}
            onChange={(e) =>
              setMapSearch(
                e.target.value
              )
            }
            placeholder="Search places, restaurants, services..."
          />

          <button
            type="button"
            className="secondary-action"
          >
            Think
          </button>

          <button
            type="button"
            className="icon-action"
            onClick={() =>
              alert(
                "Location access can be connected here."
              )
            }
          >
            ⌖
          </button>

        </div>

        <div className="map-hero-card">

          <div className="map-hero-main">

            <div className="map-large-icon">
              ⌖
            </div>

            <div>

              <span>
                DISCOVER AROUND YOU
              </span>

              <h2>
                Where do you want to go?
              </h2>

              <p>
                Search for a place or use
                your location to discover
                what's nearby.
              </p>

            </div>

          </div>

          <button
            type="button"
            className="gradient-action"
            onClick={() =>
              alert(
                "Location access can be connected here."
              )
            }
          >
            Use my location
            <span>→</span>
          </button>

        </div>

        <div className="content-section-title">

          <div>

            <span>
              EXPLORE
            </span>

            <h2>
              Discover places
            </h2>

          </div>

        </div>

        <div className="professional-discover-grid">

          {discover.map(
            ([icon, title, text]) => (

              <button
                type="button"
                className="professional-discover-card"
                key={title}
                onClick={() =>
                  setMapSearch(title)
                }
              >

                <div className="discover-icon">
                  {icon}
                </div>

                <div>

                  <strong>
                    {title}
                  </strong>

                  <p>
                    {text}
                  </p>

                </div>

                <span>
                  →
                </span>

              </button>

            )
          )}

        </div>

        <div className="map-note">

          <div>
            ◉
          </div>

          <div>

            <strong>
              Smart discovery
            </strong>

            <p>
              Ask DevForge naturally, such
              as "Find a quiet cafe nearby"
              or "Show me restaurants for
              dinner."
            </p>

          </div>

        </div>

      </div>
    );
  };

  /* =========================================================
     GPTs
     ========================================================= */

  const renderGPTs = () => {

    const categories = [
      "Top Picks",
      "Programming",
      "Research",
      "Writing",
      "Productivity",
      "Education",
    ];

    const gpts = [
      {
        icon: "</>",
        title: "Coding Assistant",
        category: "Programming",
        description:
          "Build, debug and improve code with an AI coding partner.",
      },
      {
        icon: "◈",
        title: "Research Assistant",
        category: "Research",
        description:
          "Analyze information, organize findings and explore ideas.",
      },
      {
        icon: "✦",
        title: "Writing Assistant",
        category: "Writing",
        description:
          "Write, rewrite and improve professional content.",
      },
      {
        icon: "⚡",
        title: "Productivity Assistant",
        category: "Productivity",
        description:
          "Plan tasks, organize projects and work more efficiently.",
      },
      {
        icon: "⌘",
        title: "Study Assistant",
        category: "Education",
        description:
          "Learn difficult concepts with simple explanations.",
      },
      {
        icon: "◎",
        title: "Idea Generator",
        category: "Top Picks",
        description:
          "Turn rough ideas into useful concepts and plans.",
      },
    ];

    const filteredGPTs =
      gpts.filter((gpt) => {

        const matchesSearch =
          `${gpt.title} ${gpt.description}`
            .toLowerCase()
            .includes(
              gptSearch
                .trim()
                .toLowerCase()
            );

        const matchesCategory =
          gptCategory === "Top Picks" ||
          gpt.category === gptCategory;

        return (
          matchesSearch &&
          matchesCategory
        );
      });

    return (
      <div className="workspace-page gpts-page">

        <div className="professional-page-header gpt-header">

          <div>

            <div className="professional-eyebrow">
              ◇ DEVFORGE GPTs
            </div>

            <h1>
              Explore GPTs
            </h1>

            <p>
              Discover specialized AI
              assistants built for different
              tasks.
            </p>

          </div>

          <button
            type="button"
            className="gradient-action"
          >
            ＋ Create GPT
          </button>

        </div>

        <div className="gpt-search-panel">

          <span>
            ⌕
          </span>

          <input
            value={gptSearch}
            onChange={(e) =>
              setGptSearch(
                e.target.value
              )
            }
            placeholder="Search GPTs..."
          />

          <kbd>
            /
          </kbd>

        </div>

        <div className="gpt-tabs">

          {categories.map((item) => (

            <button
              type="button"
              key={item}
              className={
                gptCategory === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setGptCategory(item)
              }
            >
              {item}
            </button>

          ))}

        </div>

        <div className="content-section-title">

          <div>

            <span>
              DISCOVER
            </span>

            <h2>
              Featured assistants
            </h2>

          </div>

          <span>
            {filteredGPTs.length} GPTs
          </span>

        </div>

        <div className="professional-gpt-grid">

          {filteredGPTs.map((gpt) => (

            <button
              type="button"
              className="professional-gpt-card"
              key={gpt.title}
            >

              <div className="gpt-card-top">

                <div className="professional-gpt-icon">
                  {gpt.icon}
                </div>

                <span className="gpt-card-menu">
                  •••
                </span>

              </div>

              <div className="gpt-card-category">
                {gpt.category}
              </div>

              <h3>
                {gpt.title}
              </h3>

              <p>
                {gpt.description}
              </p>

              <div className="gpt-card-footer">

                <span>
                  DevForge
                </span>

                <span>
                  Open →
                </span>

              </div>

            </button>

          ))}

          {filteredGPTs.length === 0 && (
            <div className="empty-workspace gpt-empty">

              <div>
                ⌕
              </div>

              <h2>
                No GPTs found
              </h2>

              <p>
                Try another search or
                category.
              </p>

            </div>
          )}

        </div>

        <div className="professional-create-gpt-card">

          <div className="create-gpt-symbol">
            ＋
          </div>

          <div>

            <strong>
              Build your own GPT
            </strong>

            <p>
              Create a specialized assistant
              for your own workflow.
            </p>

          </div>

          <button
            type="button"
            className="secondary-action"
          >
            Create →
          </button>

        </div>

      </div>
    );
  };

  /* =========================================================
     CODEX
     ========================================================= */

  const renderCodex = () => (
    <div className="workspace-page">

      <div className="codex-box">

        <div>
          ◈
        </div>

        <h1>
          Build with Codex
        </h1>

        <p>
          Build apps, websites and tools
          with AI-assisted coding.
        </p>

        <button type="button">
          Start coding
        </button>

      </div>

    </div>
  );

  /* =========================================================
     NORMAL PAGE ROUTER
     ========================================================= */

  const renderPage = () => {

    if (pathname === "/projects") {
      return renderProjects();
    }

    if (pathname === "/scheduled") {
      return renderScheduled();
    }

    if (pathname === "/images") {
      return renderImages();
    }

    if (pathname === "/maps") {
      return renderMaps();
    }

    if (pathname === "/gpts") {
      return renderGPTs();
    }

    if (pathname === "/codex") {
      return renderCodex();
    }

    /*
     * /share
     * This is the Share page where the user
     * creates a new share link.
     */
    if (pathname === "/share") {
      return <Share />;
    }

    return renderHome();
  };

  const withShell = (content) => (
    <DevForgeShell>
      {content}
    </DevForgeShell>
  );

  /* =========================================================
     DEVELOPER TOOLS
     ========================================================= */

  if (pathname === "/json-formatter") {
    return withShell(
      <JSONFormatter />
    );
  }

  if (pathname === "/jwt-decoder") {
    return withShell(
      <JWTDecoder />
    );
  }

  if (pathname === "/base64-encoder") {
    return withShell(
      <Base64Encoder />
    );
  }

  if (pathname === "/regex-tester") {
    return withShell(
      <RegexTester />
    );
  }

  if (pathname === "/uuid-generator") {
    return withShell(
      <UUIDGenerator />
    );
  }

  if (pathname === "/url-encoder") {
    return withShell(
      <URLEncoder />
    );
  }

  if (pathname === "/qr-generator") {
    return withShell(
      <QRGenerator />
    );
  }

  if (pathname === "/image-compressor") {
    return withShell(
      <ImageCompressor />
    );
  }

  if (pathname === "/ai-prompt-generator") {
    return withShell(
      <AIPromptGenerator />
    );
  }

  if (pathname === "/library") {
    return withShell(
      <Library />
    );
  }

  /* =========================================================
     SHARED CONVERSATION
     ========================================================= */

  /*
   * This catches URLs like:
   *
   * /share/12107817-7ae1-427b-8ede-3bdd02e1f574
   *
   * and sends ONLY that ID to Share.jsx.
   */

  if (
    pathname.startsWith("/share/") &&
    pathname.length > "/share/".length
  ) {
    const shareId =
      pathname
        .slice("/share/".length)
        .split("/")[0];

    return (
      <Share
        shareId={shareId}
      />
    );
  }

  /* =========================================================
     DEFAULT
     ========================================================= */

  return withShell(
    renderPage()
  );
}

export default App;