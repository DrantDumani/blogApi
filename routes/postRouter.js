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

router.post("/", postController.create_post);

router.put("/:postId", postController.edit_post);

router.delete("/:postId", postController.delete_post);

router.get("/:postId", postController.get_single_post);

router.put("/:postId/:userId/like", postController.like_post);

router.delete("/:postId/:userId/like", postController.unlike_post);

module.exports = router;
