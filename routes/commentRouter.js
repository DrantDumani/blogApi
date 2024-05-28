const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.get("/:postId", commentController.get_all_comments);

router.post("/:postId", commentController.post_new_comment);

router.put("/:commentId", commentController.edit_comment);

router.delete("/:commentId", commentController.delete_comment);

module.exports = router;
