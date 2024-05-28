const User = require("../models/user");
const middleware = require("../middleware/middleUtils");
const utility = require("../utils/utility");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");

exports.sign_up = [
  middleware.checkLoggedIn,
  validation.userValidator(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(403).json("Invalid user data");
      }

      const [dupeEmail, dupeName] = await Promise.all([
        User.findOne({ email: req.body.email }).exec(),
        User.findOne({ username: req.body.username }).exec(),
      ]);

      if (dupeEmail || dupeName) {
        const dupeErrors = {
          dupeName: dupeName ? "Name already in use" : undefined,
          dupeEmail: dupeEmail ? "Email already in use" : undefined,
        };
        return res.status(403).json(dupeErrors);
      }
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      await user.save();
      utility.sign_jwt_token(req, res, user);
    } catch (err) {
      next(err);
    }
  },
];

exports.log_in = [middleware.checkLoggedIn, middleware.localUserAuth];

exports.log_in_author = [middleware.checkLoggedIn, middleware.localAdminAuth];

exports.ban_user = [
  // confirm that the user is an admin
  // then ban the user by removing their account
  // you'll need to delete their comments too
];
