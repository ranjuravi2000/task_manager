import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPlan, formatLimit } from "../data/plans";
import API from "../api/axiosInstance";

function Dashboard() {
  const navigate = useNavigate();

  
  // ---------------STATE--------------//

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] =
    useState(null);

  
  // TASK STATISTICS//

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    completionPercentage: 0,
    averageProgress: 0,
  });


  // CURRENT USER

  const currentUser =
    JSON.parse(
      localStorage.getItem("currentUser")
    ) || {};

 
  // USER PLAN
 

  const userPlan =
    currentUser?.plan || "free";

  const planInfo = getPlan(userPlan);

  
  // CURRENT USER ID

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    null;

  

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



  const formatPriority = (priority) => {
    if (!priority) return "";

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };


  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-danger-subtle text-danger";

      case "medium":
        return "bg-warning-subtle text-warning-emphasis";

      case "low":
        return "bg-success-subtle text-success";

      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

 

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success-subtle text-success";

      case "in-progress":
        return "bg-primary-subtle text-primary";

      case "pending":
        return "bg-secondary-subtle text-secondary";

      default:
        return "bg-light text-dark";
    }
  };

  
  // FETCH TASKS

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await API.get("/tasks");

      console.log(
        "Tasks from backend:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      setTasks(
        response.data.tasks || []
      );
    } catch (error) {
      console.error(
        "Error fetching tasks:",
        error
      );

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
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to fetch tasks."
        );
      }
    } finally {
      setLoading(false);
    }
  };

 
  // FETCH STATISTICS

  const fetchStats = async () => {
    try {
      const response = await API.get(
        "/tasks/statistics"
      );

      console.log(
        "Task statistics:",
        response.data
      );

      setStats(
        response.data.statistics || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0,
          highPriority: 0,
          mediumPriority: 0,
          lowPriority: 0,
          completionPercentage: 0,
          averageProgress: 0,
        }
      );
    } catch (error) {
      console.error(
        "Error fetching task statistics:",
        error
      );

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
      }
    }
  };

  // LOAD DASHBOARD DATA

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  
  // STATISTICS VALUES

  const totalTasks = stats.total;

  const completedTasks =
    stats.completed;

  const pendingTasks =
    stats.pending;

  const inProgressTasks =
    stats.inProgress;

  const overdueTasks =
    stats.overdue;

  const completionPercentage =
    stats.completionPercentage;

  const averageProgress =
    stats.averageProgress;


  // MY OWN TASKS

  const myOwnTasks = tasks.filter(
    (task) => {
      const createdById =
        getUserId(
          task.createdBy
        );

      return (
        createdById ===
        currentUserId
      );
    }
  ).length;

 
  // SHARED TASKS

  const sharedTasks = tasks.filter(
    (task) => {
      const createdById =
        getUserId(
          task.createdBy
        );

      const assignedToId =
        getUserId(
          task.assignedTo
        );

      const participantIds = (
        task.participants || []
      ).map((participant) =>
        getUserId(participant)
      );

      const isAssignedToMe =
        assignedToId ===
        currentUserId;

      const isParticipant =
        participantIds.includes(
          currentUserId
        );

      return (
        createdById !==
          currentUserId &&
        (isAssignedToMe ||
          isParticipant)
      );
    }
  ).length;

 
  // CHART DATA

  const chartData = [
    {
      name: "Completed",
      value: completedTasks,
    },
    {
      name: "Pending",
      value: pendingTasks,
    },
    {
      name: "In Progress",
      value: inProgressTasks,
    },
  ];

  const COLORS = [
    "#198754",
    "#ffc107",
    "#0d6efd",
  ];

 
  // RECENT & IMPORTANT TASKS
