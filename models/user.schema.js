const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sharedBy: [
    {
      email: { type: String, required: true }, // Email of the user sharing access
      accessType: {
        type: String,
        required: true,
        enum: ["view", "edit"], // Allowed access types
        default: "view", // Default to view access
      },
    },
  ],
  dashboardId: { type: mongoose.Schema.Types.ObjectId, ref: "Dashboard" }, // Reference to Dashboard
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" }, // Reference to Workspace
});

module.exports = mongoose.model("User", UserSchema);
