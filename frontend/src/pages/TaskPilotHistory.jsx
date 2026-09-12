
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axiosInstance";

function TaskPilotHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH TASKPILOT HISTORY
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/taskpilot/history"
      );

      console.log(
        "TaskPilot History:",
        response.data
      );

      setHistory(response.data.history || []);
    } catch (error) {
      console.error(
        "Error fetching TaskPilot history:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load TaskPilot history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // RISK BADGE
  const getRiskBadgeClass = (risk) => {
    if (risk === "High Risk") {
      return "badge bg-danger";
    }

    if (risk === "Medium Risk") {
      return "badge bg-warning text-dark";
    }

    if (risk === "Low Risk") {
      return "badge bg-success";
    }

    return "badge bg-secondary";
  };

  // STATUS BADGE
  const getStatusBadgeClass = (status) => {
    if (status === "completed") {
      return "badge bg-success";
    }

    if (status === "in-progress") {
      return "badge bg-primary";
    }

    return "badge bg-secondary";
  };

  // FORMAT STATUS
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <main className="flex-grow-1 bg-light py-4">
        <div className="container">

          {/* PAGE HEADER */}
          <div className="mb-4">

            <button
              className="btn btn-outline-dark btn-sm mb-3"
              onClick={() =>
                navigate("/taskpilot")
              }
            >
              ← Back to TaskPilot
            </button>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

              <div>
                <h3 className="fw-bold mb-1">
                  🤖 TaskPilot History
                </h3>

                <p className="text-muted mb-0">
                  View your previous AI task
                  analyses and recommendations.
                </p>
              </div>

              <button
                className="btn btn-outline-primary btn-sm"
                onClick={fetchHistory}
                disabled={loading}
              >
                🔄 Refresh History
              </button>

            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">

                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />

                <h5 className="fw-semibold">
                  Loading TaskPilot history...
                </h5>

                <p className="text-muted mb-0">
                  Fetching your previous AI
                  analyses.
                </p>

              </div>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">

                <div className="text-danger fs-1 mb-2">
                  ⚠️
                </div>

                <h5 className="fw-bold">
                  Unable to load history
                </h5>

                <p className="text-muted">
                  {error}
                </p>

                <button
                  className="btn btn-primary"
                  onClick={fetchHistory}
                >
                  Try Again
                </button>

              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            history.length === 0 && (
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">

                  <div className="fs-1 mb-2">
                    🤖
                  </div>

                  <h5 className="fw-bold">
                    No TaskPilot history yet
                  </h5>

                  <p className="text-muted mb-3">
                    TaskPilot analysis results will
                    appear here after you use the AI
                    coach.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate("/taskpilot")
                    }
                  >
                    Open TaskPilot →
                  </button>

                </div>
              </div>
            )}

          {/* HISTORY LIST */}
          {!loading &&
            !error &&
            history.length > 0 && (
              <div className="row g-4">

                {history.map((item) => (
                  <div
                    className="col-md-6"
                    key={item._id}
                  >

                    <div className="card shadow-sm border-0 h-100">

                      {/* CARD HEADER */}
                      <div className="card-header bg-white d-flex justify-content-between align-items-center">

                        <span className="fw-semibold">
                          🤖 TaskPilot Analysis
                        </span>

                        <span
                          className={getRiskBadgeClass(
                            item.risk
                          )}
                        >
                          {item.risk}
                        </span>

                      </div>

                      {/* CARD BODY */}
                      <div className="card-body">

                        <h5 className="fw-bold mb-1">
                          {item.taskTitle}
                        </h5>

                        <small className="text-muted">
                          Analyzed{" "}
                          {formatDate(
                            item.createdAt
                          )}
                        </small>

                        <hr />

                        {/* TASK INFO */}
                        <div className="row g-2 mb-3">

                          <div className="col-4">
                            <div className="border rounded p-2 text-center h-100">
                              <small className="text-muted d-block">
                                Progress
                              </small>

                              <strong>
                                {item.progress ?? 0}%
                              </strong>
                            </div>
                          </div>

                          <div className="col-4">
                            <div className="border rounded p-2 text-center h-100">
                              <small className="text-muted d-block">
                                Status
                              </small>

                              <span
                                className={getStatusBadgeClass(
                                  item.status
                                )}
                              >
                                {formatStatus(
                                  item.status
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="col-4">
                            <div className="border rounded p-2 text-center h-100">
                              <small className="text-muted d-block">
                                Priority
                              </small>

                              <strong className="text-capitalize">
                                {item.priority}
                              </strong>
                            </div>
                          </div>

                        </div>

                        {/* REASON */}
                        <div className="mb-3">

                          <small className="text-muted fw-semibold">
                            AI Reason
                          </small>

                          <p className="small mb-0 mt-1">
                            {item.reason ||
                              "No reason provided."}
                          </p>

                        </div>

                        {/* SUGGESTIONS */}
                        {item.suggestions?.length >
                          0 && (
                          <div className="mb-3">

                            <small className="text-muted fw-semibold">
                              Suggestions
                            </small>

                            <ul className="small mb-0 mt-1 ps-3">
                              {item.suggestions
                                .slice(0, 2)
                                .map(
                                  (
                                    suggestion,
                                    index
                                  ) => (
                                    <li
                                      key={index}
                                      className="mb-1"
                                    >
                                      {suggestion}
                                    </li>
                                  )
                                )}
                            </ul>

                          </div>
                        )}

                        {/* COMPLETION */}
                        <div className="d-flex justify-content-between align-items-center mb-3">

                          <span className="text-muted small">
                            Estimated Completion
                          </span>

                          <strong className="small">
                            {item.estCompletion ||
                              "Not available"}
                          </strong>

                        </div>

                        {/* VIEW TASK */}
                        {item.task?._id && (
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={() =>
                              navigate(
                                `/task/${item.task._id}`
                              )
                            }
                          >
                            View Task →
                          </button>
                        )}

                      </div>
                    </div>

                  </div>
                ))}

              </div>
            )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TaskPilotHistory;
