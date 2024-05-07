const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");
const TokenVerify = require("../Middleware/TokenVerify");
const { upload } = require("../Middleware/Multer");
const AdminVerify = require("../middleware/AdminVerify");

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

router.post("/forgotpassword", controller.ForgetPassword);

router.post("/resetpassword", controller.SetNewPassword);

router.post(
  "/role/:id",
  TokenVerify,
  AdminVerify("admin"),
  controller.updateUserRole
);

router.get(
  "/getallusers",
  TokenVerify,
  AdminVerify("admin"),
  controller.getAllUsers
);
router.get("/:userId", controller.findUserById);

module.exports = router;
