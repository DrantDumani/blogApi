const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.sign_up);

router.post("/login", userController.log_in);

router.post("/loginAuthor", userController.log_in_author);

module.exports = router;
