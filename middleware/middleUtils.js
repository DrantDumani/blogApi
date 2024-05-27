const passport = require("../passportConfig");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.checkLoggedIn = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) return res.status(403).send("User is already logged in");
    if (err) return next(err);
    return next();
  })(req, res, next);
};

exports.localUserAuth = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json("Invalid Credentials");
    } else {
      req.login(user, { session: false }, (err) => {
        if (err) return res.json("An error has occured");
        const payload = {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        };

        jwt.sign(
          payload,
          process.env.SECRET,
          { expiresIn: "7 days" },
          (err, token) => {
            return res.json(token);
          }
        );
      });
    }
  })(req, res, next);
};

exports.localAdminAuth = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json("Invalid Credentials");
    } else {
      req.login(user, { session: false }, (err) => {
        if (err) return res.json("An error has occured");
        if (!user.isAdmin) return res.status(401).json("Login unauthorized");
        const payload = {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        };

        jwt.sign(
          payload,
          process.env.SECRET,
          { expiresIn: "4 hours" },
          (err, token) => {
            return res.json(token);
          }
        );
      });
    }
  })(req, res, next);
};
