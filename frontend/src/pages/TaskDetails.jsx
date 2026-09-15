import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import API from "../api/axiosInstance";

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();


  // STATE
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [commentText, setCommentText] = useState("");

  // -----------Current logged-in user-----//
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const currentUserId =
    currentUser?._id || currentUser?.id || null;


  // EDIT FORM
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    category: "General",
    progress: 0,
    assignedTo: "",
    participants: [],
  });


  // --------FETCH TASK-----------//
  const fetchTask = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/tasks/${id}`);

      console.log("Task details:", response.data);

      const taskData = response.data;

      setTask(taskData);

      //------- Convert backend date to input date format-------//
      let formattedDueDate = "";

      if (taskData.dueDate) {
        formattedDueDate =
          new Date(taskData.dueDate)
            .toISOString()
            .split("T")[0];
      }

      setFormData({
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status || "pending",
        priority: taskData.priority || "medium",
        dueDate: formattedDueDate,
        category: taskData.category || "General",
        progress: taskData.progress ?? 0,
        assignedTo:
          taskData.assignedTo?._id ||
          taskData.assignedTo ||
          "",
        participants:
          taskData.participants?.map(
            (participant) =>
              participant?._id || participant
          ) || [],
      });
    } catch (error) {
      console.error(
        "Error fetching task:",
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
        "Failed to load task."
      );
    } finally {
      setLoading(false);
    }
  };

  // fetch users----//

  const fetchUsers = async () => {
    try {
      const response = await API.get("/users");

      console.log("Users:", response.data);

      setUsers(response.data.users || []);
    } catch (error) {
      console.error(
        "Error fetching users:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        navigate("/login");
      }
    }
  };

  // fetch comments  //

  const fetchComments = async () => {
    try {
      const response = await API.get(
        `/tasks/${id}/comments`
      );

      console.log(
        "Comments:",
        response.data
      );

      setComments(
        response.data.comments || []
      );
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        navigate("/login");
      }
    }
  };


  useEffect(() => {
    if (!id) return;

    fetchTask();
    fetchUsers();
    fetchComments();
  }, [id]);



  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // PARTICIPANT HANDLER
  const handleParticipantChange = (e) => {
    const selectedOptions =
      Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );

    setFormData((prev) => ({
      ...prev,
      participants: selectedOptions,
    }));
  };

  //progress handler
  const handleProgressChange = (e) => {
    let value = Number(e.target.value);

    if (value < 0) value = 0;
    if (value > 100) value = 100;

    setFormData((prev) => ({
      ...prev,
      progress: value,
    }));
  };


  // STATUS HANDLER
  const handleStatusChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      status: value,
      progress:
        value === "completed"
          ? 100
          : prev.progress,
    }));
  };


  // SAVE TASK
  const handleUpdateTask = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        category:
          formData.category.trim() || "General",
        progress: Number(formData.progress),
        assignedTo:
          formData.assignedTo || null,
        participants:
          formData.participants || [],
      };

      const response = await API.put(
        `/tasks/${id}`,
        updateData
      );

      console.log(
        "Task updated:",
        response.data
      );

      setTask(response.data.task);

      // Update form with backend response
      const updatedTask =
        response.data.task;

      setFormData({
        title: updatedTask.title || "",
        description:
          updatedTask.description || "",
        status:
          updatedTask.status || "pending",
        priority:
          updatedTask.priority || "medium",
        dueDate: updatedTask.dueDate
          ? new Date(updatedTask.dueDate)
            .toISOString()
            .split("T")[0]
          : "",
        category:
          updatedTask.category || "General",
        progress:
          updatedTask.progress ?? 0,
        assignedTo:
          updatedTask.assignedTo?._id ||
          updatedTask.assignedTo ||
          "",
        participants:
          updatedTask.participants?.map(
            (participant) =>
              participant?._id || participant
          ) || [],
      });

      setSuccessMessage(
        "Task updated successfully!"
      );

      // Automatically hide success message
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Error updating task:",
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
        "Failed to update task."
      );
    } finally {
      setSaving(false);
    }
  };


  // ----------ADD COMMENT----//
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setCommentLoading(true);
      setError("");

      const response = await API.post(
        `/tasks/${id}/comments`,
        {
          text: commentText.trim(),
        }
      );

      console.log(
        "Comment added:",
        response.data
      );

      setComments((prev) => [
        ...prev,
        response.data.comment,
      ]);

      setCommentText("");
    } catch (error) {
      console.error(
        "Error adding comment:",
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
        "Failed to add comment."
      );
    } finally {
      setCommentLoading(false);
    }
  };


  // DELETE COMMENT
  const handleDeleteComment = async (
    commentId
  ) => {
    if (!commentId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) return;

    try {
      await API.delete(
        `/tasks/${id}/comments/${commentId}`
      );

      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment._id !== commentId
        )
      );
    } catch (error) {
      console.error(
        "Error deleting comment:",
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
        "Failed to delete comment."
      );
    }
  };


  // DELETE TASK
  const handleDeleteTask = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await API.delete(`/tasks/${id}`);

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Error deleting task:",
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
        "Failed to delete task."
      );
    } finally {
      setDeleting(false);
    }
  };

  // SOCIAL MEDIA SHARING

  const getShareUrl = () => {
    return window.location.href;
  };

  const getShareMessage = () => {
    return `Task: ${task.title}
