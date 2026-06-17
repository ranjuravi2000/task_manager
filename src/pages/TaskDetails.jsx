import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const tasks =
    JSON.parse(localStorage.getItem("tasks")) || [];

  const task = tasks.find(
    (task) => task.id === Number(id)
  );

  const [title, setTitle] = useState(
    task?.title || ""
  );

  const [description, setDescription] =
    useState(task?.description || "");

  const [priority, setPriority] =
    useState(task?.priority || "Medium");

  const [category, setCategory] =
    useState(task?.category || "");

  const [dueDate, setDueDate] =
    useState(task?.dueDate || "");

  const updateTask = () => {
    const updatedTasks = tasks.map((t) =>
      t.id === Number(id)
        ? {
          ...t,
          title,
          description,
          priority,
          category,
          dueDate,
        }
        : t
    );

    localStorage.setItem(
      "tasks",
      JSON.stringify(updatedTasks)
    );

    alert("Task Updated");

    navigate("/dashboard");
  };

  if (!task) {
    return (
      <div className="container mt-4">
        <h3>Task Not Found</h3>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <div className="card">

        <div className="card-body">

          <h2>Edit Task</h2>

          <div className="mb-3">
            <label>Title</label>

            <input
              className="form-control"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label>Description</label>

            <textarea
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />
          </div>

          <div className="mb-3">
            <label>Priority</label>

            <select
              className="form-select"
              value={priority}
              onChange={(e) =>
                setPriority(
                  e.target.value
                )
              }
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Category</label>

            <input
              className="form-control"
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            />
          </div>

          <div className="mb-3">
            <label>Due Date</label>

            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) =>
                setDueDate(
                  e.target.value
                )
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Created By
            </label>

            <input
              type="text"
              className="form-control"
              value={task.createdBy}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Assigned To
            </label>

            <input
              type="text"
              className="form-control"
              value={task.assignedTo || "Not Assigned"}
              readOnly
            />
          </div>

          <button
            className="btn btn-success"
            onClick={updateTask}
          >
            Update Task
          </button>

        </div>

      </div>

    </div>
  );
}

export default TaskDetails