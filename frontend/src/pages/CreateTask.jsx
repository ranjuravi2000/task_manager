import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import {
  getPlan,
  isAtTaskLimit,
  formatLimit,
} from "../data/plans";

import API from "../api/axiosInstance";

import {
  FaTasks,
  FaUsers,
  FaUserPlus,
  FaCalendarAlt,
  FaFlag,
  FaFolder,
  FaArrowLeft,
  FaSave,
  FaUser,
  FaEnvelope,
  FaBan,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function CreateTask() {
  const navigate = useNavigate();


  // -------------CURRENT LOGGED-IN USER---------------//
  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const currentUserId =
    currentUser?._id || currentUser?.id || null;

  const userPlan = currentUser?.plan || "free";

  // plan limit  ----//

  const allTasksAtMount =
    JSON.parse(localStorage.getItem("tasks")) || [];

  const myTaskCount = allTasksAtMount.filter((task) => {
    const createdBy =
      typeof task.createdBy === "object"
        ? task.createdBy?._id
        : task.createdBy;

    return (
      createdBy === currentUserId ||
      createdBy === currentUser.username
    );
  }).length;

  const atLimit = isAtTaskLimit(
    userPlan,
    myTaskCount
  );

  // task from state----------//

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");

  // MongoDB ID of assigned user
  const [assignedTo, setAssignedTo] = useState("");


  // USERS


  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);


  // -----------------PARTICIPANTS---------------//


  const [participants, setParticipants] = useState([]);

  const [participantInput, setParticipantInput] =
    useState("");

  const [participantError, setParticipantError] =
    useState("");


  // MESSAGE / LOADING


  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);


  // FETCH USERS

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await API.get("/users");

      console.log(
        "Users from backend:",
        response.data
      );

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
      } else {
        setParticipantError(
          error.response?.data?.message ||
          "Failed to load users."
        );
      }
    } finally {
      setLoadingUsers(false);
    }
  };


  // Load users when page opens  ---/


  useEffect(() => {
    fetchUsers();
  }, []);


  // find users-----//


  const findUser = (value) => {
    const trimmedValue = value.trim().toLowerCase();

    return users.find((user) => {
      const email =
        user.email?.toLowerCase() || "";

      const username =
        user.username?.toLowerCase() || "";

      return (
        email === trimmedValue ||
        username === trimmedValue
      );
    });
  };


  // ADD PARTICIPANT
  const addParticipant = () => {
    const trimmed = participantInput.trim();

    setParticipantError("");

    if (!trimmed) {
      setParticipantError(
        "Please enter a username or email."
      );
      return;
    }

    const selectedUser = findUser(trimmed);

    if (!selectedUser) {
      setParticipantError(
        "User not found. Check the username or email."
      );
      return;
    }

    // Prevent adding yourself
    if (selectedUser._id === currentUserId) {
      setParticipantError(
        "You cannot add yourself."
      );
      return;
    }

    // Prevent duplicate participant
    if (
      participants.includes(
        selectedUser._id
      )
    ) {
      setParticipantError(
        "User already added."
      );
      return;
    }

    // Store MongoDB ID
    setParticipants((prev) => [
      ...prev,
      selectedUser._id,
    ]);

    setParticipantInput("");
    setParticipantError("");
  };


  // REMOVE PARTICIPANT
  const removeParticipant = (userId) => {
    setParticipants((prev) =>
      prev.filter(
        (id) => id !== userId
      )
    );
  };

  
  //--------- GET PARTICIPANT DETAILS----------//
  const getParticipantDetails = (userId) => {
    return users.find(
      (user) => user._id === userId
    );
  };



  const saveTask = async () => {
    setMessage("");

    
    // PLAN LIMIT
    if (atLimit) {
      setMessage(
        `You have reached your ${getPlan(userPlan)?.name ||
        "current"
        } plan task limit.`
      );
      return;
    }

  

    if (!title.trim()) {
      setMessage(
        "Please enter a task title."
      );
      return;
    }

   

    if (!description.trim()) {
      setMessage(
        "Please enter a description."
      );
      return;
    }


    if (!dueDate) {
      setMessage(
        "Please select a due date."
      );
      return;
    }

    try {
      setIsSaving(true);

     
      // TASK DATA
     

      const taskData = {
        title: title.trim(),

        description:
          description.trim(),

        status: "pending",

        priority:
          priority.toLowerCase(),

        dueDate,

        category:
          category.trim() || "General",

        progress: 0,

        // MongoDB ObjectId
        assignedTo:
          assignedTo || null,

        // MongoDB ObjectIds
        participants,
      };

      console.log(
        "Sending task to backend:",
        taskData
      );

    
      // CREATE TASK
     

      const response = await API.post(
        "/tasks",
        taskData
      );

      console.log(
        "Task created successfully:",
        response.data
      );

      setMessage(
        "Task created successfully!"
      );

      
      // GO TO DASHBOARD
     

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      console.error(
        "Error creating task:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem(
          "currentUser"
        );

        navigate("/login");
        return;
      }

      const errorMessage =
        error.response?.data?.message ||
        "Failed to create task. Please try again.";

      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container py-4">

        {/* BACK BUTTON */}
        <button
          type="button"
          className="btn btn-outline-secondary mb-4"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FaArrowLeft className="me-2" />
          Back to Dashboard
        </button>

        {/* PAGE HEADER */}
        <div className="mb-4">
          <h2 className="fw-bold">
            <FaTasks className="me-2" />
            Create New Task
          </h2>

          <p className="text-muted">
            Create a task and manage your
            work efficiently.
          </p>
        </div>

        {/* PLAN LIMIT */}
        {atLimit && (
          <div className="alert alert-warning">
            <FaBan className="me-2" />

            You have reached your task
            limit for the{" "}

            <strong>
              {getPlan(userPlan)?.name ||
                userPlan}{" "}
              plan
            </strong>

            <div className="mt-2">
              Limit:{" "}
              {formatLimit(
                getPlan(userPlan)?.taskLimit
              )}
            </div>
          </div>
        )}

        {/* SUCCESS / ERROR MESSAGE */}
        {message && (
          <div
            className={`alert ${message.includes(
              "successfully"
            )
              ? "alert-success"
              : "alert-danger"
              }`}
          >
            {message.includes(
              "successfully"
            ) ? (
              <FaCheckCircle className="me-2" />
            ) : (
              <FaTimesCircle className="me-2" />
            )}

            {message}
          </div>
        )}

        <div className="row g-4">

          {/* 
              TASK DETAILS
         */}

          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">

                <h5 className="fw-bold mb-4">
                  <FaTasks className="me-2" />
                  Task Details
                </h5>

                {/* TITLE */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Task Title
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter task title"
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* DESCRIPTION */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Describe your task"
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="row">

                  {/* PRIORITY */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <FaFlag className="me-2" />
                      Priority
                    </label>

                    <select
                      className="form-select"
                      value={priority}
                      onChange={(e) =>
                        setPriority(
                          e.target.value
                        )
                      }
                    >
                      <option value="Low">
                        Low
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="High">
                        High
                      </option>
                    </select>
                  </div>

                  {/* CATEGORY */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <FaFolder className="me-2" />
                      Category
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Work, Study, Personal"
                      value={category}
                      onChange={(e) =>
                        setCategory(
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <div className="row">

                  {/* DUE DATE */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <FaCalendarAlt className="me-2" />
                      Due Date
                    </label>

                    <input
                      type="date"
                      className="form-control"
                      value={dueDate}
                      onChange={(e) =>
                        setDueDate(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* ASSIGN TO */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      <FaUser className="me-2" />
                      Assign To
                    </label>

                    <select
                      className="form-select"
                      value={assignedTo}
                      onChange={(e) =>
                        setAssignedTo(
                          e.target.value
                        )
                      }
                      disabled={loadingUsers}
                    >
                      <option value="">
                        {loadingUsers
                          ? "Loading users..."
                          : "Select user"}
                      </option>

                      {users
                        .filter(
                          (user) =>
                            user._id !==
                            currentUserId
                        )
                        .map((user) => (
                          <option
                            key={user._id}
                            value={user._id}
                          >
                            {user.username ||
                              user.email}
                          </option>
                        ))}
                    </select>

                    {!loadingUsers &&
                      users.length === 0 && (
                        <small className="text-muted">
                          No other users available.
                        </small>
                      )}
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* COLLABORATORS */}

          <div className="col-lg-4">
            <div className="card shadow-sm border-0">

              <div className="card-body p-4">

                <h5 className="fw-bold mb-4">
                  <FaUsers className="me-2" />
                  Invite Collaborators
                </h5>

                {/* PARTICIPANT */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    <FaUserPlus className="me-2" />
                    Username / Email
                  </label>

                  <div className="input-group">

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter username or email"
                      value={participantInput}
                      onChange={(e) => {
                        setParticipantInput(
                          e.target.value
                        );
                        setParticipantError("");
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter"
                        ) {
                          e.preventDefault();
                          addParticipant();
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        addParticipant
                      }
                      disabled={loadingUsers}
                    >
                      Add
                    </button>

                  </div>

                  {participantError && (
                    <small className="text-danger">
                      {participantError}
                    </small>
                  )}

                </div>

                {/* MESSAGE */}
                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    <FaEnvelope className="me-2" />
                    Message
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Optional message for collaborators"
                  />

                </div>

                {/* PARTICIPANTS */}
                {participants.length > 0 && (
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Participants
                    </label>

                    {participants.map(
                      (userId) => {
                        const user =
                          getParticipantDetails(
                            userId
                          );

                        const displayName =
                          user?.username ||
                          user?.email ||
                          "User";

                        return (
                          <div
                            key={userId}
                            className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
                          >
                            <span>
                              <FaUser className="me-2" />
                              {displayName}
                            </span>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                removeParticipant(
                                  userId
                                )
                              }
                            >
                              <FaTimes />
                            </button>
                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="d-flex justify-content-end mt-4">

          <button
            type="button"
            className="btn btn-primary px-4"
            onClick={saveTask}
            disabled={
              isSaving || atLimit
            }
          >
            {isSaving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />

                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Save Task
              </>
            )}
          </button>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default CreateTask;