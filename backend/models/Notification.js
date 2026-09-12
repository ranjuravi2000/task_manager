const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema(
  {
    //--------- User who should receive the notification -----  //
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //---------- User who triggered the notification--------//
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ------Related task-----------//
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    //---------- Notification type-----------------------//
    type: {
      type: String,
      enum: [
        "task_assigned",
        "participant_added",
        "task_completed",
        "comment_added",
        "deadline_reminder",
      ],
      required: true,
    },

    //--- Notification message---//
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Whether the notification has been read   //
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
