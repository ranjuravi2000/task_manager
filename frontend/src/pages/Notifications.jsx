import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../api/notificationApi";

function Notifications() {
  const navigate = useNavigate();


  // STATE

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // FETCH NOTIFICATIONS


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotifications();

      console.log("Notifications:", data);

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );

      // If token expired
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");

        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
        "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchNotifications();
  }, []);


  const handleMarkAsRead = async (
    notificationId
  ) => {
    try {
      await markNotificationAsRead(
        notificationId
      );

      // Update notification locally
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
              ...notification,
              isRead: true,
            }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to mark notification as read."
      );
    }
  };


  // DELETE NOTIFICATION

  const handleDelete = async (
    notificationId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) return;

    try {
      await deleteNotification(
        notificationId
      );

      // Remove notification---
      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error(
        "Error deleting notification:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to delete notification."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

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


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header showNav={true} />

        <main className="flex-grow-1 bg-light d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div
              className="spinner-border text-primary"
              role="status"
            />

            <p className="text-muted mt-3">
              Loading notifications...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <main className="flex-grow-1 bg-light py-4">
        <div className="container">

          {/* -------PAGE HEADER ---------*/}
          {/* PAGE HEADER */}
          <div className="mb-4">

            {/* Back to Dashboard */}
            <button
              className="btn btn-outline-dark btn-sm mb-3"
              onClick={() => navigate("/dashboard")}
            >
              ← Back to Dashboard
            </button>

            {/* Notification Title */}
            <div>
              <h2 className="fw-bold mb-1">
                🔔 Notifications
              </h2>

              <p className="text-muted mb-0">
                Stay updated with your Taskify activities.
              </p>
            </div>

          </div>

          {/*---------- ERROR -----*/}
          {error && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* NOTIFICATION SUMMARY */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">

                <div>
                  <strong>
                    Total Notifications
                  </strong>

                  <div className="text-muted">
                    {notifications.length}
                  </div>
                </div>

                <div className="text-end">
                  <strong>
                    Unread
                  </strong>

                  <div>
                    <span className="badge bg-danger">
                      {unreadCount}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/*---------- NO NOTIFICATIONS----- */}
          {notifications.length === 0 ? (
            <div className="card shadow-sm border-0">
              <div className="card-body text-center py-5">

                <div
                  style={{
                    fontSize: "55px",
                  }}
                >
                  🔔
                </div>

                <h5 className="fw-bold mt-3">
                  No notifications
                </h5>

                <p className="text-muted mb-0">
                  You don't have any
                  notifications yet.
                </p>

              </div>
            </div>
          ) : (
            <div>
              {notifications.map(
                (notification) => (
                  <div
                    key={notification._id}
                    className={`card shadow-sm border-0 mb-3 ${!notification.isRead
                      ? "border-start border-primary border-4"
                      : ""
                      }`}
                  >
                    <div className="card-body">

                      <div className="d-flex justify-content-between align-items-start gap-3">


                        <div className="d-flex gap-3">


                          <div
                            className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                            style={{
                              width: "45px",
                              height: "45px",
                              fontSize: "20px",
                              flexShrink: 0,
                            }}
                          >
                            🔔
                          </div>


                          <div>

                            <div className="d-flex align-items-center gap-2 flex-wrap">

                              <h6 className="fw-bold mb-0">
                                {notification.type ===
                                  "task_assigned"
                                  ? "Task Assigned"
                                  : "Notification"}
                              </h6>

                              {!notification.isRead && (
                                <span className="badge bg-danger">
                                  New
                                </span>
                              )}

                            </div>

                            <p className="mb-1 mt-2">
                              {
                                notification.message
                              }
                            </p>

                            {/* SENDER */}
                            {notification.sender && (
                              <small className="text-muted">
                                From:{" "}
                                <strong>
                                  {notification
                                    .sender
                                    .name ||
                                    notification
                                      .sender
                                      .username ||
                                    notification
                                      .sender
                                      .email ||
                                    "Unknown User"}
                                </strong>
                              </small>
                            )}

                            {/* TASK */}
                            {notification.task && (
                              <div className="mt-2">
                                <span className="badge bg-light text-dark border">
                                  📋{" "}
                                  {
                                    notification
                                      .task
                                      .title
                                  }
                                </span>
                              </div>
                            )}

                            {/* DATE */}
                            <small className="text-muted d-block mt-2">
                              {formatDate(
                                notification.createdAt
                              )}
                            </small>

                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="d-flex gap-2 flex-shrink-0">

                          {!notification.isRead && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                handleMarkAsRead(
                                  notification._id
                                )
                              }
                            >
                              ✓ Read
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                notification._id
                              )
                            }
                          >
                            🗑️
                          </button>

                        </div>

                      </div>

                    </div>
                  </div>
                )
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Notifications;