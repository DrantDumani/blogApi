const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const validation = require("../middleware/validationUtils");

router.get("/", validation.checkQueries, postController.get_three_posts);

router.get("/all", validation.checkQueries, postController.get_all_posts);

router.post("/", postController.create_post);

router.put("/:postId", postController.edit_post);

router.delete("/:postId", postController.delete_post);

router.get("/:postId", postController.get_single_post);

router.put("/:postId/like", postController.like_post);

router.delete("/:postId/like", postController.unlike_post);

module.exports = router;
