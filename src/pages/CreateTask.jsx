import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateTask() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const saveTask = () => {
    if (!title || !description || !dueDate) {
      alert("Please fill all required fields");
      return;
    }

    const currentUser = JSON.parse(
      localStorage.getItem("currentUser")
    );

    const tasks =
      JSON.parse(localStorage.getItem("tasks")) || [];

    const newTask = {
      id: Date.now(),
      title,
      description,
      priority,
      category,
      dueDate,
      status: "Pending",
      createdBy: currentUser.username,
        assignedTo,
      createdAt: new Date().toISOString(),
      participants: [currentUser.username],
      requests: [],
      comments: [],
    };

    tasks.push(newTask);

    localStorage.setItem(
      "tasks",
      JSON.stringify(tasks)
    );

    alert("Task Created Successfully");

    navigate("/dashboard");
  };

  return (
    <div className="container mt-4">

      <div className="card">
        <div className="card-body">

          <h2 className="mb-4">
            Create Task
          </h2>

          <div className="mb-3">
            <label className="form-label">
              Task Title
            </label>

            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Description
            </label>

            <textarea
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Priority
            </label>

            <select
              className="form-select"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Category
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Development"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Due Date
            </label>

            <input
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Assign To
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Enter Username"
              value={assignedTo}
              onChange={(e) =>
                setAssignedTo(e.target.value)
              }
            />
          </div>
          <button
            className="btn btn-success"
            onClick={saveTask}
          >
            Save Task
          </button>

        </div>
      </div>

    </div>
  );
}

export default CreateTask