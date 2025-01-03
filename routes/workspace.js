const express = require("express");
const router = express.Router();
const Workspace = require("../models/workspace.schema");
const Dashboard = require("../models/dashboard.schema");
const authMiddleware = require("../middleware/auth");

router.get("/form/:formName", authMiddleware, async (req, res) => {
  const { formName } = req.params;
  try {
    // Find the workspace that contains the form with the given name
    const workspace = await Workspace.findOne({ "forms.name": formName });
    if (!workspace) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Retrieve the specific form from the workspace
    const form = workspace.forms.find((f) => f.name === formName);
    if (!form) {
      return res.status(404).json({ message: "Form not found in workspace" });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error("Error fetching form data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/formBot/:formName", async (req, res) => {
  const { formName } = req.params;
  try {
    // Find the workspace that contains the form with the given name
    const workspace = await Workspace.findOne({ "forms.name": formName });
    if (!workspace) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Retrieve the specific form from the workspace
    const form = workspace.forms.find((f) => f.name === formName);
    if (!form) {
      return res.status(404).json({ message: "Form not found in workspace" });
    }

    res.status(200).json(form);
  } catch (error) {
    console.error("Error fetching form data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Add new elements (bubbles) to the form
router.post("/form/:formName", authMiddleware, async (req, res) => {
  const { formName } = req.params; // Use form name from the URL
  const bubblesData = req.body; // Array of bubble data from the request body

  try {
    // Find the workspace that contains the specified form name
    const workspace = await Workspace.findOne({
      "forms.name": formName,
      user: req.user.id, // Ensure the workspace belongs to the logged-in user
    });

    if (!workspace) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Find the specific form by its name
    const form = workspace.forms.find((f) => f.name === formName);
    if (!form) {
      return res.status(404).json({ message: "Form not found in workspace." });
    }

    // Ensure bubblesData is an array and add all elements to the form's formElements array
    if (Array.isArray(bubblesData)) {
      form.formElements.push(...bubblesData);
    } else {
      return res.status(400).json({
        message: "Invalid input format. Expected an array of bubbles.",
      });
    }

    // Save the updated workspace
    await workspace.save();

    res.status(200).json({ message: "Bubbles added successfully", form });
  } catch (error) {
    console.error("Error adding bubbles:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE: Delete a specific bubble from the form
router.delete("/form/:formName/:bubbleId", authMiddleware, async (req, res) => {
  const { formName, bubbleId } = req.params;

  try {
    // Find the workspace that contains the form with the given name
    const workspace = await Workspace.findOne({
      "forms.name": formName,
      user: req.user.id, // Ensure the workspace belongs to the logged-in user
    });

    if (!workspace) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Find the specific form by its name
    const form = workspace.forms.find((f) => f.name === formName);
    if (!form) {
      return res.status(404).json({ message: "Form not found in workspace." });
    }

    // Find and remove the bubble by its ID
    const bubbleIndex = form.formElements.findIndex(
      (bubble) => bubble._id.toString() === bubbleId
    );

    if (bubbleIndex === -1) {
      return res.status(404).json({ message: "Bubble not found in the form." });
    }

    // Remove the bubble from the formElements array
    form.formElements.splice(bubbleIndex, 1);

    // Save the updated workspace
    await workspace.save();

    res.status(200).json({ message: "Bubble deleted successfully", form });
  } catch (error) {
    console.error("Error deleting bubble:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Edit a specific bubble's heading
router.put("/:formName/:bubbleId", authMiddleware, async (req, res) => {
  const { formName, bubbleId } = req.params;
  const { content } = req.body;

  try {
    // Find the workspace that contains the form with the given name
    const workspace = await Workspace.findOne({
      "forms.name": formName,
      user: req.user.id, // Ensure the workspace belongs to the logged-in user
    });

    if (!workspace) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Find the specific form by its name
    const form = workspace.forms.find((f) => f.name === formName);
    if (!form) {
      return res.status(404).json({ message: "Form not found in workspace." });
    }

    // Find the specific bubble by its ID
    const bubble = form.formElements.find(
      (element) => element._id.toString() === bubbleId
    );

    if (!bubble) {
      return res.status(404).json({ message: "Bubble not found in the form." });
    }

    // Update the bubble's content
    bubble.content = content;

    // Save the updated workspace
    await workspace.save();

    res.status(200).json({
      message: "Bubble updated successfully",
      form,
    });
  } catch (error) {
    console.error("Error editing bubble heading:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Edit the form's name
router.put("/form/:formName/name", authMiddleware, async (req, res) => {
  const { formName } = req.params;
  const { name: newName } = req.body;

  try {
    // Find the workspace that contains the form with the given name
    const workspace = await Workspace.findOne({
      "forms.name": formName,
      user: req.user.id, // Ensure the workspace belongs to the logged-in user
    });

    console.log("workspace", workspace);

    if (!workspace) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Find the specific form by its name
    const form = workspace.forms.find((f) => f.name === formName);
    console.log("form", form);
    if (!form) {
      return res.status(404).json({ message: "Form not found in workspace." });
    }

    // Update the form name in the workspace
    form.name = newName;
    await workspace.save();

    // Reflect the name change in the Dashboard schema
    const dashboard = await Dashboard.findOne({ user: req.user.id });

    console.log("dashboard", dashboard);
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found." });
    }

    // Check in the mainDirectory.forms
    const formIndex = dashboard.mainDirectory.forms.indexOf(formName);
    if (formIndex !== -1) {
      dashboard.mainDirectory.forms[formIndex] = newName;
    } else {
      // Check in the folders (Map structure)
      let formUpdated = false;
      for (const [folderName, forms] of dashboard.mainDirectory.folders) {
        const folderIndex = forms.indexOf(formName);
        if (folderIndex !== -1) {
          forms[folderIndex] = newName;
          dashboard.markModified(`mainDirectory.folders.${folderName}`);
          formUpdated = true;
          break;
        }
      }
      console.log("formUpdated", formUpdated);
      if (!formUpdated) {
        return res
          .status(404)
          .json({ message: "Form not found in dashboard folders." });
      }
    }

    // Save the updated dashboard
    await dashboard.save();

    res.status(200).json({ message: "Form name updated successfully" });
  } catch (error) {
    console.error("Error updating form name:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
