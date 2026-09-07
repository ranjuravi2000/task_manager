const Task = require("../models/Task");
const getTaskStatistics = async (req, res) => {
  try {
   
    // Get logged-in user's ID
    

    const userId = req.user._id;

    const tasks = await Task.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId },
        { participants: userId },
      ],
    });

   
    // Total task ---//

    const total = tasks.length;

    
    // STATUS STATISTICS
    

    const pending = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const completed = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    
    // --------Priority STATISTICS-------//
   

    const highPriority = tasks.filter(
      (task) => task.priority === "high"
    ).length;

    const mediumPriority = tasks.filter(
      (task) => task.priority === "medium"
    ).length;

    const lowPriority = tasks.filter(
      (task) => task.priority === "low"
    ).length;

    
    // ----------OVERDUE TASKS --------////
   

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const overdue = tasks.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      const dueDate = new Date(task.dueDate);

      dueDate.setHours(0, 0, 0, 0);

      return (
        dueDate < today &&
        task.status !== "completed"
      );
    }).length;

    
    // -----completin percentage  ----//
   

    const completionPercentage =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);

    
    // AVERAGE PROGRESS    ------///
   

    const averageProgress =
      total === 0
        ? 0
        : Math.round(
            tasks.reduce(
              (sum, task) =>
                sum + (task.progress || 0),
              0
            ) / total
          );

   
    // ----send response------////
   

    res.status(200).json({
      success: true,

      statistics: {
        total,

        pending,

        inProgress,

        completed,

        overdue,

        highPriority,

        mediumPriority,

        lowPriority,

        completionPercentage,

        averageProgress,
      },
    });
  } catch (error) {
    console.error(
      "Error getting task statistics:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get task statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getTaskStatistics,
};