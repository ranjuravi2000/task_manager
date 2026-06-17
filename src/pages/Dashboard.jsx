import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
  );

  useEffect(() => {
    const storedTasks =
      JSON.parse(
        localStorage.getItem("tasks")
      ) || [];

    const myTasks = storedTasks.filter(
      (task) =>
        task.createdBy === currentUser.username ||
        task.assignedTo === currentUser.username
    );

    setTasks(myTasks);

  }, []);

  const saveTasks = (updatedTasks) => {
    setTasks(updatedTasks);

    localStorage.setItem(
      "tasks",
      JSON.stringify(updatedTasks)
    );
  };

  const deleteTask = (id) => {
    const updatedTasks = tasks.filter(
      (task) => task.id !== id
    );

    saveTasks(updatedTasks);
  };

  const toggleComplete = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
          ...task,
          status:
            task.status === "Completed"
              ? "Pending"
              : "Completed",
        }
        : task
    );

    saveTasks(updatedTasks);
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === "All"
        ? true
        : task.priority === priorityFilter;

    const matchesStatus =
      statusFilter === "All"
        ? true
        : task.status === statusFilter;

    return (
      matchesSearch &&
      matchesPriority &&
      matchesStatus
    );
  });

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const overdueTasks = tasks.filter((task) => {
    return (
      task.status === "Pending" &&
      task.dueDate &&
      new Date(task.dueDate) < new Date()
    );
  }).length;

  return (
    <div className="container mt-4">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center">
        <h2>
          Welcome, {currentUser?.username}
        </h2>

        <button
          className="btn btn-danger"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      <hr />

      {/* Stats */}

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Total Tasks</h5>
              <h3>{totalTasks}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Completed</h5>
              <h3>{completedTasks}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Pending</h5>
              <h3>{pendingTasks}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5>Overdue</h5>
              <h3>{overdueTasks}</h3>
            </div>
          </div>
        </div>
      </div>

      {/*  Task Button */}

      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() =>
            navigate("/create-task")
          }
        >
          + Create Task
        </button>
      </div>

      {/* Search & Filters */}

      <div className="row mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search Task..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-control"
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Priorities
            </option>
            <option value="High">
              High
            </option>
            <option value="Medium">
              Medium
            </option>
            <option value="Low">
              Low
            </option>
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="All">
              All Status
            </option>
            <option value="Pending">
              Pending
            </option>
            <option value="Completed">
              Completed
            </option>
          </select>
        </div>
      </div>

      {/* Task List */}

      <div className="row">
        {filteredTasks.length === 0 ? (
          <p>No Tasks Found</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              className="col-md-6 mb-4"
              key={task.id}
            >
              <div className="card">
                <div className="card-body">
                  <h5>{task.title}</h5>

                  <p>{task.description}</p>

                  <p>
                    <strong>
                      Priority:
                    </strong>{" "}
                    {task.priority}
                  </p>

                  <p>
                    <strong>
                      Category:
                    </strong>{" "}
                    {task.category}
                  </p>

                  <p>
                    <strong>
                      Due Date:
                    </strong>{" "}
                    {task.dueDate}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {task.status}
                  </p>

                  <p>
                    <strong>
                      Created By:
                    </strong>{" "}
                    {task.createdBy}
                  </p>

                  <p>
                    <strong>
                      Assigned To:
                    </strong>{" "}
                    {task.assignedTo || "Not Assigned"}
                  </p>

                  <button
                    className="btn btn-success me-2"
                    onClick={() =>
                      toggleComplete(
                        task.id
                      )
                    }
                  >
                    {task.status ===
                      "Completed"
                      ? "Undo"
                      : "Complete"}
                  </button>

                  <button
                    className="btn btn-warning me-2"
                    onClick={() =>
                      navigate(
                        `/task/${task.id}`
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      deleteTask(
                        task.id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard