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

// {
//   "_id": "64d3c5a2d8e5b79b6f9a1234",
//   "forms": [
//     {
//       "name": "ContactForm",
//       "formElements": [
//         {
//           "type": "label",
//           "labelType": "Text",
//           "content": "Enter Name"
//         },
//         {
//           "type": "input",
//           "inputType": "text",
//           "content": "Enter your name here"
//         },
//         {
//           "type": "label",
//           "labelType": "Image",
//           "content": "https://example.com/logo.png"
//         },
//         {
//           "type": "input",
//           "inputType": "email",
//           "content": "Enter your email"
//         }
//       ]
//     },
//     {
//       "name": "FeedbackForm",
//       "formElements": [
//         {
//           "type": "label",
//           "labelType": "Text",
//           "content": "How was your experience?"
//         },
//         {
//           "type": "input",
//           "inputType": "text",
//           "content": "Share your feedback"
//         },
//         {
//           "type": "input",
//           "inputType": "button",
//           "content": "Submit"
//         }
//       ]
//     }
//   ],
//   "user": "64c3e5a1d7a4b67b9f8d5678"
// }
