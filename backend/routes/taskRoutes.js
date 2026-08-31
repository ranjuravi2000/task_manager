const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All task routes are protected-------
router.use(authMiddleware);

// Create a task-------
router.post("/", createTask);

// Get all tasks of logged-in user-------
router.get("/", getTasks);

// Get a single task---------//
router.get("/:id", getTask);

// Update a task//
router.put("/:id", updateTask);

// Delete a task//
router.delete("/:id", deleteTask);

module.exports = router;