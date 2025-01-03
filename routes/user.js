const express = require("express");
const router = express.Router();
const User = require("../models/user.schema");
const Dashboard = require("../models/dashboard.schema");
const Workspace = require("../models/workspace.schema");
const Response = require("../models/response.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    return res.status(400).json({ message: "User already exist" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log("Error creating user", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(400).json({ message: "Wrong Username or Password" });
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     return res.status(400).json({ message: "Wrong Username or Password" });
//   }

//   // Ensure the user has a dashboard
//   const dashboard = await Dashboard.findOne({ user: user._id });
//   if (!dashboard) {
//     try {
//       await Dashboard.create({
//         user: user._id,
//         mainDirectory: { forms: [], folders: {} },
//       });
//       console.log("Dashboard created for user:", user.email);
//     } catch (error) {
//       console.error("Error creating dashboard:", error);
//       return res.status(500).json({ message: "Error creating dashboard" });
//     }
//   }

//   // Ensure the user has a workspace
//   const workspace = await Workspace.findOne({ user: user._id });
//   console.log("Workspace:", workspace);
//   if (!workspace) {
//     try {
//       await Workspace.create({
//         user: user._id,
//         forms: [],
//       });
//       console.log("Workspace created for user:", user.email);
//     } catch (error) {
//       console.error("Error creating workspace:", error);
//       return res.status(500).json({ message: "Error creating workspace" });
//     }
//   }

//   // Ensure the user has at least one response
//   const response = await Response.findOne({ user: user._id });
//   if (!response) {
//     try {
//       await Response.create({
//         user: user._id,
//         responses: [],
//       });
//       console.log("Response record created for user:", user.email);
//     } catch (error) {
//       console.error("Error creating response record:", error);
//       return res
//         .status(500)
//         .json({ message: "Error creating response record" });
//     }
//   }

//   // Generate token
//   const payload = {
//     user: {
//       id: user._id,
//       email: user.email,
//     },
//   };
//   const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });

//   res.status(200).json({ token });
// });

// router.post("/logout", (req, res) => {
//   res.status(200).json({ message: "User logged out" });
// });

// module.exports = router;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Wrong Username or Password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Wrong Username or Password" });
  }

  // Ensure the user has a dashboard
  const dashboard = await Dashboard.findOne({ user: user._id });
  if (!dashboard) {
    try {
      await Dashboard.create({
        user: user._id,
        mainDirectory: { forms: [], folders: {} },
      });
      console.log("Dashboard created for user:", user.email);
    } catch (error) {
      console.error("Error creating dashboard:", error);
      return res.status(500).json({ message: "Error creating dashboard" });
    }
  }

  // Ensure the user has a workspace
  const workspace = await Workspace.findOne({ user: user._id });
  console.log("Workspace:", workspace);
  if (!workspace) {
    try {
      await Workspace.create({
        user: user._id,
        forms: [],
      });
      console.log("Workspace created for user:", user.email);
    } catch (error) {
      console.error("Error creating workspace:", error);
      return res.status(500).json({ message: "Error creating workspace" });
    }
  }

  // Ensure the user has at least one response
  const response = await Response.findOne({ user: user._id });
  if (!response) {
    try {
      await Response.create({
        user: user._id,
        responses: [],
      });
      console.log("Response record created for user:", user.email);
    } catch (error) {
      console.error("Error creating response record:", error);
      return res
        .status(500)
        .json({ message: "Error creating response record" });
    }
  }

  // Generate token
  const payload = {
    user: {
      id: user._id,
      email: user.email,
    },
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });

  res.status(200).json({ token });
});

module.exports = router;
