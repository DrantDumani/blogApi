const passport = require("../passportConfig");
const User = require("../models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.log_in = [
  (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (user) return res.status(403).send("User is already logged in");
      if (err) return next(err);
      return next();
    })(req, res, next);
  },
  (req, res, next) => {
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
  },
];
