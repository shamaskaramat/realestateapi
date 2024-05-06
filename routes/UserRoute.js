const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");
const TokenVerify = require("../Middleware/TokenVerify");
const { upload } = require("../Middleware/Multer");

router.post("/signup", upload.single("file"), controller.CreateUser);

router.post("/login", controller.LoginUser);

router.get(
  "/verify",
  TokenVerify,
  upload.single("file"),
  controller.TokenVerify
);

router.put(
  "/update",
  TokenVerify,
  upload.single("file"),
  controller.updateProfile
);

// Route for resetting password based on token
router.post("/forgotpassword", controller.ForgetPassword);

// Route for setting a new password after OTP verification
router.post("/resetpassword", controller.SetNewPassword);
module.exports = router;
