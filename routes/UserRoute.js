const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");
const TokenVerify = require("../Middleware/TokenVerify");
const { upload } = require("../Middleware/Multer");

router.post("/signup", upload.single("file"), controller.CreateUser);

router.post("/login", controller.LoginUser);

router.get("/test", TokenVerify, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Real estate project",
    });
})
router.post("/forgot-password", controller.ForgetPassword);

// Route for resetting password based on token
// router.post("/reset-password", controller.ResetPassword);

// Route for setting a new password after OTP verification
router.post('/set-new-password', controller.SetNewPassword);
module.exports = router;
