const mongoose = require("mongoose");

const taskPilotHistorySchema = new mongoose.Schema(
  {
    // User who received the AI analysis
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Task analyzed by TaskPilot
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    // Task information at the time of analysis
    taskTitle: {
      type: String,
      required: true,
    },

    progress: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      required: true,
    },

    // AI result
    risk: {
      type: String,
      required: true,
    },

    suggestions: {
      type: [String],
      default: [],
    },

    recoveryPlan: {
      type: [
        {
          day: String,
          label: String,
        },
      ],
      default: [],
    },

    estCompletion: {
      type: String,
      default: "",
    },

    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TaskPilotHistory",
  taskPilotHistorySchema
);