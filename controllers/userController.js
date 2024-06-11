const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const middleware = require("../middleware/middleUtils");
const utility = require("../utils/utility");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");
const passport = require("../passportConfig");

exports.sign_up = [
  middleware.checkLoggedIn,
  validation.userValidator(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(403).json({ errs: errors.mapped() });
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
        return res.status(403).json({ errs: dupeErrors });
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
  passport.authenticate("jwt", { session: false }),
  middleware.checkIsAdmin,
  async (req, res, next) => {
    try {
      const [user, postsLikedByUser] = await Promise.all([
        User.findById(req.params.userId).exec(),
        Post.find({ likes: req.params.userId }),
      ]);

      if (user) {
        await Comment.deleteMany({ author: req.params.userId });
        for (const post of postsLikedByUser) {
          post.likes_count -= 1;
          const idIndex = post.likes.indexOf[req.params.userId];
          post.likes[idIndex] = post.likes[post.likes.length - 1];
          post.likes.pop();
        }
        await Promise.all(postsLikedByUser.map((post) => post.save()));
        await User.findByIdAndDelete(req.params.userId);

        return res.json(`${user.username} has been banned.`);
      } else {
        return res.status(404).json("User not found.");
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
];
