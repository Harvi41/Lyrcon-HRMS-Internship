const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    targetAudience: {
      type: String,
      enum: ["all", "hr", "employee", "group", "individual"],
      required: true,
    },
    // Used when targetAudience is 'group' (e.g., 'Engineering', 'Human Resources', 'Finance')
    targetGroup: {
      type: String,
      trim: true,
    },
    // Used when targetAudience is 'individual' (direct user)
    targetRecipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Tracks users who have opened or marked this announcement as read
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Announcement", announcementSchema);
