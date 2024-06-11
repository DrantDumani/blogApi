const { body } = require("express-validator");

exports.postValidator = () => {
  return [
    body("title", "Title must be at least 3 characters long")
      .isString()
      .bail()
      .trim()
      .isLength({ min: 3 }),
    body("subTitle").optional().isString().trim(),
    body("content", "Content must be at least 3 characters")
      .isString()
      .bail()
      .trim()
      .isLength({ min: 3 }),
    body("tags", "Tags must be an array of strings").isArray(),
    body("tags.*", "Tags must be strings").optional().isString().trim(),
    body("published").isBoolean(),
  ];
};

exports.userValidator = () => {
  return [
    body("username", "Name should be at least 3 characters long")
      .isString()
      .bail()
      .trim()
      .isLength({ min: 3 }),
    body("email", "Invalid email").isEmail(),
    body("password", "Password must be at least 8 characters")
      .isString()
      .bail()
      .isLength({ min: 8 }),
    body("confirmPw", "Passwords must match")
      .isString()
      .bail()
      .custom((value, { req }) => {
        return value === req.body.password;
      }),
  ];
};

exports.commentValidator = () => {
  return body("content", "Comment must be between 3 and 400 characters")
    .isString()
    .bail()
    .trim()
    .isLength({ min: 3, max: 400 });
};

exports.checkQueries = (req, res, next) => {
  req.query.sortBy =
    req.query.sortBy === "likes_count" || req.query.sortBy === "timestamp"
      ? req.query.sortBy
      : "timestamp";
  req.query.direction =
    req.query.direction === "-1" || req.query.direction === "1"
      ? req.query.direction
      : "-1";
  req.query.tag =
    typeof req.query.tag === "string" ? req.query.tag.toLowerCase() : "";

  req.query.limit = Number(req.query.limit) ? req.query.limit : "0";

  if (req.query.published === "false") req.query.published = false;
  else if (req.query.published) req.query.published = true;
  next();
};
