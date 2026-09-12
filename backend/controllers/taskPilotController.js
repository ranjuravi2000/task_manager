const Task = require("../models/Task");
const TaskPilotHistory = require("../models/TaskPilotHistory");

const {
  generateTaskPilotAnalysis,
} = require("../services/taskPilotAI");


// TASKPILOT AI
const getTaskPilotAnalysis = async (req, res) => {
  try {
    const userId = req.user._id;

    
    // GET USER'S PENDING TASKS
   

    const tasks = await Task.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
        { participants: userId },
      ],

      // Do not include completed tasks
      status: {
        $ne: "completed",
      },
    });

   
    // NO PENDING TASKS
    

    if (tasks.length === 0) {
      return res.status(200).json({
        message:
          "No pending tasks available for TaskPilot AI",

        task: null,
        analysis: null,
      });
    }

  
    // PRIORITY WEIGHTS
    const priorityWeight = {
      high: 30,
      medium: 20,
      low: 10,
    };

    const now = new Date();



    const today = new Date(now);

    today.setHours(0, 0, 0, 0);

    
    // SCORE EVERY TASK
    

    const scoredTasks = tasks.map((task) => {
      const priority =
        (task.priority || "low").toLowerCase();

      const progress = Number(
        task.progress || 0
      );

      const createdDate = new Date(
        task.createdAt
      );

     

      const pendingDays = Math.max(
        0,
        Math.floor(
          (now - createdDate) /
            (1000 * 60 * 60 * 24)
        )
      );

      // DEADLINE INFORMATION
      

      const dueDate = task.dueDate
        ? new Date(task.dueDate)
        : null;

      let isOverdue = false;
      let isDueToday = false;
      let daysUntilDue = null;
      let overdueDays = 0;

      if (dueDate) {
        const dueDay = new Date(dueDate);

        dueDay.setHours(0, 0, 0, 0);

        const difference =
          Math.round(
            (dueDay - today) /
              (1000 * 60 * 60 * 24)
          );

        daysUntilDue = difference;

        // Task is overdue
        if (difference < 0) {
          isOverdue = true;

          overdueDays = Math.abs(
            difference
          );
        }

        // Task is due today
        if (difference === 0) {
          isDueToday = true;
        }
      }

     
      // CALCULATE TASK SCORE
     

      let score = 0;

      // 1. PRIORITY SCORE
      score +=
        priorityWeight[priority] || 10;

      // 2. PENDING DAYS SCORE
      score += Math.min(
        pendingDays,
        20
      );

      // 3. OVERDUE SCORE
      if (isOverdue) {
        score += 40;

        score += Math.min(
          overdueDays * 3,
          30
        );
      }

      // 4. DUE DATE PROXIMITY SCORE
      if (isDueToday) {
        score += 30;
      } else if (
        daysUntilDue !== null &&
        daysUntilDue > 0
      ) {
        if (daysUntilDue === 1) {
          score += 25;
        } else if (daysUntilDue <= 3) {
          score += 20;
        } else if (daysUntilDue <= 7) {
          score += 15;
        } else if (daysUntilDue <= 14) {
          score += 5;
        }
      }

      // 5. PROGRESS SCORE
      if (progress < 25) {
        score += 15;
      } else if (progress < 50) {
        score += 10;
      } else if (progress < 75) {
        score += 5;
      }

      // 6. STATUS SCORE
      if (task.status === "pending") {
        score += 5;
      }

      if (task.status === "in-progress") {
        score += 3;
      }

      
      // RETURN SCORED TASK
      

      return {
        ...task.toObject(),

        pendingDays,
        overdueDays,
        daysUntilDue,
        isOverdue,
        isDueToday,
        score,
      };
    });

    
    // SORT TASKS BY SCORE
    

    scoredTasks.sort(
      (a, b) => b.score - a.score
    );

  
    // SELECT MOST IMPORTANT TASK
    

    const topTask = scoredTasks[0];

    
    // GENERATE GEMINI AI ANALYSIS
    

    const analysis =
      await generateTaskPilotAnalysis(
        topTask
      );

    // --------------------------------------------------
    // DUPLICATE PREVENTION
    // --------------------------------------------------
    //
    // Check the latest history record for this
    // user and this task.
    //
    // If progress, status and priority are still
    // exactly the same, we do NOT create another
    // history record.
    //
    // This prevents duplicate records when the user
    // simply refreshes or opens TaskPilot again.
    // --------------------------------------------------

    const latestHistory =
      await TaskPilotHistory.findOne({
        user: userId,
        task: topTask._id,
      }).sort({
        createdAt: -1,
      });

    // Check whether task state is unchanged
    const isDuplicate =
      latestHistory &&
      Number(latestHistory.progress) ===
        Number(topTask.progress || 0) &&
      latestHistory.status ===
        topTask.status &&
      latestHistory.priority ===
        topTask.priority;

    // --------------------------------------------------
    // SAVE ONLY IF TASK STATE CHANGED
    // --------------------------------------------------

    if (!isDuplicate) {
      await TaskPilotHistory.create({
        user: userId,

        task: topTask._id,

        taskTitle: topTask.title,

        progress:
          topTask.progress || 0,

        status: topTask.status,

        priority: topTask.priority,

        risk:
          analysis.risk,

        suggestions:
          analysis.suggestions || [],

        recoveryPlan:
          analysis.recoveryPlan || [],

        estCompletion:
          analysis.estCompletion || "",

        reason:
          analysis.reason || "",
      });

      console.log(
        "TaskPilot history saved."
      );
    } else {
      console.log(
        "Duplicate TaskPilot history prevented."
      );
    }

    // --------------------------------------------------
    // SEND RESPONSE
    // --------------------------------------------------

    res.status(200).json({
      message:
        "TaskPilot analysis generated successfully",

      task: topTask,

      analysis,
    });

  } catch (error) {
    console.error(
      "TaskPilot controller error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate TaskPilot analysis",

      error: error.message,
    });
  }
};



module.exports = {
  getTaskPilotAnalysis,
};
