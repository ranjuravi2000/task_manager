import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaHandshake,FaArrowLeft,FaBell,FaInbox,FaClipboardList,FaUser,
  FaBullseye,FaCalendarAlt,FaFolder,FaCommentDots,FaCheck,FaTimes,FaEnvelope,FaFolderOpen,
} from "react-icons/fa";

function CollaborationRequests() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const allRequests = JSON.parse(localStorage.getItem("collaborationRequests")) || [];
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    // -------------showing requests sent TO current user-------//
    const myRequests = allRequests.filter(
      (req) => req.toUser === currentUser.username
    );

    setRequests(myRequests);
    setTasks(allTasks);
  }, []);

  const saveRequests = (updated) => {
    setRequests(updated);
    const allRequests = JSON.parse(localStorage.getItem("collaborationRequests")) || [];
    const others = allRequests.filter((r) => r.toUser !== currentUser.username);
    localStorage.setItem("collaborationRequests", JSON.stringify([...others, ...updated]));
  };

  const acceptRequest = (requestId) => {
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const request = requests.find((r) => r.id === requestId);

    // -----------Adding current user as participant in the task---------------
    const updatedTasks = allTasks.map((task) => {
      if (task.id === request.taskId) {
        const participants = task.participants || [];
        if (!participants.includes(currentUser.username)) {
          participants.push(currentUser.username);
        }
        return { ...task, participants, assignedTo: currentUser.username };
      }
      return task;
    });

    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    //---------------- Update request status----------------------------
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: "Accepted" } : r
    );
    saveRequests(updatedRequests);
  };

  const rejectRequest = (requestId) => {
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: "Rejected" } : r
    );
    saveRequests(updatedRequests);

  };

  const getPriorityBadge = (priority) => {
    const map = { High: "danger", Medium: "warning", Low: "success" };
    return `badge bg-${map[priority] || "secondary"}`;
  };

  const getStatusBadge = (status) => {
    const map = {
      Pending: "badge bg-warning text-dark",
      Accepted: "badge bg-success",
      Rejected: "badge bg-danger",
    };
    return map[status] || "badge bg-secondary";
  };

  const getTaskById = (taskId) =>
    tasks.find((t) => t.id === taskId);

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const resolvedRequests = requests.filter((r) => r.status !== "Pending");

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-0">
                <FaHandshake className="me-2 text-primary" />
                Collaboration Requests
              </h3>
              <p className="text-muted small mb-0">
                Task invitations sent to you by other users
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

          {/*----------------- Status---- */}
          <div className="row g-3 mb-4">
            {[
              { label: "Total Requests", value: requests.length, color: "primary" },
              { label: "Pending", value: pendingRequests.length, color: "warning" },
              { label: "Accepted", value: requests.filter((r) => r.status === "Accepted").length, color: "success" },
              { label: "Rejected", value: requests.filter((r) => r.status === "Rejected").length, color: "danger" },
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

          {/* ------------Pending Requests-------------------- */}
          <h5 className="fw-bold mb-3">
            <FaBell className="me-2 text-warning" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="badge bg-warning text-dark ms-2">
                {pendingRequests.length}
              </span>
            )}
          </h5>

          {pendingRequests.length === 0 ? (
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center py-5 text-muted">
                <h5>
                  <FaInbox className="me-2" />
                  No pending requests
                </h5>
                <p className="mb-0">You're all caught up!</p>
              </div>
            </div>
          ) : (
            <div className="row g-3 mb-4">
              {pendingRequests.map((req) => {
                const task = getTaskById(req.taskId);
                return (
                  <div className="col-md-6" key={req.id}>
                    <div className="card shadow-sm border-warning h-100">
                      <div className="card-header bg-warning bg-opacity-10 d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">
                          <FaClipboardList className="me-1" />
                          Task Invitation
                        </span>
                        <span className={getStatusBadge(req.status)}>{req.status}</span>
                      </div>
                      <div className="card-body">

                        <h5 className="fw-bold mb-1">
                          {task?.title || "Task not found"}
                        </h5>

                        <p className="text-muted small mb-3">
                          {task?.description || "No description"}
                        </p>

                        <div className="mb-3" style={{ fontSize: "13px" }}>
                          <div className="mb-1">
                            <strong><FaUser className="me-1" />Requested by:</strong>{" "}
                            <span className="text-primary fw-semibold">{req.fromUser}</span>
                          </div>
                          <div className="mb-1">
                            <strong><FaBullseye className="me-1" />Priority:</strong>{" "}
                            <span className={getPriorityBadge(task?.priority)}>
                              {task?.priority || "N/A"}
                            </span>
                          </div>
                          <div className="mb-1">
                            <strong><FaCalendarAlt className="me-1" />Due Date:</strong>{" "}
                            {task?.dueDate || "Not set"}
                          </div>
                          <div>
                            <strong><FaFolder className="me-1" />Category:</strong>{" "}
                            {task?.category || "N/A"}
                          </div>
                        </div>

                        {req.message && (
                          <div className="alert alert-info py-2 px-3 mb-3" style={{ fontSize: "13px" }}>
                            <FaCommentDots className="me-1" />
                            <strong>Message:</strong> {req.message}
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success flex-grow-1"
                            onClick={() => acceptRequest(req.id)}
                          >
                            <FaCheck className="me-1" />
                            Accept
                          </button>
                          <button
                            className="btn btn-danger flex-grow-1"
                            onClick={() => rejectRequest(req.id)}
                          >
                            <FaTimes className="me-1" />
                            Reject
                          </button>
                        </div>

                      </div>
                      <div className="card-footer text-muted" style={{ fontSize: "11px" }}>
                        <FaEnvelope className="me-1" />
                        Received: {new Date(req.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/*------------------------ Resolved Requests-------------------------- */}
          {resolvedRequests.length > 0 && (
            <>
              <h5 className="fw-bold mb-3">
                <FaFolderOpen className="me-2" />
                Past Requests
              </h5>
              <div className="row g-3">
                {resolvedRequests.map((req) => {
                  const task = getTaskById(req.taskId);
                  return (
                    <div className="col-md-6" key={req.id}>
                      <div className={`card shadow-sm h-100 ${req.status === "Accepted" ? "border-success" : "border-danger"}`}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="fw-bold mb-0">
                              {task?.title || "Task not found"}
                            </h6>
                            <span className={getStatusBadge(req.status)}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-muted small mb-1">
                            <FaUser className="me-1" />
                            From: <strong>{req.fromUser}</strong>
                          </p>
                          <p className="text-muted small mb-0">
                            <FaCalendarAlt className="me-1" />
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
export default CollaborationRequests