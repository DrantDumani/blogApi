const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const validation = require("../middleware/validationUtils");

router.get(
  "/",
  validation.checkQueries,
  postController.get_all_published_posts
);

// get all posts by a specific Author
// verify user is author or super role
// router.get("/:authorId", validation.checkQueries, postContro)

router.post("/", postController.create_post);

router.put("/:postId", postController.edit_post);

router.delete("/:postId", postController.delete_post);

router.get("/:postId", postController.get_single_post);

router.put("/:postId/like", postController.like_post);

module.exports = router;
