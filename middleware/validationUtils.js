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
    body("tags.*", "Tags must be strings").optional().isString(),
  ];
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
  next();
};
