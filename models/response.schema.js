// const mongoose = require("mongoose");

// const responseSchema = new mongoose.Schema({
//   formId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Workspace",
//     required: true,
//   },
//   responses: [
//     {
//       time: { type: String, required: true },
//       data: { type: Map, of: String }, // Stores dynamic key-value pairs for responses
//     },
//   ],
// });

// const Response = mongoose.model("Response", responseSchema);

// module.exports = Response;

// const mongoose = require("mongoose");

// const responseSchema = new mongoose.Schema({
//   formId: {
//     type: String, // Change from ObjectId to String
//     required: true,
//   },
//   responses: [
//     {
//       time: { type: String, required: true },
//       data: { type: Object, required: true },
//     },
//   ],
// });

// module.exports = mongoose.model("Response", responseSchema);

// const mongoose = require("mongoose");

// const responseSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: false, //Optional
//   },
//   formId: {
//     type: String, // Change from ObjectId to String
//     required: true,
//   },
//   responses: {
//     type: Array,
//     default: [],
//   },
// });

// module.exports = mongoose.model("Response", responseSchema);

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
