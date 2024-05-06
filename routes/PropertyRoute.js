const express = require("express");
const router = express.Router();
const controller = require("../controllers/PropertyController");
const TokenVerify = require("../Middleware/TokenVerify");
const { upload } = require("../Middleware/Multer");

router.post(
  "/create",
  upload.single("file"),
  TokenVerify,
  controller.createProperty
);

router.get("/properties", controller.GetProperties);

module.exports = router;
