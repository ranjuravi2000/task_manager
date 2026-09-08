const express = require("express");

const router = express.Router();

const {
  getTaskPilotAnalysis,
} = require("../controllers/taskPilotController");
const {
  getTaskPilotHistory,
} = require("../controllers/taskPilotHistoryController");

const authMiddleware = require("../middleware/authMiddleware");

// --------------------------------------------------
// GET TASKPILOT AI ANALYSIS
// --------------------------------------------------

router.get(
  "/",
  authMiddleware,
  getTaskPilotAnalysis
);
router.get(
  "/history",
  authMiddleware,
  getTaskPilotHistory
);
module.exports = router;