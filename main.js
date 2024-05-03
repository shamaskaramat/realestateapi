const express = require("express");
const dotenv = require("dotenv");
const app = express();
// import UserRoute from "./routes";

// .env
dotenv.config();

const port = process.env.PORT || 4000;
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Real estate project",
  });
});

// ---- routes
app.use("/api/v1/user", require("./routes/UserRoute"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
