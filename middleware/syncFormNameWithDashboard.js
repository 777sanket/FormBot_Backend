// const Dashboard = require("../models/Dashboard"); // Import the Dashboard model
const Dashboard = require("../models/dashboard.schema");

const syncFormNameWithDashboard = async function (next) {
  try {
    const workspace = this;

    for (const form of workspace.forms) {
      const originalForm = await workspace.constructor.findOne({
        "forms._id": form._id,
      });

      if (originalForm) {
        const oldFormName = originalForm.forms.find((f) =>
          f._id.equals(form._id)
        ).name;

        if (oldFormName !== form.name) {
          // Update the form name in the mainDirectory.forms array
          const updatedInForms = await Dashboard.updateOne(
            { "mainDirectory.forms": oldFormName },
            { $set: { "mainDirectory.forms.$": form.name } }
          );

          // If not updated in mainDirectory.forms, check mainDirectory.folders
          if (!updatedInForms.nModified) {
            await Dashboard.updateOne(
              { "mainDirectory.folders": { $exists: true } },
              {
                $set: {
                  "mainDirectory.folders.$[folder].$[form]": form.name,
                },
              },
              {
                arrayFilters: [
                  { "folder.forms": { $exists: true } },
                  { form: oldFormName },
                ],
              }
            );
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error("Error syncing form names with dashboard:", error);
    next(error);
  }
};

module.exports = { syncFormNameWithDashboard };
