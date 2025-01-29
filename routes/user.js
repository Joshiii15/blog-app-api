const express = require("express");
const { isLoggedIn, verify, verifyAdmin } = require("../auth");
const userController = require("../controllers/user");
const router = express.Router();

//Registration
router.post("/register", userController.registerUser);

//Login
router.post("/login", userController.loginUser);

module.exports = router;
