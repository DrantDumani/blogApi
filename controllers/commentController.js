const passport = require("../passportConfig");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");
const client = require("../prisma/client");

exports.get_all_comments = async (req, res, next) => {
  try {
    const allComments = await client.comments.findMany({
      where: {
        postId: Number(req.params.postId),
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });
    res.json(allComments);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.post_new_comment = [
  passport.authenticate("jwt", { session: false }),
  validation.commentValidator(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(403).json({ err: "Unable to post comment" });
      }

      const comment = await client.comments.create({
        data: {
          content: req.body.content,
          authorId: req.user.id,
          postId: Number(req.params.postId),
        },
      });

      return res.json(comment);
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
];

exports.edit_comment = [
  passport.authenticate("jwt", { session: false }),
  validation.commentValidator(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(403).json({ err: "Unable to post comment" });
      }

      const editedComment = await client.comments.update({
        where: {
          id: Number(req.params.commentId),
          authorId: req.user.id,
        },
        data: {
          content: req.body.content,
        },
      });

      return res.json(editedComment);
    } catch (err) {
      if (err.code === "P2025")
        return res.status(401).json("Cannot edit this comment");
      return next(err);
    }
  },
];

exports.delete_comment = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const filterOpts = { where: { id: Number(req.params.commentId) } };
      if (req.user.role !== "Super") {
        filterOpts.where.authorId = req.user.id;
      }
      const deleted = await client.comments.delete(filterOpts);

      if (deleted) return res.json("success");
      else return res.status(401).json("failure");
    } catch (err) {
      if (err.code === "P2025") return res.status(401).json("failure");
      console.error(err);
      return next(err);
    }
  },
];
