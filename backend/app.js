require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// ------------- Routes -------------------//
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const taskStatisticsRoutes = require("./routes/taskStatisticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const taskPilotRoutes = require("./routes/taskPilotRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

// Check Gemini API key
console.log(
  "Gemini API key loaded:",
  !!process.env.GEMINI_API_KEY
);

console.log(
  "Gemini API key length:",
  process.env.GEMINI_API_KEY
    ? process.env.GEMINI_API_KEY.length
    : 0
);


connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --------------- API ROUTES ---------------//

// Authentication
app.use("/api/auth", authRoutes);

// Users
app.use("/api/users", userRoutes);

// Task statistics
app.use("/api/tasks", taskStatisticsRoutes);

// Tasks
app.use("/api/tasks", taskRoutes);

// Comments
app.use("/api/tasks", commentRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// TaskPilot AI
app.use("/api/taskpilot", taskPilotRoutes);

app.use("/api/subscription", subscriptionRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Taskify Backend API is running",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});