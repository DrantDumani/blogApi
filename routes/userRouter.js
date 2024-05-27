const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/login", userController.log_in);

module.exports = router;
