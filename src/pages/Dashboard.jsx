import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPlan, formatLimit } from "../data/plans";

function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ownershipFilter, setOwnershipFilter] = useState("All");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userPlan = currentUser?.plan || "free";
  const planInfo = getPlan(userPlan);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const myTasks = storedTasks.filter(
      (task) =>
        task.createdBy === currentUser.username ||
        task.assignedTo === currentUser.username ||
        (task.participants || []).includes(currentUser.username)
    );
    setTasks(myTasks);
  }, []);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    // Updating the tasks in localStorage
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const updatedAll = allTasks.map((t) => {
      const found = updatedTasks.find((u) => u.id === t.id);
      return found || t;
    });
    localStorage.setItem("tasks", JSON.stringify(updatedAll));
  };

  const deleteTask = (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!window.confirm(`Delete "${taskToDelete?.title}"?`)) return;
    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    localStorage.setItem(
      "tasks",
      JSON.stringify(allTasks.filter((t) => t.id !== id))
    );
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            status: task.status === "Completed" ? "Pending" : "Completed",
            progress: task.status === "Completed" ? 0 : 100,
          }
        : task
    );
    saveTasks(updatedTasks);
  };

  // -------------Status --------
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.status === "Pending" &&
      t.dueDate &&
      new Date(t.dueDate) < new Date()
  ).length;

  // Shared Tasks count-------
  const sharedTasks = tasks.filter(
    (t) =>
      t.createdBy !== currentUser.username &&
      (t.assignedTo === currentUser.username ||
        (t.participants || []).includes(currentUser.username))
  ).length;

  const myOwnTasks = tasks.filter(
    (t) => t.createdBy === currentUser.username
  ).length;

  // --------- Chart-----------//
  const chartData = [
    { name: "Completed", value: completedTasks },
    { name: "Pending", value: pendingTasks },
    { name: "Overdue", value: overdueTasks },
  ];
  const COLORS = ["#16a34a", "#d97706", "#dc2626"];

  // -----------Filtering -----------------//
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    
    let matchesOwnership = true;
    if (ownershipFilter === "My Tasks") {
      matchesOwnership = task.createdBy === currentUser.username;
    } else if (ownershipFilter === "Shared") {
      matchesOwnership =
        task.createdBy !== currentUser.username &&
        (task.assignedTo === currentUser.username ||
          (task.participants || []).includes(currentUser.username));
    }

    return matchesSearch && matchesPriority && matchesStatus && matchesOwnership;
  });

  const getPriorityBadge = (priority) => {
    const map = { High: "danger", Medium: "warning", Low: "success" };
    return `badge bg-${map[priority] || "secondary"}`;
  };

  const getStatusBadge = (status) =>
    status === "Completed" ? "badge bg-success" : "badge bg-secondary";

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          {/* -------------------- Plan ------------------*/}
          <div className="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-2">
            <span
              className={`border border-${planInfo.color} text-${planInfo.color} fw-semibold px-3 py-1`}
              style={{ fontSize: "12px", borderRadius: "20px", letterSpacing: "0.5px" }}
            >
              {planInfo.label.toUpperCase()} PLAN
            </span>
            {userPlan !== "ultimate" && (
              <button
                className="btn btn-sm btn-link text-decoration-none p-0"
                onClick={() => navigate("/pricing")}
              >
                Upgrade →
              </button>
            )}
          </div>
          <p className="text-muted mb-3" style={{ fontSize: "12px" }}>
            {totalTasks} / {formatLimit(userPlan)} tasks used
          </p>

          {/* ----------user dashborad status-------*/}
          <div className="row mb-4 g-3">
            {[
              { label: "Total Tasks",  value: totalTasks,      color: "primary" },
              { label: "My Tasks",     value: myOwnTasks,      color: "info"    },
              { label: "Shared",       value: sharedTasks,     color: "purple"  },
              { label: "Completed",    value: completedTasks,  color: "success" },
              { label: "Pending",      value: pendingTasks,    color: "warning" },
              { label: "Overdue",      value: overdueTasks,    color: "danger"  },
            ].map((stat) => (
              <div className="col-6 col-md-2" key={stat.label}>
                <div
                  className={`card text-center shadow-sm h-100`}
                  style={{
                    borderTop: `4px solid ${
                      stat.color === "purple" ? "#7c3aed" :
                      stat.color === "primary" ? "#0d6efd" :
                      stat.color === "info"    ? "#0dcaf0" :
                      stat.color === "success" ? "#16a34a" :
                      stat.color === "warning" ? "#d97706" :
                      "#dc2626"
                    }`
                  }}
                >
                  <div className="card-body py-3 px-2">
                    <h6
                      className="fw-semibold mb-1"
                      style={{
                        fontSize: "11px",
                        color:
                          stat.color === "purple" ? "#7c3aed" :
                          stat.color === "primary" ? "#0d6efd" :
                          stat.color === "info"    ? "#0891b2" :
                          stat.color === "success" ? "#16a34a" :
                          stat.color === "warning" ? "#d97706" :
                          "#dc2626"
                      }}
                    >
                      {stat.label}
                    </h6>
                    <h2 className="fw-bold mb-0">{stat.value}</h2>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* -------------Chart-----------*/}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="mb-3">📊 Task Analytics</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 16 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --------Action Buttons --------- */}
          <div className="mb-3 d-flex gap-2 flex-wrap">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/create-task")}
            >
              + Create Task
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/taskpilot")}
            >
               TaskPilot AI
            </button>
          </div>

          {/*----------TaskPilot---------*/}
          <div
            className="card shadow-sm mb-4 border-primary"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/taskpilot")}
          >
            <div className="card-body d-flex justify-content-between align-items-center py-3 bg-primary">
              <div>
                <h6 className="fw-bold mb-1 text-white">
                   TaskPilot AI — Intelligent Task Coach
                </h6>
                <p className="text-muted small mb-0">
                  Get AI-style suggestions and a recovery plan for your most at-risk task
                </p>
              </div>
              <span className="btn btn-sm btn-primary">Open →</span>
            </div>
          </div>

          {/*-------------- Search & Filter-------- */}
          <div className="row mb-3 g-2">
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder=" Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

           
            <div className="col-md-3">
              <select
                className="form-select"
                value={ownershipFilter}
                onChange={(e) => setOwnershipFilter(e.target.value)}
              >
                <option value="All">All Tasks</option>
                <option value="My Tasks">My Tasks</option>
                <option value="Shared">Shared With Me</option>
              </select>
            </div>

            <div className="col-md-3">
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

            <div className="col-md-3">
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

          
          {(ownershipFilter !== "All" || priorityFilter !== "All" || statusFilter !== "All" || search) && (
            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <small className="text-muted">Showing {filteredTasks.length} of {totalTasks} tasks</small>
              <button
                className="btn btn-sm btn-outline-secondary py-0"
                onClick={() => {
                  setSearch("");
                  setPriorityFilter("All");
                  setStatusFilter("All");
                  setOwnershipFilter("All");
                }}
              >
                ✕ Clear Filters
              </button>
            </div>
          )}

          {/* ----------------------Task Cards---------------------*/}
          <div className="row g-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h5>📭 No tasks found</h5>
                <p>
                  {tasks.length === 0
                    ? "Create a new task to get started!"
                    : "Try adjusting your filters."}
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isShared = task.createdBy !== currentUser.username;
                return (
                  <div className="col-md-6" key={task.id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-body d-flex flex-column">

                        {/*-------- Title ,Priority , Shared badge------ */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h5 className="card-title mb-0">{task.title}</h5>
                            {/* ------Shared task----*/}
                            {isShared && (
                              <span className="badge bg-info text-dark" style={{ fontSize: "10px" }}>
                                👥 Shared
                              </span>
                            )}
                          </div>
                          <span className={getPriorityBadge(task.priority)}>
                            {task.priority}
                          </span>
                        </div>

                        <p className="text-muted small mb-2">{task.description}</p>

                        <div className="mb-2" style={{ fontSize: "13px" }}>
                          {task.category && (
                            <span className="me-3">📁 {task.category}</span>
                          )}
                          {task.dueDate && (
                            <span className="me-3">📅 {task.dueDate}</span>
                          )}
                          <span className={getStatusBadge(task.status)}>
                            {task.status}
                          </span>
                        </div>

                        {/*--------- Progress Bar---------- */}
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <strong className="small">Progress</strong>
                            <small className="text-muted">{task.progress || 0}%</small>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className={`progress-bar ${
                                (task.progress || 0) === 100
                                  ? "bg-success"
                                  : "bg-primary"
                              }`}
                              role="progressbar"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* ----------team task------------ */}
                        {task.participants && task.participants.length > 1 && (
                          <div className="mb-2 d-flex align-items-center gap-1 flex-wrap">
                            <small className="text-muted me-1">👥 Team:</small>
                            {task.participants.slice(0, 4).map((p, i) => (
                              <span
                                key={i}
                                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                                title={p}
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  fontSize: "10px",
                                  fontWeight: "700",
                                }}
                              >
                                {p[0].toUpperCase()}
                              </span>
                            ))}
                            {task.participants.length > 4 && (
                              <span className="text-muted small">
                                +{task.participants.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          className="mb-3 mt-auto"
                          style={{ fontSize: "12px", color: "#6c757d" }}
                        >
                          <span className="me-3">
                            👤 Created by: <strong>{task.createdBy}</strong>
                          </span>
                          <span>
                            👥 Assigned to:{" "}
                            <strong>{task.assignedTo || "Not Assigned"}</strong>
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            className={`btn btn-sm ${
                              task.status === "Completed"
                                ? "btn-secondary"
                                : "btn-success"
                            }`}
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

                          {/* -----task delete -------*/}
                          {task.createdBy === currentUser.username && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteTask(task.id)}
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
export default Dashboard