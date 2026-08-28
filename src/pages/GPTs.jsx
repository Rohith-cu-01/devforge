import { useState } from "react";

function GPTs() {
  const [search, setSearch] = useState("");

  const gpts = [
    {
      name: "Coding Assistant",
      description: "Help with programming and debugging.",
      icon: "💻",
    },
    {
      name: "Study Assistant",
      description: "Learn concepts and prepare for exams.",
      icon: "📚",
    },
    {
      name: "Writing Assistant",
      description: "Write, rewrite and improve your content.",
      icon: "✍️",
    },
    {
      name: "Research Assistant",
      description: "Organize research and analyze information.",
      icon: "🔎",
    },
    {
      name: "Productivity",
      description: "Plan tasks and organize your workflow.",
      icon: "⚡",
    },
    {
      name: "Developer Expert",
      description: "Build apps, websites and developer tools.",
      icon: "🧑‍💻",
    },
  ];

  const filteredGPTs = gpts.filter(
    (gpt) =>
      gpt.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      gpt.description
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="workspace-page">

      <header className="workspace-page-header">

        <h1>Explore GPTs</h1>

        <button
          className="workspace-new-button"
          onClick={() =>
            alert("GPT creation coming soon")
          }
        >
          ＋ Create
        </button>

      </header>

      <section className="gpts-hero">

        <h2>GPTs</h2>

        <p>
          Discover and create custom AI assistants
          for different tasks and workflows.
        </p>

        <div className="gpts-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search GPTs"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

      </section>

      <div className="gpts-categories">

        <button className="active">
          Top Picks
        </button>

        <button>
          Programming
        </button>

        <button>
          Research & Analysis
        </button>

        <button>
          Writing
        </button>

        <button>
          Productivity
        </button>

        <button>
          Education
        </button>

      </div>

      <section className="gpts-section">

        <h2>Featured</h2>

        <p>
          Popular AI assistants
        </p>

        <div className="gpts-grid">

          {filteredGPTs.map((gpt) => (

            <article
              className="gpt-card"
              key={gpt.name}
            >

              <div className="gpt-icon">
                {gpt.icon}
              </div>

              <div>

                <h3>
                  {gpt.name}
                </h3>

                <p>
                  {gpt.description}
                </p>

                <button
                  onClick={() =>
                    alert(
                      `${gpt.name} selected`
                    )
                  }
                >
                  Open GPT
                </button>

              </div>

            </article>

          ))}

        </div>

        {filteredGPTs.length === 0 && (
          <div className="workspace-empty">

            <h2>
              No GPTs found
            </h2>

            <p>
              Try another search.
            </p>

          </div>
        )}

      </section>

    </div>
  );
}

export default GPTs;