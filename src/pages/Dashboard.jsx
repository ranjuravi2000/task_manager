import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const myTasks = storedTasks.filter(
      (task) =>
        task.createdBy === currentUser.username ||
        task.assignedTo === currentUser.username
    );
    setTasks(myTasks);
  }, []);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, status: task.status === "Completed" ? "Pending" : "Completed" }
        : task
    );
    saveTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchesStatus = statusFilter === "All" || task.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = tasks.filter(
    (t) => t.status === "Pending" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const getPriorityBadge = (priority) => {
    const map = { High: "danger", Medium: "warning", Low: "success" };
    return `badge bg-${map[priority] || "secondary"}`;
  };

  const getStatusBadge = (status) => {
    return status === "Completed" ? "badge bg-success" : "badge bg-secondary";
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* Header with nav */}
      <Header showNav={true} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          {/* Stats */}
          <div className="row mb-4 g-3">
            {[
              { label: "Total Tasks", value: totalTasks, color: "primary" },
              { label: "Completed", value: completedTasks, color: "success" },
              { label: "Pending", value: pendingTasks, color: "warning" },
              { label: "Overdue", value: overdueTasks, color: "danger" },
            ].map((stat) => (
              <div className="col-6 col-md-3" key={stat.label}>
                <div className={`card border-${stat.color} text-center shadow-sm`}>
                  <div className="card-body py-3">
                    <h6 className={`text-${stat.color} fw-semibold mb-1`}>{stat.label}</h6>
                    <h2 className="fw-bold mb-0">{stat.value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Task Button */}
          <div className="mb-3">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/create-task")}
            >
              + Create Task
            </button>
          </div>

          {/* Search & Filters */}
          <div className="row mb-4 g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="row g-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>📭 No tasks found</h5>
                <p>Create a new task to get started!</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div className="col-md-6" key={task.id}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{task.title}</h5>
                        <span className={getPriorityBadge(task.priority)}>
                          {task.priority}
                        </span>
                      </div>

                      <p className="text-muted small mb-2">{task.description}</p>

                      <div className="mb-2" style={{ fontSize: "13px" }}>
                        <span className="me-3">📁 {task.category}</span>
                        <span className="me-3">📅 {task.dueDate}</span>
                        <span className={getStatusBadge(task.status)}>{task.status}</span>
                      </div>

                      <div className="mb-3" style={{ fontSize: "12px", color: "#6c757d" }}>
                        <span className="me-3">👤 Created by: {task.createdBy}</span>
                        <span>👥 Assigned to: {task.assignedTo || "Not Assigned"}</span>
                      </div>

                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className={`btn btn-sm ${task.status === "Completed" ? "btn-secondary" : "btn-success"}`}
                          onClick={() => toggleComplete(task.id)}
                        >
                          {task.status === "Completed" ? "↩ Undo" : "✓ Complete"}
                        </button>

                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => navigate(`/task/${task.id}`)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteTask(task.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Dashboard