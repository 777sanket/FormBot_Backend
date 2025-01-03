const mongoose = require("mongoose");

const WorkspaceSchema = new mongoose.Schema({
  forms: [
    {
      name: { type: String, required: true }, // Form name
      formElements: [
        {
          type: {
            type: String,
            required: true,
            enum: ["label", "input"],
          }, // Specifies if it's a label or input
          labelType: {
            type: String,
            enum: ["Text", "Image"],
            required: function () {
              return this.type === "label";
            },
          }, // Required if the type is "label"
          content: { type: String, required: true }, // Text for label or value for input
          inputType: {
            type: String,
            enum: [
              "text",
              "number",
              "email",
              "phone",
              "button",
              "date",
              "rating",
              "button",
            ],
            required: function () {
              return this.type === "input";
            },
          }, // Required if the type is "input"
        },
      ],
    },
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the owner User
});

module.exports = mongoose.model("Workspace", WorkspaceSchema);
