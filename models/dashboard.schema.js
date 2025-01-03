const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema({
  mainDirectory: {
    forms: [{ type: String }], // List of form names in the main directory
    folders: {
      type: Map, // Folder name as key, array of forms as value
      of: [String],
    },
  },
  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the owner User
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true }, // Ensure one dashboard per user
  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Dashboard", DashboardSchema);

// {
//   "_id": "64a7f8de8d3546d6af0e1a2d",
//   "mainDirectory": {
//     "forms": ["Form1", "Form2"],
//     "folders": {
//       "Folder1": ["Form3", "Form4"],
//       "Folder2": ["Form5"]
//     }
//   },
//   "user": "64a7f82e8d3546d6af0e1a1b"
// }
