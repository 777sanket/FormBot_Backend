const express = require("express");
const router = express.Router();
const Response = require("../models/response.schema");

// Add new response
router.post("/form/:formId", async (req, res) => {
  const { formId } = req.params;
  const { responses } = req.body;

  try {
    let responseDoc = await Response.findOne({ formId });

    if (!responseDoc) {
      // If no document exists for the formId, create a new one
      responseDoc = new Response({ formId, responses: [] });
    }

    // Append new responses to the existing document
    responseDoc.responses.push(...responses);
    // Increment the completion count
    responseDoc.completionCount += 1;

    await responseDoc.save();

    res.status(200).json({ message: "Responses saved successfully!" });
  } catch (error) {
    console.error("Error saving responses:", error);
    res.status(500).json({ message: "Failed to save responses." });
  }
});

// Get responses for a form
router.get("/response/:formId", async (req, res) => {
  const { formId } = req.params;

  try {
    const responseDoc = await Response.findOne({ formId });

    if (!responseDoc) {
      return res
        .status(404)
        .json({ message: "No responses found for this form." });
    }

    res.status(200).json({ responses: responseDoc.responses });
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Failed to fetch responses." });
  }
});

// Increment views count when form is accessed
router.get("/increment-views/:formId", async (req, res) => {
  const { formId } = req.params;

  try {
    const responseDoc = await Response.findOneAndUpdate(
      { formId },
      { $inc: { viewsCount: 1 } },
      { new: true, upsert: true } // Create the document if it doesn't exist
    );

    res.status(200).json({
      message: "Views count updated",
      viewsCount: responseDoc.viewsCount,
    });
  } catch (error) {
    console.error("Error updating views count:", error);
    res.status(500).json({ message: "Failed to update views count." });
  }
});

// Increment starts count when the form is partially filled
router.post("/increment-starts/:formId", async (req, res) => {
  const { formId } = req.params;

  try {
    const responseDoc = await Response.findOneAndUpdate(
      { formId },
      { $inc: { startsCount: 1 } },
      { new: true, upsert: true } // Create the document if it doesn't exist
    );

    res.status(200).json({
      message: "Starts count updated",
      startsCount: responseDoc.startsCount,
    });
  } catch (error) {
    console.error("Error updating starts count:", error);
    res.status(500).json({ message: "Failed to update starts count." });
  }
});

router.get("/form-statistics/:formId", async (req, res) => {
  const { formId } = req.params;

  try {
    const responseDoc = await Response.findOne({ formId });

    if (!responseDoc) {
      return res.status(404).json({ message: "Form not found." });
    }

    const { viewsCount, startsCount, completionCount } = responseDoc;

    res.status(200).json({ viewsCount, startsCount, completionCount });
  } catch (error) {
    console.error("Error fetching form statistics:", error);
    res.status(500).json({ message: "Failed to fetch form statistics." });
  }
});

module.exports = router;
