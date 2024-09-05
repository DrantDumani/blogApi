const middleware = require("../middleware/middleUtils");
const utility = require("../utils/utility");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");
const passport = require("../passportConfig");

const client = require("../prisma/client");
const bcrypt = require("bcrypt");

exports.sign_up = [
  middleware.checkLoggedIn,
  validation.userValidator(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(403).json({ errs: errors.mapped() });
      }

      const user = await client.users.create({
        data: {
          username: req.body.username,
          email: req.body.email,
          password: await bcrypt.hash(req.body.password, 10),
        },
      });
      utility.sign_jwt_token(req, res, user);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(403).json({
          dupeName: "Name already in use",
          dupeEmail: "Email already in use",
        });
      }
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
      const user = await client.users.delete({
        where: {
          id: Number(req.params.userId),
        },
      });
      return res.json(`${user.username} has been banned.`);
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json("User not found.");
      }
      console.log(err);
      next(err);
    }
  },
];
