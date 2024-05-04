const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");
const TokenVerify = require("../Middleware/TokenVerify");
const {upload} = require("../Middleware/Multer");

router.post("/signup",upload.single("file"), controller.CreateUser);

router.post("/login", controller.LoginUser);

router.get("/test", TokenVerify , (req,res)=>{
    res.status(200).json({
        success: true,
        message: "Real estate project",
    });
})

module.exports = router;
