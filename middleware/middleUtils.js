const passport = require("../passportConfig");
const utility = require("../utils/utility");
require("dotenv").config();

exports.checkLoggedIn = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) return res.status(403).send("User is already logged in");
    if (err) return next(err);
    return next();
  })(req, res, next);
};

exports.checkIsAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(401).send("Forbidden");
  return next();
};

exports.localUserAuth = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ err: "Invalid Credentials" });
    } else {
      utility.sign_jwt_token(req, res, user, next);
    }
  })(req, res, next);
};

exports.localAdminAuth = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err || !user || !user.isAdmin) {
      return res.status(401).json({ err: "Invalid Credentials" });
    } else {
      utility.sign_jwt_token(req, res, user, next);
    }
  })(req, res, next);
};
