const Post = require("../models/post");
const User = require("../models/user");
const passport = require("../passportConfig");
const middleware = require("../middleware/middleUtils");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");

exports.get_three_posts = async (req, res, next) => {
  try {
    const posts = await Post.find({}, "title subTitle timestamp likes_count")
      .sort({ [req.query.sortBy]: Number(req.query.direction) })
      .limit(3)
      .exec();
    res.json(posts);
  } catch (err) {
    return next(err);
  }
};

exports.get_all_posts = async (req, res, next) => {
  try {
    const filter = req.query.tag ? { tags: req.query.tag } : {};
    const allPosts = await Post.find(
      filter,
      "title subTitle timestamp likes_count"
    )
      .sort({ [req.query.sortBy]: Number(req.query.direction) })
      .exec();
    res.json(allPosts);
  } catch (err) {
    return next(err);
  }
};

exports.get_single_post = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId).exec();
    res.json(post);
  } catch (err) {
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
      if (!errors.isEmpty()) {
        return res.status(403).json("Invalid format");
      }

      const post = new Post({
        title: req.body.title,
        subTitle: req.body.subTitle,
        content: req.body.content,
        author: req.user.id,
        tags: req.body.tags,
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
        const update = {
          title: req.body.title,
          content: req.body.content,
          tags: req.body.tags,
          edited_at: Date.now(),
        };

        if (req.body.subTitle) update.subTitle = req.body.subTitle;

        const updatedPost = await Post.findByIdAndUpdate(
          req.params.postId,
          { $set: update },
          {
            new: true,
          }
        ).exec();
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
        return res.json("Success");
      }
    } catch (err) {
      return next(err);
    }
  },
];

exports.like_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const [post, user] = await Promise.all([
        Post.findById(req.params.postId, "likes likes_count").exec(),
        User.findById(req.params.userId, "username").exec(),
      ]);
      const userId = user._id.toString();

      if (!post.likes.includes(userId)) {
        post.likes_count += 1;
        post.likes.push(userId);

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
      const [post, user] = await Promise.all([
        Post.findById(req.params.postId, "likes likes_count").exec(),
        User.findById(req.params.userId, "username").exec(),
      ]);
      const userId = user._id.toString();
      const idIndex = post.likes.indexOf(userId);

      if (idIndex > -1) {
        post.likes_count -= 1;
        [post.likes[idIndex], post.likes[post.likes.length - 1]] = [
          post.likes[post.likes.length - 1],
          post.likes[idIndex],
        ];
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
