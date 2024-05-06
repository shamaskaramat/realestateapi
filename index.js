const express = require("express");
const dotenv = require("dotenv");
const app = express();
const morgan = require("morgan");
const error = require("./Middleware/error");
const path = require("path");

// .env
dotenv.config();

// ---morgan
app.use(morgan("dev"));

// --- bodyParser
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Real estate project",
  });
});

// --- images path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---- routes
app.use("/api/v1/user", require("./routes/UserRoute"));
app.use("/api/v1/properties", require("./routes/PropertyRoute"));

// ---- error
app.use(error);

// Start the server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// --- unexpection error
process.on("uncaughtException", (err) => {
  console.log(
    `uncaughtException, server is shutting down due to ${err.message}`
  );
  server.close(() => {
    process.exit(1);
  });
});

// --- unhandle unhandledRejection
process.on("unhandledRejection", (err) => {
  console.log(
    `unhandledRejection, server is shutting down due to ${err.message}`
  );
  server.close(() => {
    process.exit(1);
  });
});
