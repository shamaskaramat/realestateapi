const express = require("express");
const router = express.Router();
const controller = require("../controllers/PropertyController");
const TokenVerify = require("../Middleware/TokenVerify");
const { upload } = require("../Middleware/Multer");

router.post(
  "/create",
  upload.array("file"),
  TokenVerify,
  controller.createProperty
);

router.get("/properties", controller.GetProperties);

router.delete("/delete/:id", TokenVerify, controller.deleteProperty);

router.get("/property/:id", controller.GetPropertybyId);

router.post("/filtration", controller.FilterProperty);

module.exports = router;
