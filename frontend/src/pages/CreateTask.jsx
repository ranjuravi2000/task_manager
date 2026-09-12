import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { getPlan, formatLimit } from "../data/plans";

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

  // --------------------------------------------------
  // CURRENT LOGGED-IN USER
  // --------------------------------------------------

  const currentUser =
    JSON.parse(localStorage.getItem("currentUser")) || {};

  const currentUserId =
    currentUser?._id || currentUser?.id || null;

  const userPlan = currentUser?.plan || "free";

  // --------------------------------------------------
  // PLAN
  // --------------------------------------------------

  const planDetails = getPlan(userPlan);

  const taskLimit = planDetails?.taskLimit;

  // --------------------------------------------------
  // TASK COUNT
  // --------------------------------------------------

  const [myTaskCount, setMyTaskCount] = useState(0);
  const [checkingLimit, setCheckingLimit] = useState(true);

  const atLimit =
    typeof taskLimit === "number" &&
    taskLimit !== Infinity &&
    myTaskCount >= taskLimit;

  // --------------------------------------------------
  // TASK STATE
  // --------------------------------------------------

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [assignedTo, setAssignedTo] = useState("");

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // --------------------------------------------------
  // PARTICIPANTS
  // --------------------------------------------------

  const [participants, setParticipants] = useState([]);
  const [participantInput, setParticipantInput] = useState("");
  const [participantError, setParticipantError] = useState("");

  // --------------------------------------------------
  // MESSAGE / LOADING
  // --------------------------------------------------

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // --------------------------------------------------
  // FETCH MY TASK COUNT
  // --------------------------------------------------

  const fetchTaskCount = async () => {
    try {
      setCheckingLimit(true);

      const response = await API.get("/tasks");

      console.log("Tasks from backend:", response.data);

      const tasks =
        response.data?.tasks ||
        response.data?.data ||
        [];

      // ----------------------------------------------
      // COUNT ONLY TASKS CREATED BY CURRENT USER
      // ----------------------------------------------

      const myTasks = tasks.filter((task) => {
        const creatorId =
          task.createdBy?._id ||
          task.createdBy?.id ||
          task.createdBy;

        return (
          creatorId &&
          currentUserId &&
          creatorId.toString() ===
            currentUserId.toString()
        );
      });

      console.log("My tasks:", myTasks);
      console.log(
        "My task count:",
        myTasks.length
      );

      setMyTaskCount(myTasks.length);

    } catch (error) {
      console.error(
        "Error fetching task count:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");

        navigate("/login");
        return;
      }

      setMyTaskCount(0);

    } finally {
      setCheckingLimit(false);
    }
  };

  // --------------------------------------------------
  // FETCH USERS
  // --------------------------------------------------

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await API.get("/users");

      console.log(
        "Users from backend:",
        response.data
      );

      setUsers(response.data?.users || []);

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

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  useEffect(() => {
    fetchUsers();
    fetchTaskCount();
  }, []);

  // --------------------------------------------------
  // FIND USER
  // --------------------------------------------------

  const findUser = (value) => {
    const trimmedValue =
      value.trim().toLowerCase();

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

  // --------------------------------------------------
  // ADD PARTICIPANT
  // --------------------------------------------------

  const addParticipant = () => {
    const trimmed =
      participantInput.trim();

    setParticipantError("");

    if (!trimmed) {
      setParticipantError(
        "Please enter a username or email."
      );
      return;
    }

    const selectedUser =
      findUser(trimmed);

    if (!selectedUser) {
      setParticipantError(
        "User not found. Check the username or email."
      );
      return;
    }

    if (
      selectedUser._id === currentUserId
    ) {
      setParticipantError(
        "You cannot add yourself."
      );
      return;
    }

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

    setParticipants((prev) => [
      ...prev,
      selectedUser._id,
    ]);

    setParticipantInput("");
    setParticipantError("");
  };

  // --------------------------------------------------
  // REMOVE PARTICIPANT
  // --------------------------------------------------

  const removeParticipant = (userId) => {
    setParticipants((prev) =>
      prev.filter(
        (id) => id !== userId
      )
    );
  };

  // --------------------------------------------------
  // GET PARTICIPANT DETAILS
  // --------------------------------------------------

  const getParticipantDetails = (
    userId
  ) => {
    return users.find(
      (user) =>
        user._id === userId
    );
  };

  // --------------------------------------------------
  // SAVE TASK
  // --------------------------------------------------

  const saveTask = async () => {
    if (isSaving) {
      return;
    }

    setMessage("");

    try {
      setIsSaving(true);

      // ----------------------------------------------
      // GET LATEST TASK LIST
      // ----------------------------------------------

      const tasksResponse =
        await API.get("/tasks");

      console.log(
        "Latest tasks before creating:",
        tasksResponse.data
      );

      const tasks =
        tasksResponse.data?.tasks ||
        tasksResponse.data?.data ||
        [];

      // ----------------------------------------------
      // COUNT ONLY CURRENT USER'S CREATED TASKS
      // ----------------------------------------------

      const myTasks =
        tasks.filter((task) => {
          const creatorId =
            task.createdBy?._id ||
            task.createdBy?.id ||
            task.createdBy;

          return (
            creatorId &&
            currentUserId &&
            creatorId.toString() ===
              currentUserId.toString()
          );
        });

      const currentTaskCount =
        myTasks.length;

      console.log(
        "Current MY task count:",
        currentTaskCount
      );

      console.log(
        "Frontend task limit:",
        taskLimit
      );

      setMyTaskCount(
        currentTaskCount
      );

      // ----------------------------------------------
      // FRONTEND PLAN LIMIT CHECK
      // ----------------------------------------------

      if (
        typeof taskLimit === "number" &&
        taskLimit !== Infinity &&
        currentTaskCount >= taskLimit
      ) {
        setMessage(
          `${
            planDetails?.name || "Free"
          } plan allows only ${taskLimit} tasks. Please upgrade your plan to create more tasks.`
        );

        return;
      }

      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

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

      // ----------------------------------------------
      // TASK DATA
      // ----------------------------------------------

      const taskData = {
        title: title.trim(),

        description:
          description.trim(),

        status: "pending",

        priority:
          priority.toLowerCase(),

        dueDate,

        category:
          category.trim() ||
          "General",

        progress: 0,

        assignedTo:
          assignedTo || null,

        participants,
      };

      console.log(
        "Sending task to backend:",
        taskData
      );

      // ----------------------------------------------
      // CREATE TASK
      // ----------------------------------------------

      const response =
        await API.post(
          "/tasks",
          taskData
        );

      console.log(
        "Task created successfully:",
        response.data
      );

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

      setMyTaskCount(
        currentTaskCount + 1
      );

      setMessage(
        "Task created successfully!"
      );

      // ----------------------------------------------
      // GO TO DASHBOARD
      // ----------------------------------------------

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } catch (error) {
      console.error(
        "CREATE TASK ERROR:",
        error
      );

      console.log(
        "Status:",
        error.response?.status
      );

      console.log(
        "Backend response:",
        error.response?.data
      );

      // ----------------------------------------------
      // UNAUTHORIZED
      // ----------------------------------------------

      if (
        error.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "currentUser"
        );

        navigate("/login");

        return;
      }

      // ----------------------------------------------
      // TASK LIMIT REACHED
      // ----------------------------------------------

      if (
        error.response?.status === 403
      ) {
        const backendMessage =
          error.response?.data?.message;

        const backendCount =
          error.response?.data
            ?.currentTaskCount;

        const backendLimit =
          error.response?.data
            ?.taskLimit;

        // Update count from backend
        if (
          backendCount !== undefined
        ) {
          setMyTaskCount(
            Number(backendCount)
          );
        } else {
          await fetchTaskCount();
        }

        // Show backend message
        if (backendMessage) {
          setMessage(
            backendMessage
          );
        } else if (
          backendLimit !== undefined
        ) {
          setMessage(
            `You have reached your task limit of ${backendLimit} tasks. Please upgrade your plan.`
          );
        } else {
          setMessage(
            "You have reached your task limit. Please upgrade your plan."
          );
        }

        return;
      }

      // ----------------------------------------------
      // OTHER BACKEND ERRORS
      // ----------------------------------------------

      if (
        error.response?.data?.message
      ) {
        setMessage(
          error.response.data.message
        );

        return;
      }

      // ----------------------------------------------
      // NETWORK ERROR
      // ----------------------------------------------

      if (!error.response) {
        setMessage(
          "Unable to connect to the server. Please make sure the backend is running."
        );

        return;
      }

      // ----------------------------------------------
      // UNKNOWN ERROR
      // ----------------------------------------------

      setMessage(
        "Failed to create task. Please try again."
      );

    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------
  // DISPLAY LIMIT
  // --------------------------------------------------

  const displayLimit =
    formatLimit(taskLimit);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <Header showNav={true} />

      <div className="container py-4">

        {/* BACK BUTTON + PAGE HEADER */}

        <div className="mb-4">

          <button
            type="button"
            className="btn btn-outline-dark btn-sm mb-3"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <FaArrowLeft className="me-1" />
            Back to Dashboard
          </button>

          <div>
            <h2 className="fw-bold mb-1">
              <FaTasks className="me-2" />
              Create New Task
            </h2>

            <p className="text-muted mb-0">
              Create a task and manage
              your work efficiently.
            </p>
          </div>

        </div>

        {/* PLAN LIMIT */}

        {atLimit && (
          <div className="alert alert-warning">

            <FaBan className="me-2" />

            You have reached your task
            limit for the{" "}

            <strong>
              {planDetails?.name ||
                userPlan} plan
            </strong>

            <div className="mt-2">
              Limit: {displayLimit}
            </div>

          </div>
        )}

        {/* SUCCESS / ERROR MESSAGE */}

        {message && (
          <div
            className={`alert ${
              message
                .toLowerCase()
                .includes(
                  "successfully"
                )
                ? "alert-success"
                : "alert-danger"
            }`}
          >

            {message
              .toLowerCase()
              .includes(
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

          {/* TASK DETAILS */}

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
                    disabled={atLimit}
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
                    disabled={atLimit}
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
                      disabled={atLimit}
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
                      disabled={atLimit}
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
                      disabled={atLimit}
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
                      disabled={
                        loadingUsers ||
                        atLimit
                      }
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
                            key={
                              user._id
                            }
                            value={
                              user._id
                            }
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
                      value={
                        participantInput
                      }
                      onChange={(e) => {
                        setParticipantInput(
                          e.target.value
                        );

                        setParticipantError(
                          ""
                        );
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter"
                        ) {
                          e.preventDefault();

                          addParticipant();
                        }
                      }}
                      disabled={atLimit}
                    />

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={
                        addParticipant
                      }
                      disabled={
                        loadingUsers ||
                        atLimit
                      }
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
                    disabled={atLimit}
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
                              disabled={
                                atLimit
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
              isSaving ||
              checkingLimit ||
              atLimit
            }
          >

            {checkingLimit ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />

                Checking limit...
              </>
            ) : isSaving ? (
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