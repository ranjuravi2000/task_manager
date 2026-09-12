const TaskPilotHistory = require("../models/TaskPilotHistory");

// GET TASKPILOT HISTORY---------------//
const getTaskPilotHistory = async (req, res) => {
  try {
    const history = await TaskPilotHistory.find({
      user: req.user._id,
    })
      .populate("task", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: history.length,
      history,
    });
  } catch (error) {
    console.error(
      "TaskPilot history error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch TaskPilot history",
      error: error.message,
    });
  }
};

module.exports = {
  getTaskPilotHistory,
};