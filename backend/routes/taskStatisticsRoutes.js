
const express = require("express");

const {
  getTaskStatistics,
} = require("../controllers/taskStatisticsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// GET TASK STATISTICS---------//


router.get(
  "/statistics",
  authMiddleware,
  getTaskStatistics
);

module.exports = router;