Priority: ${task.priority}
Status: ${formatStatus(task.status)}
Progress: ${task.progress ?? 0}%

View this task in Taskify:
${getShareUrl()}`;
  };

  // WhatsApp
  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(getShareMessage());

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank"
    );
  };

  // LinkedIn
  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(getShareUrl());

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    );
  };

  // Facebook
  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

  // X / Twitter
  const shareOnX = () => {
    const message = encodeURIComponent(
      `Check out this Taskify task: ${task.title}`
    );

    const url = encodeURIComponent(getShareUrl());

    window.open(
      `https://twitter.com/intent/tweet?text=${message}&url=${url}`,
      "_blank"
    );
  };

  // Copy task link
  const copyTaskLink = async () => {
    try {
      await navigator.clipboard.writeText(
        getShareUrl()
      );

      setSuccessMessage(
        "Task link copied to clipboard!"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Failed to copy task link:",
        error
      );

      setError(
        "Failed to copy task link."
      );
    }
  };
  // HELPER FUNCTIONS
  const getUserName = (user) => {
    if (!user) return "Unknown User";

    return (
      user.username ||
      user.name ||
      user.email ||
      "Unknown User"
    );
  };

  const getUserId = (user) => {
    if (!user) return null;

    if (typeof user === "object") {
      return user._id || null;
    }

    return user;
  };

  const formatStatus = (status) => {
    if (!status) return "";

    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    if (status === "completed") {
      return "badge bg-success";
    }

    if (status === "in-progress") {
      return "badge bg-primary";
    }

    return "badge bg-secondary";
  };

  const getPriorityClass = (priority) => {
    if (priority === "high") {
      return "badge bg-danger";
    }

    if (priority === "medium") {
      return "badge bg-warning text-dark";
    }

    return "badge bg-success";
  };
  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header showNav={true} />

        <div className="flex-grow-1 bg-light d-flex justify-content-center align-items-center">
          <div className="text-center">
            <div
              className="spinner-border text-primary"
              role="status"
            />

            <p className="text-muted mt-3">
              Loading task...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Header showNav={true} />

        <div className="flex-grow-1 bg-light d-flex justify-content-center align-items-center">
          <div className="text-center">
            <h4>Task not found</h4>

            <p className="text-muted">
              {error ||
                "The task could not be loaded."}
            </p>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }


  // PERMISSIONS
  const createdById = getUserId(
    task.createdBy
  );

  const assignedToId = getUserId(
    task.assignedTo
  );

  const participantIds =
    (task.participants || []).map(
      (participant) =>
        getUserId(participant)
    );

  const isCreator =
    createdById === currentUserId;

  const isAssignedUser =
    assignedToId === currentUserId;

  const isParticipant =
    participantIds.includes(
      currentUserId
    );

  const canEdit =
    isCreator ||
    isAssignedUser ||
    isParticipant;



  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <main className="flex-grow-1 bg-light py-4">
        <div className="container">



          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

            <div className="d-flex gap-2 flex-wrap">

              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </button>

              <button
                className="btn btn-outline-primary"
                onClick={() => navigate("/taskpilot")}
              >
                🤖 Back to TaskPilot
              </button>

              <div className="position-relative">

                <button
                  className="btn btn-outline-success"
                  onClick={() =>
                    setShowShareMenu(!showShareMenu)
                  }
                >
                  🔗 Share Task
                </button>

                {showShareMenu && (
                  <div
                    className="position-absolute bg-white border rounded shadow p-3 mt-2"
                    style={{
                      minWidth: "220px",
                      zIndex: 1000,
                    }}
                  >

                    <h6 className="fw-bold mb-3">
                      Share this task
                    </h6>

                    <button
                      className="btn btn-success w-100 mb-2"
                      onClick={shareOnWhatsApp}
                    >
                      💬 WhatsApp
                    </button>

                    <button
                      className="btn btn-primary w-100 mb-2"
                      onClick={shareOnLinkedIn}
                    >
                      💼 LinkedIn
                    </button>

                    <button
                      className="btn btn-primary w-100 mb-2"
                      onClick={shareOnFacebook}
                    >
                      📘 Facebook
                    </button>

                    <button
                      className="btn btn-dark w-100 mb-2"
                      onClick={shareOnX}
                    >
                      𝕏 X (Twitter)
                    </button>

                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={copyTaskLink}
                    >
                      🔗 Copy Task Link
                    </button>

                  </div>
                )}

              </div>

            </div>

            {isCreator && (
              <button
                className="btn btn-danger"
                onClick={handleDeleteTask}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "🗑️ Delete Task"}
              </button>
            )}

          </div>


          {error && (
            <div
              className="alert alert-danger"
              role="alert"
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              className="alert alert-success"
              role="alert"
            >
              ✓ {successMessage}
            </div>
          )}

          <div className="row g-4">

            <div className="col-lg-8">

              {/* TASK INFORMATION */}

              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">

                    <div>
                      <h3 className="fw-bold mb-2">
                        {task.title}
                      </h3>

                      <div className="d-flex gap-2 flex-wrap">

                        <span
                          className={getStatusClass(
                            task.status
                          )}
                        >
                          {formatStatus(
                            task.status
                          )}
                        </span>

                        <span
                          className={getPriorityClass(
                            task.priority
                          )}
                        >
                          {task.priority
                            ?.charAt(0)
                            .toUpperCase() +
                            task.priority?.slice(
                              1
                            )}
                        </span>

                        {task.category && (
                          <span className="badge bg-light text-dark border">
                            📁 {task.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-muted small">
                      Created{" "}
                      {formatDate(
                        task.createdAt
                      )}
                    </span>
                  </div>

                  <hr />

                  <h6 className="fw-bold">
                    Description
                  </h6>

                  <p className="text-muted">
                    {task.description ||
                      "No description provided."}
                  </p>

                  <div className="row mt-4">

                    <div className="col-md-4 mb-3">
                      <small className="text-muted d-block">
                        Created By
                      </small>

                      <strong>
                        {getUserName(
                          task.createdBy
                        )}
                      </strong>
                    </div>

                    <div className="col-md-4 mb-3">
                      <small className="text-muted d-block">
                        Assigned To
                      </small>

                      <strong>
                        {getUserName(
                          task.assignedTo
                        )}
                      </strong>
                    </div>

                    <div className="col-md-4 mb-3">
                      <small className="text-muted d-block">
                        Due Date
                      </small>

                      <strong>
                        {formatDate(
                          task.dueDate
                        )}
                      </strong>
                    </div>

                  </div>

                  {/* PROGRESS */}

                  <div className="mt-3">

                    <div className="d-flex justify-content-between mb-2">
                      <strong>
                        Progress
                      </strong>

                      <span className="fw-semibold">
                        {task.progress ?? 0}%
                      </span>
                    </div>

                    <div
                      className="progress"
                      style={{
                        height: "12px",
                      }}
                    >
                      <div
                        className={`progress-bar ${task.progress === 100
                          ? "bg-success"
                          : "bg-primary"
                          }`}
                        role="progressbar"
                        style={{
                          width: `${task.progress ?? 0
                            }%`,
                        }}
                      />
                    </div>

                  </div>

                </div>
              </div>


              {/* EDIT TASK */}
              {canEdit && (
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-4">

                    <h4 className="fw-bold mb-4">
                      ✏️ Edit Task
                    </h4>

                    <form
                      onSubmit={
                        handleUpdateTask
                      }
                    >

                      {/* TITLE */}

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Title
                        </label>

                        <input
                          type="text"
                          name="title"
                          className="form-control"
                          value={
                            formData.title
                          }
                          onChange={
                            handleChange
                          }
                          required
                        />
                      </div>

                      {/* DESCRIPTION */}

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Description
                        </label>

                        <textarea
                          name="description"
                          className="form-control"
                          rows="4"
                          value={
                            formData.description
                          }
                          onChange={
                            handleChange
                          }
                        />
                      </div>

                      <div className="row">

                        {/* STATUS */}

                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">
                            Status
                          </label>

                          <select
                            name="status"
                            className="form-select"
                            value={
                              formData.status
                            }
                            onChange={
                              handleStatusChange
                            }
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="in-progress">
                              In Progress
                            </option>

                            <option value="completed">
                              Completed
                            </option>
                          </select>
                        </div>

                        {/* PRIORITY */}

                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">
                            Priority
                          </label>

                          <select
                            name="priority"
                            className="form-select"
                            value={
                              formData.priority
                            }
                            onChange={
                              handleChange
                            }
                          >
                            <option value="low">
                              Low
                            </option>

                            <option value="medium">
                              Medium
                            </option>

                            <option value="high">
                              High
                            </option>
                          </select>
                        </div>

                      </div>

                      <div className="row">

                        {/* DUE DATE */}

                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">
                            Due Date
                          </label>

                          <input
                            type="date"
                            name="dueDate"
                            className="form-control"
                            value={
                              formData.dueDate
                            }
                            onChange={
                              handleChange
                            }
                          />
                        </div>

                        {/* CATEGORY */}

                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">
                            Category
                          </label>

                          <input
                            type="text"
                            name="category"
                            className="form-control"
                            value={
                              formData.category
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="e.g. Development"
                          />
                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div className="mb-4">

                        <div className="d-flex justify-content-between">
                          <label className="form-label fw-semibold">
                            Progress
                          </label>

                          <span className="fw-bold text-primary">
                            {
                              formData.progress
                            }
                            %
                          </span>
                        </div>

                        <input
                          type="range"
                          className="form-range"
                          min="0"
                          max="100"
                          step="5"
                          value={
                            formData.progress
                          }
                          onChange={
                            handleProgressChange
                          }
                        />

                        <div className="progress">
                          <div
                            className="progress-bar bg-primary"
                            style={{
                              width: `${formData.progress
                                }%`,
                            }}
                          />
                        </div>

                      </div>

                      {/* ASSIGN USER */}

                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Assign To
                        </label>

                        <select
                          name="assignedTo"
                          className="form-select"
                          value={
                            formData.assignedTo
                          }
                          onChange={
                            handleChange
                          }
                        >
                          <option value="">
                            -- Not Assigned --
                          </option>

                          {users.map((user) => (
                            <option
                              key={user._id}
                              value={user._id}
                            >
                              {getUserName(
                                user
                              )}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* PARTICIPANTS */}

                      <div className="mb-4">
                        <label className="form-label fw-semibold">
                          Participants
                        </label>

                        <select
                          multiple
                          className="form-select"
                          value={
                            formData.participants
                          }
                          onChange={
                            handleParticipantChange
                          }
                          style={{
                            minHeight:
                              "130px",
                          }}
                        >
                          {users.map((user) => (
                            <option
                              key={user._id}
                              value={user._id}
                            >
                              {getUserName(
                                user
                              )}
                            </option>
                          ))}
                        </select>

                        <small className="text-muted">
                          Hold Ctrl (Windows) or
                          Command (Mac) to select
                          multiple users.
                        </small>
                      </div>

                      {/* SAVE */}

                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            />

                            Saving...
                          </>
                        ) : (
                          "💾 Save Changes"
                        )}
                      </button>

                    </form>
                  </div>
                </div>
              )}
              {/* COMMENTS */}
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">

                  <h4 className="fw-bold mb-4">
                    💬 Comments{" "}
                    <span className="badge bg-secondary">
                      {comments.length}
                    </span>
                  </h4>

                  {/* ADD COMMENT */}

                  <form
                    onSubmit={
                      handleAddComment
                    }
                    className="mb-4"
                  >
                    <textarea
                      className="form-control mb-2"
                      rows="3"
                      placeholder="Write a comment..."
                      value={
                        commentText
                      }
                      onChange={(e) =>
                        setCommentText(
                          e.target.value
                        )
                      }
                    />

                    <div className="text-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          commentLoading ||
                          !commentText.trim()
                        }
                      >
                        {commentLoading
                          ? "Adding..."
                          : "💬 Add Comment"}
                      </button>
                    </div>
                  </form>

                  {/* COMMENTS LIST */}

                  {comments.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <div
                        style={{
                          fontSize: "35px",
                        }}
                      >
                        💬
                      </div>

                      <p className="mb-0">
                        No comments yet.
                      </p>

                      <small>
                        Be the first to
                        comment on this task.
                      </small>
                    </div>
                  ) : (
                    <div>
                      {comments.map(
                        (comment) => {
                          const commentUserId =
                            getUserId(
                              comment.user
                            );

                          const isMyComment =
                            commentUserId ===
                            currentUserId;

                          return (
                            <div
                              key={
                                comment._id
                              }
                              className="border rounded p-3 mb-3"
                            >
                              <div className="d-flex justify-content-between align-items-start">

                                <div className="d-flex align-items-center gap-2">

                                  <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                    style={{
                                      width:
                                        "38px",
                                      height:
                                        "38px",
                                      fontWeight:
                                        "bold",
                                    }}
                                  >
                                    {getUserName(
                                      comment.user
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>
                                      {getUserName(
                                        comment.user
                                      )}
                                    </strong>

                                    <small className="text-muted d-block">
                                      {formatDate(
                                        comment.createdAt
                                      )}
                                    </small>
                                  </div>

                                </div>

                                {isMyComment && (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() =>
                                      handleDeleteComment(
                                        comment._id
                                      )
                                    }
                                  >
                                    🗑️
                                  </button>
                                )}

                              </div>

                              <p className="mb-0 mt-3 text-muted">
                                {
                                  comment.text
                                }
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>


            <div className="col-lg-4">

              {/* ASSIGNMENT */}

              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">

                  <h5 className="fw-bold mb-3">
                    👥 Team
                  </h5>

                  <div className="mb-3">
                    <small className="text-muted d-block">
                      Assigned To
                    </small>

                    {task.assignedTo ? (
                      <div className="d-flex align-items-center gap-2 mt-2">

                        <div
                          className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            fontWeight: "bold",
                          }}
                        >
                          {getUserName(
                            task.assignedTo
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getUserName(
                              task.assignedTo
                            )}
                          </strong>

                          {task.assignedTo
                            ?.email && (
                              <small className="text-muted d-block">
                                {
                                  task
                                    .assignedTo
                                    .email
                                }
                              </small>
                            )}
                        </div>

                      </div>
                    ) : (
                      <span className="text-muted">
                        Not assigned
                      </span>
                    )}
                  </div>

                  <hr />

                  <div>
                    <small className="text-muted d-block mb-2">
                      Participants
                    </small>

                    {task.participants &&
                      task.participants.length >
                      0 ? (
                      task.participants.map(
                        (participant) => (
                          <div
                            key={
                              participant._id
                            }
                            className="d-flex align-items-center gap-2 mb-2"
                          >
                            <div
                              className="rounded-circle bg-info text-dark d-flex justify-content-center align-items-center"
                              style={{
                                width:
                                  "32px",
                                height:
                                  "32px",
                                fontSize:
                                  "13px",
                                fontWeight:
                                  "bold",
                              }}
                            >
                              {getUserName(
                                participant
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong
                                style={{
                                  fontSize:
                                    "13px",
                                }}
                              >
                                {getUserName(
                                  participant
                                )}
                              </strong>

                              <small className="text-muted d-block">
                                {
                                  participant.email
                                }
                              </small>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <span className="text-muted">
                        No participants
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* TASK SUMMARY */}

              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">

                  <h5 className="fw-bold mb-3">
                    📋 Task Summary
                  </h5>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">
                      Status
                    </span>

                    <span
                      className={getStatusClass(
                        task.status
                      )}
                    >
                      {formatStatus(
                        task.status
                      )}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">
                      Priority
                    </span>

                    <span
                      className={getPriorityClass(
                        task.priority
                      )}
                    >
                      {task.priority
                        ?.charAt(0)
                        .toUpperCase() +
                        task.priority?.slice(
                          1
                        )}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">
                      Progress
                    </span>

                    <strong>
                      {task.progress ?? 0}%
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">
                      Category
                    </span>

                    <strong>
                      {task.category ||
                        "General"}
                    </strong>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span className="text-muted">
                      Due Date
                    </span>

                    <strong>
                      {formatDate(
                        task.dueDate
                      )}
                    </strong>
                  </div>

                </div>
              </div>

              {/* PERMISSION INFO */}

              <div className="card shadow-sm border-0">
                <div className="card-body p-4">

                  <h6 className="fw-bold">
                    🔐 Your Access
                  </h6>

                  {isCreator && (
                    <p className="text-success small mb-1">
                      ✓ You created this task
                    </p>
                  )}

                  {isAssignedUser && (
                    <p className="text-primary small mb-1">
                      ✓ Task assigned to you
                    </p>
                  )}

                  {isParticipant && (
                    <p className="text-info small mb-1">
                      ✓ You are a participant
                    </p>
                  )}

                  {!isCreator &&
                    !isAssignedUser &&
                    !isParticipant && (
                      <p className="text-muted small mb-0">
                        You have limited access
                        to this task.
                      </p>
                    )}

                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TaskDetails;