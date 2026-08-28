import { useEffect, useState } from "react";

function Scheduled() {
  const [tasks, setTasks] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("devforge-scheduled")
        ) || []
      );
    } catch {
      return [];
    }
  });

  const [task, setTask] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "devforge-scheduled",
      JSON.stringify(tasks)
    );
  }, [tasks]);

  const addTask = () => {
    if (!task.trim()) return;

    const newTask = {
      id: Date.now(),
      title: task.trim(),
      createdAt: new Date().toISOString(),
      active: true,
    };

    setTasks((current) => [
      newTask,
      ...current,
    ]);

    setTask("");
  };

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              active: !item.active,
            }
          : item
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  return (
    <div className="workspace-page">

      <header className="workspace-page-header">

        <div>
          <h1>Scheduled</h1>

          <p className="workspace-subtitle">
            Schedule tasks, reminders, and
            recurring work.
          </p>
        </div>

        <button
          className="workspace-status-button"
        >
          ⚱ Active
        </button>

      </header>

      <div className="scheduled-input">

        <span>＋</span>

        <input
          type="text"
          placeholder="Schedule a task"
          value={task}
          onChange={(event) =>
            setTask(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addTask();
            }
          }}
        />

        <button
          onClick={addTask}
          disabled={!task.trim()}
        >
          ↑
        </button>

      </div>

      <div className="scheduled-list">

        {tasks.length === 0 ? (

          <div className="workspace-empty">

            <div className="workspace-empty-icon">
              ◷
            </div>

            <h2>
              No scheduled tasks
            </h2>

            <p>
              Add a task above to create a
              reminder.
            </p>

          </div>

        ) : (

          tasks.map((item) => (

            <article
              className={
                item.active
                  ? "scheduled-item"
                  : "scheduled-item inactive"
              }
              key={item.id}
            >

              <button
                className="scheduled-toggle"
                onClick={() =>
                  toggleTask(item.id)
                }
              >
                {item.active ? "○" : "✓"}
              </button>

              <div className="scheduled-content">

                <h3>
                  {item.title}
                </h3>

                <p>
                  Created{" "}
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </p>

              </div>

              <button
                className="scheduled-delete"
                onClick={() =>
                  deleteTask(item.id)
                }
              >
                ×
              </button>

            </article>

          ))

        )}

      </div>

    </div>
  );
}

export default Scheduled;