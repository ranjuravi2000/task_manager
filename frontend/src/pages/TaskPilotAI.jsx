
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axiosInstance";

function TaskPilotAI() {
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // FETCH TASKPILOT ANALYSIS

  const fetchTaskPilotAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/taskpilot");

      console.log(
        "TaskPilot AI response:",
        response.data
      );

      setTask(response.data.task || null);
      setAnalysis(response.data.analysis || null);

    } catch (error) {
      console.error(
        "TaskPilot AI error:",
        error
      );

      // If token is invalid/expired
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
        "Failed to load TaskPilot AI analysis."
      );

    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchTaskPilotAnalysis();
  }, []);



  const getRiskBadgeClass = (risk) => {
    const map = {
      "High Risk": "badge bg-danger",
      "Medium Risk": "badge bg-warning text-dark",
      "Low Risk": "badge bg-success",
    };

    return map[risk] || "badge bg-secondary";
  };



  const getStatusBadgeClass = (status) => {
    const map = {
      pending: "badge bg-secondary",
      "in-progress": "badge bg-primary",
      completed: "badge bg-success",
    };

    return map[status] || "badge bg-secondary";
  };



  const getDeadlineStatus = () => {
    if (!task) return null;

    // OVERDUE
    if (task.isOverdue) {
      return {
        text: `OVERDUE BY ${task.overdueDays} DAY${task.overdueDays === 1
            ? ""
            : "S"
          }`,
        className: "text-danger",
      };
    }

    // DUE TODAY
    if (task.isDueToday) {
      return {
        text: "DUE TODAY",
        className: "text-warning",
      };
    }

    // DUE TOMORROW
    if (task.daysUntilDue === 1) {
      return {
        text: "DUE TOMORROW",
        className: "text-warning",
      };
    }

    // UPCOMING
    if (
      task.daysUntilDue !== null &&
      task.daysUntilDue > 1
    ) {
      return {
        text: `DUE IN ${task.daysUntilDue} DAYS`,
        className: "text-primary",
      };
    }

    // NO DEADLINE
    return {
      text: "NO DEADLINE",
      className: "text-muted",
    };
  };


  return (
    <div className="d-flex flex-column min-vh-100">

      

      <Header showNav={true} />


      <div className="flex-grow-1 bg-light py-4">

        <div className="container">

         
          <div className="mb-4">

            <button
              type="button"
              className="btn btn-outline-dark btn-sm mb-3"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              ← Back to Dashboard
            </button>


            <div className="d-flex justify-content-between align-items-start">

              <div>

                <h3 className="fw-bold mb-1">
                  🤖 TaskPilot AI
                </h3>

                <p className="text-muted small mb-0">

                  Intelligent Task Coach

                  {task &&
                    ` — Pending for ${task.pendingDays
                    } day${task.pendingDays === 1
                      ? ""
                      : "s"
                    }`}

                </p>

              </div>


              {/* REFRESH BUTTON */}

              {!loading && task && (
                <div className="d-flex gap-2 flex-wrap">

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() =>
                      navigate("/taskpilot/history")
                    }
                  >
                    🕘 History
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={fetchTaskPilotAnalysis}
                  >
                    🔄 Refresh Analysis
                  </button>

                </div>
              )}

            </div>

          </div>



          {loading && (

            <div className="card shadow-sm">

              <div className="card-body text-center py-5">

                <div className="spinner-border text-primary mb-3"></div>

                <h5 className="fw-semibold">
                  TaskPilot is analyzing your tasks...
                </h5>

                <p className="text-muted mb-0">
                  Finding the task that needs
                  your attention most.
                </p>

              </div>

            </div>

          )}



          {!loading && error && (

            <div className="card shadow-sm">

              <div className="card-body text-center py-5">

                <div className="text-danger fs-1 mb-2">
                  ⚠️
                </div>

                <h5 className="fw-bold">
                  Unable to load TaskPilot
                </h5>

                <p className="text-muted">
                  {error}
                </p>

                <button
                  className="btn btn-primary"
                  onClick={
                    fetchTaskPilotAnalysis
                  }
                >
                  Try Again
                </button>

              </div>

            </div>

          )}


          {!loading &&
            !error &&
            !task && (

              <div className="card shadow-sm">

                <div className="card-body text-center py-5 text-muted">

                  <div className="fs-1 mb-2">
                    ✅
                  </div>

                  <h5>
                    Nothing to coach right now
                  </h5>

                  <p className="mb-0">
                    All your tasks are completed
                    or there's nothing pending.
                    Great work!
                  </p>

                </div>

              </div>

            )}


          {/* --------------------------------------------------
              TASKPILOT RESULT
          -------------------------------------------------- */}

          {!loading &&
            !error &&
            task &&
            analysis && (

              <div className="row g-4">



                <div className="col-md-7">


                  {/* --------------------------------------------------
                      TASK SNAPSHOT
                  -------------------------------------------------- */}

                  <div className="card shadow-sm mb-4">

                    <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">

                      <span>
                        📋 Task Snapshot
                      </span>

                      <span
                        className={getRiskBadgeClass(
                          analysis.risk
                        )}
                      >
                        {analysis.risk}
                      </span>

                    </div>


                    <div className="card-body">

                      {/* TASK TITLE */}

                      <h5 className="fw-bold mb-1">
                        {task.title}
                      </h5>


                      {/* TASK STATUS */}

                      <div className="mb-2">

                        <span
                          className={getStatusBadgeClass(
                            task.status
                          )}
                        >
                          {task.status ===
                            "in-progress"
                            ? "In Progress"
                            : task.status
                              ?.charAt(0)
                              .toUpperCase() +
                            task.status?.slice(
                              1
                            )}
                        </span>

                      </div>


                      {/* PENDING / OVERDUE */}

                      <p className="text-muted small mb-3">

                        Pending for{" "}
                        {task.pendingDays} day
                        {task.pendingDays === 1
                          ? ""
                          : "s"}


                        {task.isOverdue && (

                          <span className="text-danger fw-semibold">

                            {" "}
                            • Overdue by{" "}
                            {task.overdueDays} day
                            {task.overdueDays ===
                              1
                              ? ""
                              : "s"}

                          </span>

                        )}

                      </p>


                      {/* TASK INFORMATION */}

                      <div
                        style={{
                          fontSize: "13px",
                        }}
                      >

                        {/* PRIORITY */}

                        <div className="mb-1">

                          <strong>
                            🎯 Priority:
                          </strong>{" "}

                          {task.priority}

                        </div>


                        {/* CATEGORY */}

                        <div className="mb-1">

                          <strong>
                            📁 Category:
                          </strong>{" "}

                          {task.category ||
                            "N/A"}

                        </div>


                        {/* DUE DATE */}

                        <div className="mb-1">

                          <strong>
                            📅 Due Date:
                          </strong>{" "}

                          {task.dueDate
                            ? new Date(
                              task.dueDate
                            ).toLocaleDateString()
                            : "Not set"}

                        </div>


                        {/* DEADLINE STATUS */}

                        {getDeadlineStatus() && (

                          <div className="mt-2 mb-2">

                            <span
                              className={`fw-bold small ${getDeadlineStatus()
                                  .className
                                }`}
                            >
                              {getDeadlineStatus()
                                .text}
                            </span>

                          </div>

                        )}


                        {/* PROGRESS */}

                        <div>

                          <strong>
                            📊 Progress:
                          </strong>{" "}

                          {task.progress || 0}%

                        </div>

                      </div>


                      {/* PROGRESS BAR */}

                      <div className="progress mt-3">

                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${task.progress ||
                              0
                              }%`,
                          }}
                        >
                          {task.progress || 0}%
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* --------------------------------------------------
                      AI SUGGESTIONS
                  -------------------------------------------------- */}

                  <div className="card shadow-sm">

                    <div className="card-header bg-white fw-semibold">
                      💡 AI Suggestions
                    </div>

                    <div className="card-body">

                      <ul className="list-unstyled mb-0">

                        {analysis.suggestions?.map(
                          (
                            suggestion,
                            index
                          ) => (

                            <li
                              key={index}
                              className="mb-2"
                            >

                              <span className="text-success me-2">
                                ✓
                              </span>

                              {suggestion}

                            </li>

                          )
                        )}

                      </ul>

                    </div>

                  </div>

                </div>


                <div className="col-md-5">


                  {/* --------------------------------------------------
                      RECOVERY PLAN
                  -------------------------------------------------- */}

                  <div className="card shadow-sm mb-4">

                    <div className="card-header bg-white fw-semibold">
                      🗺️ Recovery Plan
                    </div>

                    <div className="card-body">

                      <div className="row g-2 text-center mb-3">

                        {analysis.recoveryPlan?.map(
                          (
                            step,
                            index
                          ) => (

                            <div
                              className="col-4"
                              key={index}
                            >

                              <div className="border rounded py-2 px-1 h-100">

                                <div className="fw-bold small">
                                  {step.day}
                                </div>

                                <div
                                  className="text-muted"
                                  style={{
                                    fontSize:
                                      "11px",
                                  }}
                                >
                                  {step.label}
                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>


                      {/* ESTIMATED COMPLETION */}

                      <div className="d-flex justify-content-between align-items-center">

                        <span className="text-muted small fw-semibold">
                          EST. COMPLETION
                        </span>

                        <span className="fw-bold">
                          {
                            analysis.estCompletion
                          }
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* --------------------------------------------------
                      RECOMMENDED NEXT
                  -------------------------------------------------- */}

                  <div className="card shadow-sm border-primary">

                    <div className="card-header bg-white fw-semibold">
                      🚀 Recommended Next
                    </div>

                    <div className="card-body">

                      <h6 className="fw-bold mb-1">
                        {task.title}
                      </h6>

                      <p className="text-muted small mb-3">
                        Reason:{" "}
                        {analysis.reason}
                      </p>

                      <button
                        className="btn btn-primary w-100"
                        onClick={() =>
                          navigate(
                            `/task/${task._id}`
                          )
                        }
                      >
                        Start Now →
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

export default TaskPilotAI;
