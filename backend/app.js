
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// -------------Routes-------------------//
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const taskStatisticsRoutes = require("./routes/taskStatisticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

dotenv.config();


connectDB();



const app = express();



app.use(cors());

app.use(express.json());


// ---------------API ROUTES---------------//


// ****Authentication routes***//
app.use("/api/auth", authRoutes);

// ***User routes***//
app.use("/api/users", userRoutes);

app.use("/api/tasks", taskStatisticsRoutes);

// -------Task routes-----//
app.use("/api/tasks", taskRoutes);

// ------Comment routes------------//
app.use("/api/tasks", commentRoutes);

//Notificn rote //
app.use("/api/notifications", notificationRoutes);



app.get("/", (req, res) => {
  res.json({
    message: "Taskify Backend API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
