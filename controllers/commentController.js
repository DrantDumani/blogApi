const Comment = require("../models/comment");
const Post = require("../models/post");
const passport = require("../passportConfig");
const validation = require("../middleware/validationUtils");

exports.get_all_comments = async (req, res, next) => {
  try {
    const allComments = await Comment.find(
      { blogPost: req.params.postId },
      { blogPost: 0 }
    )
      .populate({ path: "author", select: "username" })
      .sort({ timestamp: -1 })
      .exec();
    res.json(allComments);
  } catch (err) {
    next(err);
  }
};

exports.post_new_comment = [
  passport.authenticate("jwt", { session: false }),
  validation.commentValidator(),
  async (req, res, next) => {
    try {
      const blogPost = await Post.findById(req.params.postId, "title");
      if (!blogPost) return res.status(401).json("Unauthorized action");

      const comment = new Comment({
        content: req.body.content,
        author: req.user.id,
        blogPost: req.params.postId,
      });

      await comment.save();
      return res.json(comment);
    } catch (err) {
      return next(err);
    }
  },
];

exports.edit_comment = [
  passport.authenticate("jwt", { session: false }),
  validation.commentValidator(),
  async (req, res, next) => {
    try {
      const comment = await Comment.findOne({
        _id: req.params.commentId,
        author: req.user.id,
      }).exec();

      if (!comment) return res.status(401).json("Cannot edit this comment");

      comment.content = req.body.content;
      await comment.save();
      return res.json(comment);
    } catch (err) {
      return next(err);
    }
  },
];

exports.delete_comment = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const filterOpts = req.user.isAdmin
        ? { _id: req.params.commentId }
        : { _id: req.params.commentId, author: req.user.id };

      const deleted = await Comment.findOneAndDelete(filterOpts).exec();

      if (deleted) return res.json("success");
      else return res.status(401).json("failure");
    } catch (err) {
      return next(err);
    }
  },
];