const recentImportantTasks = [
    ...tasks,
  ]
    .sort((a, b) => {
      const now = new Date();


      const isOverdue = (task) => {
        if (
          !task.dueDate ||
          task.status ===
            "completed"
        ) {
          return false;
        }

        return (
          new Date(
            task.dueDate
          ) < now
        );
      };


      const getOverdueScore = (
        task
      ) => {
        return isOverdue(task)
          ? 1000
          : 0;
      };

    

      const getPriorityScore = (
        task
      ) => {
        if (
          task.status ===
          "completed"
        ) {
          return 0;
        }

        if (
          task.priority ===
          "high"
        ) {
          return 300;
        }

        if (
          task.priority ===
          "medium"
        ) {
          return 200;
        }

        if (
          task.priority ===
          "low"
        ) {
          return 100;
        }

        return 0;
      };


      const getStatusScore = (
        task
      ) => {
        if (
          task.status ===
          "in-progress"
        ) {
          return 50;
        }

        if (
          task.status ===
          "pending"
        ) {
          return 30;
        }

        return 0;
      };

     

      const getDate = (task) => {
        return new Date(
          task.updatedAt ||
            task.createdAt ||
            0
        ).getTime();
      };

      const scoreA =
        getOverdueScore(a) +
        getPriorityScore(a) +
        getStatusScore(a);

      const scoreB =
        getOverdueScore(b) +
        getPriorityScore(b) +
        getStatusScore(b);

      // Higher score first
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // Newest first
      return (
        getDate(b) -
        getDate(a)
      );
    })
    .slice(0, 5);

  
  // CHECK OVERDUE
 

  const isTaskOverdue = (task) => {
    if (
      !task.dueDate ||
      task.status === "completed"
    ) {
      return false;
    }

    return (
      new Date(task.dueDate) <
      new Date()
    );
  };

  
  // COMPLETE / UNDO TASK
  

  const handleCompleteTask = async (
    task
  ) => {
    const taskId = task._id;

    if (!taskId) return;

    try {
      setActionLoading(taskId);

      const isCompleted =
        task.status ===
        "completed";

      const newStatus =
        isCompleted
          ? "pending"
          : "completed";

      const newProgress =
        isCompleted ? 0 : 100;

      const response =
        await API.put(
          `/tasks/${taskId}`,
          {
            status: newStatus,
            progress:
              newProgress,
          }
        );

      console.log(
        "Task updated:",
        response.data
      );

      setTasks(
        (prevTasks) =>
          prevTasks.map(
            (item) =>
              item._id === taskId
                ? {
                    ...item,
                    status:
                      newStatus,
                    progress:
                      newProgress,
                  }
                : item
          )
      );

      // Refresh statistics
      await fetchStats();
    } catch (error) {
      console.error(
        "Error updating task:",
        error
      );

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

      alert(
        error.response?.data?.message ||
          "Failed to update task."
      );
    } finally {
      setActionLoading(null);
    }
  };

 
  // DELETE TASK

  const handleDeleteTask = async (
    taskId
  ) => {
    if (!taskId) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) return;

    try {
      setActionLoading(taskId);

      const response =
        await API.delete(
          `/tasks/${taskId}`
        );

      console.log(
        "Task deleted:",
        response.data
      );

      setTasks(
        (prevTasks) =>
          prevTasks.filter(
            (task) =>
              task._id !== taskId
          )
      );

      // Refresh statistics
      await fetchStats();
    } catch (error) {
      console.error(
        "Error deleting task:",
        error
      );

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

      alert(
        error.response?.data?.message ||
          "Failed to delete task."
      );
    } finally {
      setActionLoading(null);
    }
  };

  

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">

     

      <Header showNav={true} />


      <main className="flex-grow-1 py-4">

        <div className="container">

          {/*
              --------DASHBOARD HEADER----------- */}

          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

            <div>

              <h3 className="fw-bold mb-1">
                Dashboard
              </h3>

              <p className="text-muted mb-0">
                Manage your tasks and
                track your productivity.
              </p>

            </div>

            <div className="d-flex align-items-center gap-2">

              <span
                className={`badge border border-${planInfo.color} text-${planInfo.color} px-3 py-2`}
              >
                {planInfo.label} Plan
              </span>

              {userPlan !==
                "ultimate" && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    navigate(
                      "/pricing"
                    )
                  }
                >
                  Upgrade
                </button>
              )}

            </div>

          </div>

          {/* ----------PLAN USAGE----------*/}

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body">

              <div className="d-flex justify-content-between mb-2">

                <span className="fw-semibold small">
                  Task Usage
                </span>

                <span className="text-muted small">
                  {totalTasks} /{" "}
                  {formatLimit(
                    userPlan
                  )}
                </span>

              </div>

              <div
                className="progress"
                style={{
                  height: "7px",
                }}
              >

                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min(
                      (totalTasks /
                        (Number(
                          formatLimit(
                            userPlan
                          )
                        ) || 100)) *
                        100,
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="row g-3 mb-4">

            {[
              {
                title: "Total Tasks",
                value:
                  totalTasks,
                icon: "📋",
                className:
                  "text-primary",
              },
              {
                title: "My Tasks",
                value:
                  myOwnTasks,
                icon: "👤",
                className:
                  "text-info",
              },
              {
                title: "Shared",
                value:
                  sharedTasks,
                icon: "👥",
                className:
                  "text-purple",
              },
              {
                title: "Completed",
                value:
                  completedTasks,
                icon: "✓",
                className:
                  "text-success",
              },
              {
                title: "Pending",
                value:
                  pendingTasks,
                icon: "⏳",
                className:
                  "text-warning",
              },
              {
                title: "Overdue",
                value:
                  overdueTasks,
                icon: "⚠",
                className:
                  "text-danger",
              },
            ].map((stat) => (

              <div
                className="col-6 col-md-4 col-xl-2"
                key={stat.title}
              >

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-2">

                      <span
                        className={`small fw-semibold ${stat.className}`}
                      >
                        {stat.title}
                      </span>

                      <span>
                        {stat.icon}
                      </span>

                    </div>

                    <h3 className="fw-bold mb-0">
                      {stat.value}
                    </h3>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* PROGRESS CARDS */}

          <div className="row g-3 mb-4">

            {/* COMPLETION RATE */}

            <div className="col-md-6">

              <div className="card border-0 shadow-sm">

                <div className="card-body">

                  <div className="d-flex justify-content-between mb-2">

                    <span className="fw-semibold">
                      Completion Rate
                    </span>

                    <span className="fw-bold text-success">
                      {
                        completionPercentage
                      }
                      %
                    </span>

                  </div>

                  <div
                    className="progress"
                    style={{
                      height: "7px",
                    }}
                  >

                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${completionPercentage}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* AVERAGE PROGRESS */}

            <div className="col-md-6">

              <div className="card border-0 shadow-sm">

                <div className="card-body">

                  <div className="d-flex justify-content-between mb-2">

                    <span className="fw-semibold">
                      Average Task
                      Progress
                    </span>

                    <span className="fw-bold text-primary">
                      {
                        averageProgress
                      }
                      %
                    </span>

                  </div>

                  <div
                    className="progress"
                    style={{
                      height: "7px",
                    }}
                  >

                    <div
                      className="progress-bar bg-primary"
                      style={{
                        width: `${averageProgress}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              ANALYTICS + QUICK ACTIONS
          ================================================= */}

          <div className="row g-4 mb-4">

            {/* ANALYTICS */}

            <div className="col-lg-7">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <div>

                      <h5 className="fw-bold mb-1">
                        Task Analytics
                      </h5>

                      <small className="text-muted">
                        Current task
                        distribution
                      </small>

                    </div>

                    <span className="badge bg-light text-dark">
                      {totalTasks}{" "}
                      Tasks
                    </span>

                  </div>

                  {totalTasks ===
                  0 ? (

                    <div className="text-center py-5 text-muted">
                      No task data
                      available.
                    </div>

                  ) : (

                    <ResponsiveContainer
                      width="100%"
                      height={250}
                    >

                      <PieChart>

                        <Pie
                          data={
                            chartData
                          }
                          cx="50%"
                          cy="45%"
                          outerRadius={
                            85
                          }
                          dataKey="value"
                          label
                        >

                          {chartData.map(
                            (
                              entry,
                              index
                            ) => (

                              <Cell
                                key={
                                  entry.name
                                }
                                fill={
                                  COLORS[
                                    index
                                  ]
                                }
                              />

                            )
                          )}

                        </Pie>

                        <Tooltip />

                        <Legend
                          verticalAlign="bottom"
                          wrapperStyle={{
                            paddingTop: 10,
                          }}
                        />

                      </PieChart>

                    </ResponsiveContainer>

                  )}

                </div>

              </div>

            </div>

            {/* QUICK ACTIONS */}

            <div className="col-lg-5">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <h5 className="fw-bold mb-1">
                    Quick Actions
                  </h5>

                  <p className="text-muted small mb-4">
                    Access your most
                    important Taskify
                    features.
                  </p>

                  <div className="d-grid gap-3">

                    <button
                      className="btn btn-primary py-2"
                      onClick={() =>
                        navigate(
                          "/create-task"
                        )
                      }
                    >
                      + Create New Task
                    </button>

                    <button
                      className="btn btn-outline-primary py-2"
                      onClick={() =>
                        navigate(
                          "/taskpilot"
                        )
                      }
                    >
                      🤖 TaskPilot AI
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ---------TASKPILOT BANNER------------*/}

          <div
            className="card border-0 shadow-sm mb-4"
            style={{
              cursor: "pointer",
            }}
            onClick={() =>
              navigate(
                "/taskpilot"
              )
            }
          >

            <div className="card-body p-4">

              <div className="row align-items-center">

                <div className="col-md-8">

                  <span className="badge bg-primary mb-2">
                    AI POWERED
                  </span>

                  <h5 className="fw-bold mb-1">
                    TaskPilot AI
                  </h5>

                  <p className="text-muted mb-0">
                    Get intelligent task
                    suggestions,
                    productivity
                    insights and
                    recovery plans for
                    at-risk tasks.
                  </p>

                </div>

                <div className="col-md-4 text-md-end mt-3 mt-md-0">

                  <button className="btn btn-primary">
                    Open TaskPilot →
                  </button>

                </div>

              </div>

            </div>

          </div>

          

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

            <div>

              <h5 className="fw-bold mb-1">
                Recent & Important
                Tasks
              </h5>

              <small className="text-muted">
                Your most important
                tasks at a glance
              </small>

            </div>

            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() =>
                navigate(
                  "/my-tasks"
                )
              }
            >
              View All Tasks →
            </button>

          </div>

          {/* =================================================
              RECENT TASKS
          ================================================= */}

          {loading ? (

            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body text-center py-5">

                <div
                  className="spinner-border text-primary"
                  role="status"
                />

                <p className="text-muted mt-3 mb-0">
                  Loading recent
                  tasks...
                </p>

              </div>

            </div>

          ) : recentImportantTasks.length ===
            0 ? (

            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body text-center py-5">

                <div
                  style={{
                    fontSize:
                      "45px",
                  }}
                >
                  📭
                </div>

                <h5 className="fw-bold mt-3">
                  No tasks yet
                </h5>

                <p className="text-muted">
                  Create your first
                  task to get started.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(
                      "/create-task"
                    )
                  }
                >
                  + Create Task
                </button>

              </div>

            </div>

          ) : (

            <div className="row g-3 mb-4">

              {recentImportantTasks.map(
                (task) => {

                  const taskId =
                    task._id;

                  const createdById =
                    getUserId(
                      task.createdBy
                    );

                  const isShared =
                    createdById !==
                    currentUserId;

                  const isActionLoading =
                    actionLoading ===
                    taskId;

                  const progress =
                    task.progress ??
                    (task.status ===
                    "completed"
                      ? 100
                      : 0);

                  const overdue =
                    isTaskOverdue(
                      task
                    );

                  return (

                    <div
                      className="col-lg-6"
                      key={taskId}
                    >

                      <div className="card border-0 shadow-sm h-100">

                        <div className="card-body p-4">

                          

                          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">

                            <div>

                              <div className="d-flex align-items-center gap-2 flex-wrap">

                                <h5 className="fw-bold mb-0">
                                  {
                                    task.title
                                  }
                                </h5>

                                {isShared && (
                                  <span className="badge bg-info-subtle text-info-emphasis">
                                    👥 Shared
                                  </span>
                                )}

                                {overdue && (
                                  <span className="badge bg-danger-subtle text-danger">
                                    ⚠ Overdue
                                  </span>
                                )}

                              </div>

                            </div>

                            <span
                              className={`badge ${getPriorityClass(
                                task.priority
                              )}`}
                            >
                              {formatPriority(
                                task.priority
                              )}
                            </span>

                          </div>

                        

                          <p className="text-muted small mb-3">
                            {task.description ||
                              "No description available."}
                          </p>


                          <div className="d-flex flex-wrap gap-2 mb-3">

                            {task.category && (
                              <span className="badge bg-light text-dark border">
                                📁{" "}
                                {
                                  task.category
                                }
                              </span>
                            )}

                            {task.dueDate && (
                              <span
                                className={`badge ${
                                  overdue
                                    ? "bg-danger-subtle text-danger"
                                    : "bg-light text-dark border"
                                }`}
                              >
                                📅{" "}
                                {new Date(
                                  task.dueDate
                                ).toLocaleDateString()}
                              </span>
                            )}

                            <span
                              className={`badge ${getStatusClass(
                                task.status
                              )}`}
                            >
                              {formatStatus(
                                task.status
                              )}
                            </span>

                          </div>

                          

                          <div className="mb-3">

                            <div className="d-flex justify-content-between mb-1">

                              <small className="fw-semibold">
                                Progress
                              </small>

                              <small className="text-muted">
                                {
                                  progress
                                }
                                %
                              </small>

                            </div>

                            <div
                              className="progress"
                              style={{
                                height:
                                  "7px",
                              }}
                            >

                              <div
                                className={`progress-bar ${
                                  progress ===
                                  100
                                    ? "bg-success"
                                    : "bg-primary"
                                }`}
                                style={{
                                  width: `${progress}%`,
                                }}
                              />

                            </div>

                          </div>


                          <div
                            className="border-top pt-3 mb-3"
                            style={{
                              fontSize:
                                "12px",
                            }}
                          >

                            <div className="row g-2">

                              <div className="col-6">

                                <span className="text-muted d-block">
                                  Created by
                                </span>

                                <strong>
                                  {task
                                    .createdBy
                                    ?.username ||
                                    task
                                      .createdBy
                                      ?.email ||
                                    "Unknown"}
                                </strong>

                              </div>

                              <div className="col-6">

                                <span className="text-muted d-block">
                                  Assigned to
                                </span>

                                <strong>
                                  {task
                                    .assignedTo
                                    ?.username ||
                                    task
                                      .assignedTo
                                      ?.email ||
                                    "Not Assigned"}
                                </strong>

                              </div>

                            </div>

                          </div>

                          {/* =================================
                              PARTICIPANTS
                          ================================= */}

                          {task.participants &&
                            task.participants
                              .length >
                              0 && (

                              <div className="mb-3">

                                <small className="text-muted d-block mb-2">
                                  Team members
                                </small>

                                <div className="d-flex align-items-center">

                                  {task.participants
                                    .slice(
                                      0,
                                      5
                                    )
                                    .map(
                                      (
                                        participant,
                                        index
                                      ) => {

                                        const name =
                                          participant?.username ||
                                          participant?.email ||
                                          "User";

                                        return (

                                          <span
                                            key={
                                              participant?._id ||
                                              index
                                            }
                                            title={
                                              name
                                            }
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                            style={{
                                              width:
                                                "28px",
                                              height:
                                                "28px",
                                              fontSize:
                                                "11px",
                                              fontWeight:
                                                "bold",
                                              marginRight:
                                                "-5px",
                                              border:
                                                "2px solid white",
                                            }}
                                          >
                                            {name
                                              .charAt(
                                                0
                                              )
                                              .toUpperCase()}
                                          </span>

                                        );
                                      }
                                    )}

                                </div>

                              </div>

                            )}

                          {/* =================================
                              ACTIONS
                          ================================= */}

                          <div className="d-flex gap-2 flex-wrap">

                            {/* COMPLETE */}

                            <button
                              className={`btn btn-sm ${
                                task.status ===
                                "completed"
                                  ? "btn-outline-secondary"
                                  : "btn-success"
                              }`}
                              onClick={() =>
                                handleCompleteTask(
                                  task
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                            >

                              {isActionLoading ? (

                                <>

                                  <span
                                    className="spinner-border spinner-border-sm me-1"
                                    role="status"
                                  />

                                  Updating...

                                </>

                              ) : task.status ===
                                "completed" ? (

                                "↩ Undo"

                              ) : (

                                "✓ Complete"

                              )}

                            </button>

                            {/* EDIT */}

                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() =>
                                navigate(
                                  `/task/${taskId}`
                                )
                              }
                              disabled={
                                isActionLoading
                              }
                            >
                              ✏️ Edit
                            </button>

                            {/* DELETE */}

                            {createdById ===
                              currentUserId && (

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                  handleDeleteTask(
                                    taskId
                                  )
                                }
                                disabled={
                                  isActionLoading
                                }
                              >

                                {isActionLoading ? (

                                  <>

                                    <span
                                      className="spinner-border spinner-border-sm me-1"
                                      role="status"
                                    />

                                    Deleting...

                                  </>

                                ) : (

                                  "🗑 Delete"

                                )}

                              </button>

                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          )}

          {/* =================================================
              VIEW ALL TASKS
          ================================================= */}

          {tasks.length > 5 && (
            <div className="text-center mb-4">

              <button
                className="btn btn-outline-primary px-4"
                onClick={() =>
                  navigate(
                    "/my-tasks"
                  )
                }
              >
                View All {tasks.length}{" "}
                Tasks →
              </button>

            </div>
          )}

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

    </div>
  );
}

export default Dashboard;