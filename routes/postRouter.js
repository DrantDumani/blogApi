const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.use((req, res, next) => {
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
});

router.get("/", postController.get_three_posts);

router.get("/all", postController.get_all_posts);

router.get("/:postId", postController.get_single_post);

module.exports = router;
