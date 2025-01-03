const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoutes = require("./routes/user");
const dashboardRoutes = require("./routes/dashboard");
const workspaceRoutes = require("./routes/workspace");
const responseRoutes = require("./routes/response");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api", responseRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
