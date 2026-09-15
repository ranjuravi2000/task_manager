import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axiosInstance";

function MyTasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const currentUserId =
    currentUser?._id || currentUser?.id || null;

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await API.get("/tasks");

      const allTasks = response.data.tasks || [];

      // Show only tasks created by the logged-in user
      const myTasks = allTasks.filter((task) => {
        const createdBy =
          typeof task.createdBy === "object"
            ? task.createdBy?._id
            : task.createdBy;

        return String(createdBy) === String(currentUserId);
      });

      setTasks(myTasks);
    } catch (error) {
      console.error("Error fetching my tasks:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

      {/* Header */}
      <Header showNav={true} />

      {/* Main Content */}
      <div className="container py-4 flex-grow-1">
        <button
          className="btn btn-outline-dark btn-sm mb-3"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">
              My Tasks
            </h2>

            <p className="text-muted mb-0">
              View and manage the tasks you created
            </p>
          </div>

          <button
            className="btn btn-dark"
            onClick={() => navigate("/create-task")}
          >
            + Create Task
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-dark"></div>
            <p className="text-muted mt-2">
              Loading tasks...
            </p>
          </div>
        )}

        {/* No Tasks */}
        {!loading && tasks.length === 0 && (
          <div className="card border-0 shadow-sm text-center p-5">
            <h5 className="fw-bold">
              No Tasks Yet
            </h5>

            <p className="text-muted">
              You haven't created any tasks yet.
            </p>

            <div>
              <button
                className="btn btn-dark"
                onClick={() => navigate("/create-task")}
              >
                Create Your First Task
              </button>
            </div>
          </div>
        )}

        {/* Tasks */}
        {!loading && tasks.length > 0 && (
          <div className="row g-4">

            {tasks.map((task) => (
              <div
                className="col-md-6 col-lg-4"
                key={task._id}
              >
                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body">

                    {/* Title */}
                    <h5 className="fw-bold mb-2">
                      {task.title}
                    </h5>

                    {/* Description */}
                    {task.description && (
                      <p className="text-muted small">
                        {task.description}
                      </p>
                    )}

                    {/* Priority */}
                    <span
                      className={`badge ${task.priority === "high"
                          ? "bg-danger"
                          : task.priority === "medium"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                    >
                      {task.priority}
                    </span>

                    {/* Status */}
                    <span className="badge bg-secondary ms-2">
                      {task.status}
                    </span>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">
                          Progress
                        </small>

                        <small className="fw-bold">
                          {task.progress || 0}%
                        </small>
                      </div>

                      <div className="progress mt-1">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${task.progress || 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                  </div>

                  {/* Card Footer */}
                  <div className="card-footer bg-white border-0">

                    <button
                      className="btn btn-outline-dark btn-sm w-100"
                      onClick={() =>
                        navigate(`/task/${task._id}`)
                      }
                    >
                      View Task
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>

    

    </div>
  );
}

export default MyTasks;