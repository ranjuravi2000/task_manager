import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import { FaEdit,FaTasks,FaFlag,FaFolder,FaCalendarAlt,FaChartLine,FaUser,
  FaComments,FaSave,FaArrowLeft,FaPlus,FaFileAlt } from "react-icons/fa";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const tasks =
    JSON.parse(localStorage.getItem("tasks")) || [];

  const [task, setTask] = useState(
    tasks.find(
      (task) => task.id === Number(id)
    )
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

  const [comment, setComment] =
    useState("");
  const [progress, setProgress] =
    useState(task?.progress || 0);
  if (!task) {
    return (
      <div className="container mt-4">
        <h3>Task Not Found</h3>
      </div>
    );
  }

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
          progress,
          status:
            progress === 100
              ? "Completed"
              : task.status,
        }
        : t
    );

    localStorage.setItem(
      "tasks",
      JSON.stringify(updatedTasks)
    );

    navigate("/dashboard");
  };

  const addComment = () => {
    if (!comment.trim()) return;

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    const newComment = {
      user: currentUser.username,
      text: comment,
      date: new Date().toLocaleString(),
    };

    const updatedTask = {
      ...task,
      comments: [
        ...(task.comments || []),
        newComment,
      ],
    };

    const updatedTasks = tasks.map((t) =>
      t.id === task.id
        ? updatedTask
        : t
    );

    localStorage.setItem(
      "tasks",
      JSON.stringify(updatedTasks)
    );

    setTask(updatedTask);
    setComment("");
  };

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <FaEdit className="me-2 text-warning" />
          Edit Task
        </h2>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft className="me-1" />
          Dashboard
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body">

          <div className="mb-3">
            <label className="form-label">
              <FaTasks className="me-2" />
              Title
            </label>

            <input
              className="form-control"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <FaFileAlt className="me-2" />
              Description
            </label>

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
            <label className="form-label">
              <FaFlag className="me-2" />
              Priority
            </label>

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
            <label className="form-label">
              <FaFolder className="me-2" />
              Category
            </label>

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
            <label className="form-label">
              <FaCalendarAlt className="me-2" />
              Due Date
            </label>

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
              <FaChartLine className="me-2" />
              Progress ({progress}%)
            </label>

            <input
              type="range"
              min="0"
              max="100"
              className="form-range"
              value={progress}
              onChange={(e) =>
                setProgress(
                  Number(
                    e.target.value
                  )
                )
              }
            />

            <div className="progress">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{
                  width: `${progress}%`,
                }}
              >
                {progress}%
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              <FaUser className="me-2" />
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
              <FaUser className="me-2" />
              Assigned To
            </label>

            <input
              type="text"
              className="form-control"
              value={
                task.assignedTo ||
                "Not Assigned"
              }
              readOnly
            />
          </div>

          <hr />

          <h5 className="mb-3">
            <FaComments className="me-2 text-primary" />
            Comments

            <span className="badge bg-primary ms-2">
              {task.comments?.length || 0}
            </span>
          </h5>

          <div className="mb-3">
            <textarea
              className="form-control"
              rows="3"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) =>
                setComment(
                  e.target.value
                )
              }
            />
          </div>

          <button
            className="btn btn-primary mb-3"
            onClick={addComment}
          >
            <FaPlus className="me-1" />
            Add Comment
          </button>

          <div className="mb-4">

            {task.comments &&
              task.comments.length > 0 ? (

              task.comments.map(
                (c, index) => (
                  <div
                    key={index}
                    className="card mb-2 border-start border-primary border-3"
                  >
                    <div className="card-body">

                      <strong>
                        <FaUser className="me-1" />
                        {c.user}
                      </strong>

                      <p className="mb-1 mt-2">
                        {c.text}
                      </p>

                      <small className="text-muted">
                        {c.date}
                      </small>

                    </div>
                  </div>
                )
              )

            ) : (

              <p className="text-muted">
                No comments yet.
              </p>

            )}

          </div>

          <button
            className="btn btn-success"
            onClick={updateTask}
          >
            <FaSave className="me-1" />
            Update Task
          </button>

        </div>
      </div>

    </div>
  );
}

export default TaskDetails