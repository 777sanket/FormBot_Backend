const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Dashboard = require("../models/dashboard.schema");
const User = require("../models/user.schema");
const Workspace = require("../models/workspace.schema");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/auth");
const dotenv = require("dotenv");
dotenv.config();

// Get Dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // console.log("Requesting user ID:", req.user.id);
    // console.log("Request Body:", req.body);
    const dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      const newDashboard = new Dashboard({
        user: req.user.id,
        mainDirectory: { forms: [], folders: new Map() },
      });
      await newDashboard.save();
      return res.status(201).json({
        message: "Dashboard created successfully",
        dashboard: newDashboard,
      });
    }
    res.status(200).json(dashboard);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// // Create Folder or Form
// router.post("/dashboard", authMiddleware, async (req, res) => {
//   const { name, type, folderName, dashboardOwner } = req.body; // Add dashboardOwner to the request body
//   const userEmail = dashboardOwner === "my" ? req.user.email : dashboardOwner;

//   try {
//     const owner = await User.findOne({ email: userEmail });
//     const dashboard = await Dashboard.findOne({ user: owner._id });

//     if (!dashboard) {
//       return res.status(404).json({ message: "Dashboard not found" });
//     }

//     if (type === "folder") {
//       if (dashboard.mainDirectory.folders.has(name)) {
//         return res.status(400).json({ message: "Folder already exists" });
//       }
//       dashboard.mainDirectory.folders.set(name, []);
//     } else if (type === "form") {
//       if (folderName) {
//         if (!dashboard.mainDirectory.folders.has(folderName)) {
//           return res.status(400).json({ message: "Folder does not exist" });
//         }
//         dashboard.mainDirectory.folders.get(folderName).push(name);
//       } else {
//         dashboard.mainDirectory.forms.push(name);
//       }
//     } else {
//       return res.status(400).json({ message: "Invalid type" });
//     }

