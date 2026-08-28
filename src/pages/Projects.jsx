import { useState } from "react";

function Projects() {
  const [projects, setProjects] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("devforge-projects")
      ) || [];
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");

  const createProject = () => {
    const name = window.prompt("Project name");

    if (!name?.trim()) return;

    const project = {
      id: Date.now(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [project, ...projects];

    setProjects(updated);

    localStorage.setItem(
      "devforge-projects",
      JSON.stringify(updated)
    );
  };

  const deleteProject = (id) => {
    const updated = projects.filter(
      (project) => project.id !== id
    );

    setProjects(updated);

    localStorage.setItem(
      "devforge-projects",
      JSON.stringify(updated)
    );
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="workspace-page">

      <header className="workspace-page-header">

        <h1>Projects</h1>

        <div className="workspace-header-actions">

          <div className="workspace-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search projects"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <button
            className="workspace-new-button"
            onClick={createProject}
          >
            ＋ New
          </button>

        </div>

      </header>

      <div className="workspace-tabs">

        <button className="active">
          All
        </button>

        <button>
          Created by you
        </button>

        <button>
          Shared with you
        </button>

      </div>

      {filteredProjects.length === 0 ? (

        <div className="workspace-empty">

          <div className="workspace-empty-icon">
            ▱
          </div>

          <h2>
            No projects yet
          </h2>

          <p>
            Create a project to organize your
            conversations and work.
          </p>

          <button
            className="workspace-create-button"
            onClick={createProject}
          >
            ＋ Create project
          </button>

        </div>

      ) : (

        <div className="workspace-project-grid">

          {filteredProjects.map((project) => (

            <article
              className="workspace-project-card"
              key={project.id}
            >

              <div className="workspace-project-icon">
                📁
              </div>

              <h3>
                {project.name}
              </h3>

              <p>
                Created{" "}
                {new Date(
                  project.createdAt
                ).toLocaleDateString()}
              </p>

              <button
                className="workspace-delete-button"
                onClick={() =>
                  deleteProject(project.id)
                }
              >
                Delete
              </button>

            </article>

          ))}

        </div>

      )}

    </div>
  );
}

export default Projects;