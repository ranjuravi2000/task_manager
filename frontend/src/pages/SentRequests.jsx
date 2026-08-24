import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import {
  FaPaperPlane, FaUser, FaFlag, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaBan, FaArrowLeft, FaPlus,
} from "react-icons/fa";

function SentRequests() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
  );

  const [sentRequests, setSentRequests] =
    useState([]);

  const [tasks, setTasks] =
    useState([]);

  useEffect(() => {
    const allRequests =
      JSON.parse(
        localStorage.getItem(
          "collaborationRequests"
        )
      ) || [];

    const allTasks =
      JSON.parse(
        localStorage.getItem("tasks")
      ) || [];

    const myRequests =
      allRequests.filter(
        (req) =>
          req.fromUser ===
          currentUser.username
      );

    setSentRequests(myRequests);
    setTasks(allTasks);
  }, []);

  const cancelRequest = (
    requestId
  ) => {
    const allRequests =
      JSON.parse(
        localStorage.getItem(
          "collaborationRequests"
        )
      ) || [];

    const updated =
      allRequests.filter(
        (r) =>
          r.id !== requestId
      );

    localStorage.setItem(
      "collaborationRequests",
      JSON.stringify(updated)
    );

    setSentRequests(
      sentRequests.filter(
        (r) =>
          r.id !== requestId
      )
    );


  };

  const getTaskById = (
    taskId
  ) =>
    tasks.find(
      (t) =>
        t.id === taskId
    );

  const getPriorityBadge = (
    priority
  ) => {
    const map = {
      High: "danger",
      Medium: "warning",
      Low: "success",
    };

    return `badge bg-${map[priority] ||
      "secondary"
      }`;
  };

  const getStatusBadge = (
    status
  ) => {
    const map = {
      Pending:
        "badge bg-warning text-dark",
      Accepted:
        "badge bg-success",
      Rejected:
        "badge bg-danger",
    };

    return (
      map[status] ||
      "badge bg-secondary"
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100">

      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>
              <h3 className="fw-bold mb-0">
                <FaPaperPlane className="me-2 text-primary" />
                Sent Requests
              </h3>

              <p className="text-muted small mb-0">
                Collaboration invitations
                you've sent to others
              </p>
            </div>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() =>
                navigate(
                  "/dashboard"
                )
              }
            >
              <FaArrowLeft className="me-1" />
              Back to Dashboard
            </button>

          </div>

          {sentRequests.length ===
            0 ? (

            <div className="card shadow-sm">
              <div className="card-body text-center py-5 text-muted">

                <h5>
                  <FaPaperPlane className="me-2" />
                  No Sent Requests
                </h5>

                <p>
                  Invite collaborators
                  from the Create Task
                  page.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(
                      "/create-task"
                    )
                  }
                >
                  <FaPlus className="me-1" />
                  Create Task
                </button>

              </div>
            </div>

          ) : (

            <div className="row g-3">

              {sentRequests.map(
                (req) => {
                  const task =
                    getTaskById(
                      req.taskId
                    );

                  return (
                    <div
                      className="col-md-6"
                      key={req.id}
                    >
                      <div className="card shadow-sm h-100">

                        <div className="card-header d-flex justify-content-between align-items-center">

                          <span className="fw-semibold">
                            {task?.title ||
                              "Task not found"}
                          </span>

                          <span
                            className={getStatusBadge(
                              req.status
                            )}
                          >
                            {req.status}
                          </span>

                        </div>

                        <div
                          className="card-body"
                          style={{
                            fontSize:
                              "13px",
                          }}
                        >

                          <div className="mb-2">
                            <strong>
                              <FaUser className="me-1" />
                              Sent To:
                            </strong>{" "}
                            <span className="text-primary fw-semibold">
                              {
                                req.toUser
                              }
                            </span>
                          </div>

                          <div className="mb-2">
                            <strong>
                              <FaFlag className="me-1" />
                              Priority:
                            </strong>{" "}
                            <span
                              className={getPriorityBadge(
                                task?.priority
                              )}
                            >
                              {task?.priority ||
                                "N/A"}
                            </span>
                          </div>

                          <div className="mb-2">
                            <strong>
                              <FaCalendarAlt className="me-1" />
                              Due Date:
                            </strong>{" "}
                            {task?.dueDate ||
                              "Not set"}
                          </div>

                          <div className="mb-3">
                            <strong>
                              <FaClock className="me-1" />
                              Sent On:
                            </strong>{" "}
                            {new Date(
                              req.createdAt
                            ).toLocaleDateString()}
                          </div>

                          {req.status ===
                            "Pending" && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() =>
                                  cancelRequest(
                                    req.id
                                  )
                                }
                              >
                                <FaBan className="me-1" />
                                Cancel
                                Request
                              </button>
                            )}

                          {req.status ===
                            "Accepted" && (
                              <span className="text-success fw-semibold">
                                <FaCheckCircle className="me-1" />
                                Collaborator
                                joined the
                                task!
                              </span>
                            )}

                          {req.status ===
                            "Rejected" && (
                              <span className="text-danger fw-semibold">
                                <FaTimesCircle className="me-1" />
                                Request was
                                declined.
                              </span>
                            )}

                        </div>
                      </div>
                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>
      </div>

      <Footer />

    </div>
  );
}
export default SentRequests;