const passport = require("../passportConfig");
const User = require("../models/user");
const middleware = require("../middleware/middleUtils");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.log_in = [middleware.checkLoggedIn, middleware.localUserAuth];

exports.log_in_author = [middleware.checkLoggedIn, middleware.localAdminAuth];

exports.ban_user = [
  // confirm that the user is an admin
  // then ban the user by removing their account
  // you'll need to delete their comments too
];
