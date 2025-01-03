const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for public forms
  },
  formId: {
    type: String,
    required: true,
  },
  responses: {
    type: Array,
    default: [],
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  startsCount: {
    type: Number,
    default: 0,
  },
  completionCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Response", responseSchema);
