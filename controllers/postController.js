const Post = require("../models/post");
const User = require("../models/user");
const passport = require("../passportConfig");
const middleware = require("../middleware/middleUtils");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");

exports.get_all_posts = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err) return next(err);
      req.user = user;
    })(req, res, next);
    const filter = {};
    if (req.query.tag) filter.tags = req.query.tag;

    if (!req.user.isAdmin) req.query.published = true;

    if (req.query.published !== "" && req.query.published !== undefined) {
      filter.published = req.query.published;
    }
    const allPosts = await Post.find(
      filter,
      "title subTitle timestamp likes_count published"
    )
      .sort({ [req.query.sortBy]: Number(req.query.direction) })
      .limit(Number(req.query.limit))
      .exec();

    res.json({ posts: allPosts });
  } catch (err) {
    return next(err);
  }
};

exports.get_single_post = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err) return next(err);
      req.user = user;
    })(req, res, next);
    const filter = { _id: req.params.postId };
    if (!req.user && !req.user.isAdmin) {
      filter.published = true;
    }
    const post = await Post.findOne(filter).exec();
    if (post) return res.json(post);
    else return res.status(404).json("Not found");
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.create_post = [
  passport.authenticate("jwt", { session: false }),
  middleware.checkIsAdmin,
  validation.postValidator(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()) {
        return res.status(403).json("Invalid format");
      }

      const post = new Post({
        title: req.body.title,
        subTitle: req.body.subTitle,
        content: req.body.content,
        author: req.user.id,
        tags: req.body.tags,
        published: req.body.published,
      });

      await post.save();
      res.json(post);
    } catch (err) {
      return next(err);
    }
  },
];

exports.edit_post = [
  passport.authenticate("jwt", { session: false }),
  middleware.checkIsAdmin,
  validation.postValidator(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(403).json("Invalid format");
      } else {
        const post = await Post.findById(req.params.postId).exec();

        if (!post) return res.status(404).json("Post not found");

        if (req.body.published && !post.published) {
          post.timestamp = Date.now();
          delete post.edited_at;
        } else if (req.body.published && post.published) {
          post.edited_at = Date.now();
        }

        post.title = req.body.title;
        post.content = req.body.content;
        post.tags = req.body.tags;
        post.published = req.body.published;
        if (req.body.subTitle) post.subTitle = req.body.subTitle;

        const updatedPost = await post.save();
        return res.json(updatedPost);
      }
    } catch (err) {
      return next(err);
    }
  },
];

exports.delete_post = [
  passport.authenticate("jwt", { session: false }),
  middleware.checkIsAdmin,
  async (req, res, next) => {
    try {
      const deletedPost = await Post.findByIdAndDelete(req.params.postId);
      if (deletedPost) {
        return res.json(true);
      }
      return res.json(false);
    } catch (err) {
      return next(err);
    }
  },
];

exports.like_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.findById(
        req.params.postId,
        "likes likes_count"
      ).exec();

      if (!post.likes.includes(req.user.id)) {
        post.likes_count += 1;
        post.likes.push(req.user.id);

        const liked = await Post.findByIdAndUpdate(
          req.params.postId,
          {
            $set: { likes: post.likes, likes_count: post.likes_count },
          },
          { new: true }
        ).exec();
        return res.json({ likes_count: liked.likes_count });
      }

      return res.status(403).json("User has already liked this post");
    } catch (err) {
      return next(err);
    }
  },
];

exports.unlike_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const post = await Post.findById(
        req.params.postId,
        "likes likes_count"
      ).exec();

      const idIndex = post.likes.indexOf(req.user.id);

      if (idIndex > -1) {
        post.likes_count -= 1;
        post.likes[idIndex] = post.likes[post.likes.length - 1];

        post.likes.pop();

        const liked = await Post.findByIdAndUpdate(
          req.params.postId,
          {
            $set: { likes: post.likes, likes_count: post.likes_count },
          },
          { new: true }
        ).exec();
        return res.json({ likes_count: liked.likes_count });
      }

      return res.status(403).json("User cannot remove a like from this post");
    } catch (err) {
      return next(err);
    }
  },
];
