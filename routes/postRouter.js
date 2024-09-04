const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const validation = require("../middleware/validationUtils");

router.get(
  "/",
  validation.checkQueries,
  postController.get_all_published_posts
);

router.get(
  "/writer_posts",
  validation.checkQueries,
  postController.get_authored_posts
);

router.get("/all", validation.checkQueries, postController.get_all_posts);

router.get("/:postId/writer_post", postController.get_single_authored_post);

router.post("/", postController.create_post);

router.put("/:postId", postController.edit_post);

router.delete("/:postId", postController.delete_post);

router.get("/:postId", postController.get_single_published_post);

router.put("/:postId/like", postController.like_post);

router.put("/:postId/unlike", postController.unlike_post);

module.exports = router;
