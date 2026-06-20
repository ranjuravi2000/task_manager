import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaRobot,
  FaArrowLeft,
  FaCheckCircle,
  FaClipboardList,
  FaBullseye,
  FaFolder,
  FaCalendarAlt,
  FaLightbulb,
  FaCheck,
  FaMapMarkedAlt,
  FaRocket,
  FaArrowRight,
} from "react-icons/fa";

function TaskPilotAI() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [task, setTask] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const myTasks = allTasks.filter(
      (t) =>
        t.status !== "Completed" &&
        (t.createdBy === currentUser.username ||
          t.assignedTo === currentUser.username ||
          (t.participants || []).includes(currentUser.username))
    );

    if (myTasks.length === 0) {
      setTask(null);
      return;
    }

    const priorityWeight = { High: 3, Medium: 2, Low: 1 };

    const scored = myTasks.map((t) => {
      const created = new Date(t.createdAt);
      const now = new Date();
      const pendingDays = Math.max(
        0,
        Math.floor((now - created) / (1000 * 60 * 60 * 24))
      );

      const due = t.dueDate ? new Date(t.dueDate) : null;
      const overdueDays = due
        ? Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)))
        : 0;
      const isOverdue = due ? now > due : false;

      const score =
        (priorityWeight[t.priority] || 1) * 10 +
        pendingDays +
        overdueDays * 2;

      return { ...t, pendingDays, overdueDays, isOverdue, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topTask = scored[0];

    setTask(topTask);
    setAnalysis(buildAnalysis(topTask));
  }, []);

  
  const buildAnalysis = (t) => {
    let risk = "Low Risk";
    if (t.isOverdue || (t.priority === "High" && t.pendingDays > 3)) {
      risk = "High Risk";
    } else if (t.pendingDays > 1) {
      risk = "Medium Risk";
    }

    const suggestions = [];

    if ((t.description || "").length > 60) {
      suggestions.push("Break task into smaller subtasks");
    } else {
      suggestions.push("Clarify task scope before starting");
    }

    if (!t.participants || t.participants.length <= 1) {
      suggestions.push("Invite a collaborator to speed things up");
    } else {
      suggestions.push("Sync with collaborators on current progress");
    }

    if (t.priority === "High") {
      suggestions.push("Allocate 1 focused hour today");
    } else {
      suggestions.push("Schedule a short work session this week");
    }

    if (t.isOverdue) {
      suggestions.push("Set a personal deadline buffer");
    } else {
      suggestions.push("Confirm due date is still realistic");
    }

    const category = t.category || "General";
    const recoveryPlan = [
      { day: "Day 1", label: `Plan ${category}` },
      { day: "Day 2", label: "Core Execution" },
      { day: "Day 3", label: "Review & Finish" },
    ];

    const estCompletion =
      risk === "High Risk" ? "3 Days" : risk === "Medium Risk" ? "2 Days" : "1 Day";

    const reasonParts = [];
    if (t.priority === "High") reasonParts.push("High Priority");
    if (t.isOverdue) reasonParts.push("Delayed");
    if (t.pendingDays > 3 && !t.isOverdue) reasonParts.push("Stalled");
    const reason = reasonParts.length > 0 ? reasonParts.join(" + ") : "Needs Attention";

    return { risk, suggestions, recoveryPlan, estCompletion, reason };
  };

  const getRiskBadgeClass = (risk) => {
    const map = {
      "High Risk": "badge bg-danger",
      "Medium Risk": "badge bg-warning text-dark",
      "Low Risk": "badge bg-success",
    };
    return map[risk] || "badge bg-secondary";
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-0">
                <FaRobot className="me-2 text-primary" />
                TaskPilot AI
              </h3>
              <p className="text-muted small mb-0">
                Intelligent Task Coach — Pending for {task ? task.pendingDays : 0} days
              </p>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              <FaArrowLeft className="me-1" />
              Back to Dashboard
            </button>
          </div>

          {!task ? (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5 text-muted">
                <h5>
                  <FaCheckCircle className="me-2 text-success" />
                  Nothing to coach right now
                </h5>
                <p className="mb-0">
                  All your tasks are completed or there's nothing pending. Great work!
                </p>
              </div>
            </div>
          ) : (
            <div className="row g-4">

              {/* ------Task Snapshot + Suggestions------- */}
              <div className="col-md-7">
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
                    <span>
                      <FaClipboardList className="me-2" />
                      Task Snapshot
                    </span>
                    <span className={getRiskBadgeClass(analysis.risk)}>
                      {analysis.risk}
                    </span>
                  </div>
                  <div className="card-body">
                    <h5 className="fw-bold mb-1">{task.title}</h5>
                    <p className="text-muted small mb-2">
                      Pending for {task.pendingDays} day{task.pendingDays === 1 ? "" : "s"}
                      {task.isOverdue && (
                        <span className="text-danger fw-semibold">
                          {" "}• Overdue by {task.overdueDays} day{task.overdueDays === 1 ? "" : "s"}
                        </span>
                      )}
                    </p>

                    <div style={{ fontSize: "13px" }}>
                      <div className="mb-1">
                        <strong><FaBullseye className="me-1" />Priority:</strong> {task.priority}
                      </div>
                      <div className="mb-1">
                        <strong><FaFolder className="me-1" />Category:</strong> {task.category || "N/A"}
                      </div>
                      <div>
                        <strong><FaCalendarAlt className="me-1" />Due Date:</strong> {task.dueDate || "Not set"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card shadow-sm">
                  <div className="card-header bg-white fw-semibold">
                    <FaLightbulb className="me-2" />
                    AI Suggestions
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      {analysis.suggestions.map((s, i) => (
                        <li key={i} className="mb-2">
                          <FaCheck className="text-success me-2" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/*-------------Recovery Plan and  Recommended Next------------- */}
              <div className="col-md-5">
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-white fw-semibold">
                    <FaMapMarkedAlt className="me-2" />
                    Recovery Plan
                  </div>
                  <div className="card-body">
                    <div className="row g-2 text-center mb-3">
                      {analysis.recoveryPlan.map((step, i) => (
                        <div className="col-4" key={i}>
                          <div className="border rounded py-2 px-1 h-100">
                            <div className="fw-bold small">{step.day}</div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              {step.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small fw-semibold">
                        EST. COMPLETION
                      </span>
                      <span className="fw-bold">{analysis.estCompletion}</span>
                    </div>
                  </div>
                </div>

                <div className="card shadow-sm border-primary">
                  <div className="card-header bg-white fw-semibold">
                    <FaRocket className="me-2" />
                    Recommended Next
                  </div>
                  <div className="card-body">
                    <h6 className="fw-bold mb-1">{task.title}</h6>
                    <p className="text-muted small mb-3">
                      Reason: {analysis.reason}
                    </p>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => navigate(`/task/${task.id}`)}
                    >
                      Start Now
                      <FaArrowRight className="ms-1" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default TaskPilotAI