//     await dashboard.save();
//     res.status(201).json({ message: `${type} created successfully` });
//   } catch (error) {
//     console.log("Error creating folder or form", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// POST: Create Folder or Form
router.post("/dashboard", authMiddleware, async (req, res) => {
  const { name, type, folderName } = req.body; // `type` can be 'folder' or 'form'

  try {
    const dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    if (type === "folder") {
      if (dashboard.mainDirectory.folders.has(name)) {
        return res.status(400).json({ message: "Folder already exists" });
      }
      dashboard.mainDirectory.folders.set(name, []);
    } else if (type === "form") {
      if (folderName) {
        if (!dashboard.mainDirectory.folders.has(folderName)) {
          return res.status(400).json({ message: "Folder does not exist" });
        }
        dashboard.mainDirectory.folders.get(folderName).push(name);
      } else {
        dashboard.mainDirectory.forms.push(name);
      }

      // Add form to the Workspace schema
      const workspace = await Workspace.findOne({ user: req.user.id });
      if (!workspace) {
        // Create a new workspace if not found
        const newWorkspace = new Workspace({
          user: req.user.id,
          forms: [
            {
              name,
              formElements: [],
            },
          ],
        });
        await newWorkspace.save();
      } else {
        // Add the form to an existing workspace
        workspace.forms.push({
          name,
          formElements: [],
        });
        await workspace.save();
      }
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    await dashboard.save();
    res.status(201).json({ message: `${type} created successfully` });
  } catch (error) {
    console.error("Error creating folder or form:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// // Delete Folder or Form
// router.delete("/dashboard", authMiddleware, async (req, res) => {
//   const { name, type, folderName, dashboardOwner } = req.body; // Add dashboardOwner to the request body
//   const userEmail = dashboardOwner === "my" ? req.user.email : dashboardOwner;

//   try {
//     const owner = await User.findOne({ email: userEmail });
//     const dashboard = await Dashboard.findOne({ user: owner._id });

//     if (!dashboard) {
//       return res.status(404).json({ message: "Dashboard not found" });
//     }

//     if (type === "folder") {
//       if (!dashboard.mainDirectory.folders.has(name)) {
//         return res.status(400).json({ message: "Folder does not exist" });
//       }
//       dashboard.mainDirectory.folders.delete(name);
//     } else if (type === "form") {
//       if (folderName) {
//         if (!dashboard.mainDirectory.folders.has(folderName)) {
//           return res.status(400).json({ message: "Folder does not exist" });
//         }
//         const updatedForms = dashboard.mainDirectory.folders
//           .get(folderName)
//           .filter((form) => form !== name);
//         dashboard.mainDirectory.folders.set(folderName, updatedForms);
//       } else {
//         dashboard.mainDirectory.forms = dashboard.mainDirectory.forms.filter(
//           (form) => form !== name
//         );
//       }
//     } else {
//       return res.status(400).json({ message: "Invalid type" });
//     }

//     await dashboard.save();
//     res.status(200).json({ message: `${type} deleted successfully` });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Delete Folder or Form
router.delete("/dashboard", authMiddleware, async (req, res) => {
  const { name, type, folderName, dashboardOwner } = req.body; // Add dashboardOwner to the request body
  const userEmail = dashboardOwner === "my" ? req.user.email : dashboardOwner;

  try {
    // Find the owner of the dashboard
    const owner = await User.findOne({ email: userEmail });
    const dashboard = await Dashboard.findOne({ user: owner._id });

    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found" });
    }

    if (type === "folder") {
      if (!dashboard.mainDirectory.folders.has(name)) {
        return res.status(400).json({ message: "Folder does not exist" });
      }
      // Remove all forms in the folder from workspace
      const folderForms = dashboard.mainDirectory.folders.get(name);
      await Workspace.updateOne(
        { user: owner._id },
        { $pull: { forms: { name: { $in: folderForms } } } }
      );
      dashboard.mainDirectory.folders.delete(name);
    } else if (type === "form") {
      if (folderName) {
        if (!dashboard.mainDirectory.folders.has(folderName)) {
          return res.status(400).json({ message: "Folder does not exist" });
        }
        const updatedForms = dashboard.mainDirectory.folders
          .get(folderName)
          .filter((form) => form !== name);
        dashboard.mainDirectory.folders.set(folderName, updatedForms);
      } else {
        dashboard.mainDirectory.forms = dashboard.mainDirectory.forms.filter(
          (form) => form !== name
        );
      }
      // Remove the form from workspace
      await Workspace.updateOne(
        { user: owner._id },
        { $pull: { forms: { name } } }
      );
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    await dashboard.save();
    res.status(200).json({ message: `${type} deleted successfully` });
  } catch (error) {
    console.error("Error deleting folder or form:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Share Dashboard
router.post("/dashboard/share", authMiddleware, async (req, res) => {
  const { email, accessType } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required to share the dashboard." });
  }

  if (!accessType || !["view", "edit"].includes(accessType)) {
    return res
      .status(400)
      .json({ message: "Invalid access type. Must be 'view' or 'edit'." });
  }

  try {
    // Find the user to share with (a2@gmail.com)
    const userToShareWith = await User.findOne({ email });
    if (!userToShareWith) {
      return res.status(404).json({ message: "User to share with not found." });
    }

    // Find the current user's dashboard (a1@gmail.com's dashboard)
    const dashboardToShare = await Dashboard.findOne({ user: req.user.id });
    if (!dashboardToShare) {
      return res
        .status(404)
        .json({ message: "Dashboard not found for the current user." });
    }

    // Check if the dashboard is already shared with a2@gmail.com
    const alreadyShared = userToShareWith.sharedBy.some(
      (shared) => shared.email === req.user.email
    );
    console.log("Sharing dashboard with:", userToShareWith.email);

    if (req.user.email === userToShareWith.email) {
      return res
        .status(400)
        .json({ message: "Cannot share dashboard with yourself." });
    }

    if (alreadyShared) {
      return res
        .status(400)
        .json({ message: "Dashboard already shared with this user." });
    }

    // Add the current user (a1@gmail.com) to a2's `sharedBy` array
    userToShareWith.sharedBy.push({
      email: req.user.email, // Email of the user sharing the dashboard
      accessType: accessType || "view", // Default to "view" if not provided
    });

    await userToShareWith.save(); // Save the updated user

    res.status(200).json({ message: "Dashboard shared successfully." });
  } catch (error) {
    console.error("Error sharing dashboard:", error);
    res.status(500).json({ message: "Server error while sharing dashboard." });
  }
});

//Fetch shared dashboards
router.get("/dashboard/shared", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // console.log("User sharedBy:", user.name);
    // If no shared dashboards
    if (!user.sharedBy || user.sharedBy.length === 0) {
      return res.status(200).json({ sharedBy: [] }); // Return an empty array
    }

    // Fetch dashboards shared with the user
    const sharedDashboards = await Promise.all(
      user.sharedBy.map(async (shared) => {
        const owner = await User.findOne({ email: shared.email });
        const dashboard = await Dashboard.findOne({ user: owner._id });
        // console.log("owner:", owner);
        return {
          sharedName: owner.name,
          name: user.name,
          email: shared.email,
          accessType: shared.accessType,
          forms: dashboard?.mainDirectory?.forms || [],
          folders: dashboard?.mainDirectory?.folders || {},
        };
      })
    );

    res.status(200).json({ sharedBy: sharedDashboards });
  } catch (error) {
    console.error("Error fetching shared dashboards:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate a shareable link
router.post("/dashboard/generate-link", authMiddleware, async (req, res) => {
  const { accessType } = req.body;

  if (!accessType || !["view", "edit"].includes(accessType)) {
    return res.status(400).json({ message: "Invalid access type." });
  }

  try {
    const token = jwt.sign(
      {
        email: req.user.email,
        accessType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Link valid for 24 hours
    );
    const shareableLink = `${process.env.FRONTEND_URL}/share/${token}`;
    res.status(200).json({ link: shareableLink });
  } catch (error) {
    console.error("Error generating shareable link:", error);
    res.status(500).json({ message: "Server error while generating link." });
  }
});

// Handle link access
router.post("/dashboard/access-link", authMiddleware, async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email: sharedByEmail, accessType } = decoded;

    // Validate the shared user
    const sharedByUser = await User.findOne({ email: sharedByEmail });
    if (!sharedByUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const dashboardToShare = await Dashboard.findOne({
      user: sharedByUser._id,
    });
    if (!dashboardToShare) {
      return res.status(404).json({ message: "Dashboard not found." });
    }

    // Add the shared dashboard to the current user's `sharedBy` array
    const currentUser = await User.findById(req.user.id);
    const alreadyShared = currentUser.sharedBy.some(
      (shared) => shared.email === sharedByEmail
    );

    if (req.user.email === sharedByEmail) {
      return res
        .status(400)
        .json({ message: "Cannot share dashboard with yourself." });
    }

    if (alreadyShared) {
      return res
        .status(400)
        .json({ message: "Dashboard already shared with you." });
    }

    currentUser.sharedBy.push({
      email: sharedByEmail,
      accessType,
    });
    await currentUser.save();

    res.status(200).json({ message: "Dashboard added successfully." });
  } catch (error) {
    console.error("Error accessing link:", error);
    res.status(400).json({ message: "Invalid or expired link." });
  }
});

module.exports = router;
