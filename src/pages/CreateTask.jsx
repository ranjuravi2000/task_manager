import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPlan, isAtTaskLimit, formatLimit } from "../data/plans";
import {
  FaTasks,
  FaUsers,
  FaUserPlus,
  FaCalendarAlt,
  FaFlag,
  FaFolder,
  FaArrowLeft,
  FaSave,FaUser,FaEnvelope,FaChartPie,FaBan,
  FaCircle,FaLaptopCode,FaFlask,FaPaintBrush,FaFileAlt,FaRocket,FaTimesCircle,FaTimes,FaPaperPlane,FaCheckCircle,
} from "react-icons/fa";


function CreateTask() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userPlan = currentUser?.plan || "free";

  const allTasksAtMount = JSON.parse(localStorage.getItem("tasks")) || [];
  const myTaskCount = allTasksAtMount.filter(
    (t) => t.createdBy === currentUser.username
  ).length;
  const atLimit = isAtTaskLimit(userPlan, myTaskCount);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [message, setMessage] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState([]);
  const [participantError, setParticipantError] = useState("");

  // Adding participant to invite list------------
  const addParticipant = () => {
    const trimmed = participantInput.trim();
    setParticipantError("");

    if (!trimmed) {
      setParticipantError("Please enter a username.");
      return;
    }

    if (trimmed === currentUser.username) {
      setParticipantError("You can't invite yourself.");
      return;
    }

    if (participants.includes(trimmed)) {
      setParticipantError("This user is already added.");
      return;
    }

    // Checking if user exists--------------
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userExists = users.find((u) => u.username === trimmed);
    if (!userExists) {
      setParticipantError("User not found. Check the username.");
      return;
    }

    setParticipants([...participants, trimmed]);
    setParticipantInput("");
  };

  const removeParticipant = (username) => {
    setParticipants(participants.filter((p) => p !== username));
  };

  const saveTask = () => {
    if (atLimit) {
      alert(
        ` You've reached your ${getPlan(userPlan).label} plan limit of ${formatLimit(userPlan)} tasks. Upgrade to add more.`
      );
      navigate("/pricing");
      return;
    }

    if (
      !title ||
      !description ||
      !dueDate ||
      !category
    ) {
     
      return;
    }

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const newTask = {
      id: Date.now(),
      title,
      description,
      priority,
      category,
      dueDate,
      status: "Pending",
      createdBy: currentUser.username,
      assignedTo: assignedTo.trim() || null,
      createdAt: new Date().toISOString(),
      participants: [currentUser.username, ...participants],
      comments: [],
      progress: 0,
    };

    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    //  Sending collaboration requests to all invited participants-------------
    if (participants.length > 0) {
      const existingRequests =
        JSON.parse(localStorage.getItem("collaborationRequests")) || [];

      const newRequests = participants.map((username) => ({
        id: Date.now() + Math.random(),
        taskId: newTask.id,
        fromUser: currentUser.username,
        toUser: username,
        status: "Pending",
        message: message.trim() || "",
        createdAt: new Date().toISOString(),
      }));

      localStorage.setItem(
        "collaborationRequests",
        JSON.stringify([...existingRequests, ...newRequests])
      );
    } 

    navigate("/dashboard");
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header showNav={true} />

      <div className="flex-grow-1 bg-light py-4">
        <div className="container">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold mb-0">
                <FaTasks className="me-2 text-primary" />
                Create Task
              </h3>
              <p className="text-muted small mb-0">
                Fill in the details and invite collaborators
              </p>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/dashboard")}
            >
              <>
                <FaArrowLeft className="me-1" />
                Back to Dashboard
              </>
            </button>
          </div>

          <div className={`alert ${atLimit ? "alert-danger" : "alert-light border"} py-2 px-3 d-flex justify-content-between align-items-center`} style={{ fontSize: "13px" }}>
            <span>
              {atLimit ? <FaBan className="me-1" /> : <FaChartPie className="me-1" />}
              {getPlan(userPlan).label} Plan — {myTaskCount} / {formatLimit(userPlan)} tasks used
            </span>
            {userPlan !== "team" && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => navigate("/pricing")}
              >
                Upgrade
              </button>
            )}
          </div>

          <div className="row g-4">

            {/* ── Task Details----- ── */}
            <div className="col-md-7">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-semibold">
                  <>
                    <FaTasks className="me-2 text-primary" />
                    Task Details
                  </>
                </div>
                <div className="card-body">

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaTasks className="me-2" />
                      Task Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder=" "
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaTasks className="me-2" />
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder=" "
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <FaFlag className="me-2 text-danger" />
                        Priority
                      </label>
                      <select
                        className="form-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <FaFolder className="me-2 text-warning" />
                        Category
                      </label>
                      <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="Design">Design</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Deployment">Deployment</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <FaCalendarAlt className="me-2 text-info" />
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <FaUser className="me-2" />
                        Assign To
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter username"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-success w-100 mt-2"
                    onClick={saveTask}
                    disabled={atLimit}
                  >
                    <>
                      <FaSave className="me-2" />
                      {atLimit ? "Task Limit Reached" : "Save Task"}
                    </>
                  </button>


                </div>
              </div>
            </div>

            {/* -------------Invite Collaborators---------------- */}
            <div className="col-md-5">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white fw-semibold">
                  <>
                    <FaUsers className="me-2 text-success" />
                    Invite Collaborators
                  </>
                </div>
                <div className="card-body">

                  <p className="text-muted small mb-3">
                    Add usernames to send collaboration requests
                    
                  </p>

                  {/* -------------Adding participants------------- */}
                  <div className="mb-2">
                    <label className="form-label fw-semibold">
                      <FaUserPlus className="me-2 text-success" />
                      Username
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter username"
                        value={participantInput}
                        onChange={(e) => {
                          setParticipantInput(e.target.value);
                          setParticipantError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                      />
                      <button
                        className="btn btn-primary"
                        onClick={addParticipant}
                      >
                        <>
                          <FaUserPlus className="me-1" />
                          Add
                        </>
                      </button>
                    </div>
                    {participantError && (
                      <p className="text-danger small mt-1 mb-0">
                        <FaTimesCircle className="me-1" />
                        {participantError}
                      </p>
                    )}
                  </div>

                  {/* ----- message----------- */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <FaEnvelope className="me-2 text-primary" />
                      Message
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder=" "
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {/* ------Participant list ----- */}
                  {participants.length === 0 ? (
                    <div className="text-center text-muted py-4 border rounded bg-light">
                      <p className="mb-0" style={{ fontSize: "13px" }}>
                        <>
                          <FaUsers className="me-2" />
                          No collaborators added yet
                        </>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="fw-semibold small mb-2">
                        <FaUsers className="me-1" />
                        Invite List ({participants.length})
                      </p>
                      {participants.map((username) => (
                        <div
                          key={username}
                          className="d-flex justify-content-between align-items-center bg-light border rounded px-3 py-2 mb-2"
                        >
                          <span style={{ fontSize: "14px" }}>
                            <FaUser className="me-1" />
                            {username}
                          </span>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeParticipant(username)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}

                      <div className="alert alert-info py-2 px-3 mt-3 mb-0"
                        style={{ fontSize: "12px" }}>
                        <FaPaperPlane className="me-1" />
                        Requests will be sent when you save the task.
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
export default CreateTask