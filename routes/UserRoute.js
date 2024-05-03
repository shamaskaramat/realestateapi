const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

router.post("/signup", controller.CreateUser);

module.exports = router;
