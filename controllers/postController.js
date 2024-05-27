const Post = require("../models/post");
const passport = require("../passportConfig");

exports.get_three_posts = async (req, res, next) => {
  const posts = await Post.find({}, "title subTitle timestamp likes_count")
    .sort({ [req.query.sortBy]: Number(req.query.direction) })
    .limit(3)
    .exec();
  res.json(posts);
};

exports.get_all_posts = async (req, res, next) => {
  const filter = req.query.tag ? { tags: req.query.tag } : {};
  const allPosts = await Post.find(
    filter,
    "title subTitle timestamp likes_count"
  )
    .sort({ [req.query.sortBy]: Number(req.query.direction) })
    .exec();
  res.json(allPosts);
};

exports.get_single_post = async (req, res, next) => {
  const post = await Post.findById(req.params.postId).exec();
  res.json(post);
};

exports.create_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    if (!req.user.isAdmin) return res.status(401).send("Forbidden");
    else {
      const post = new Post({
        title: req.body.title,
        subTitle: req.body.subTitle,
        content: req.body.content,
        author: req.user.id,
        tags: req.body.tags,
      });

      await post.save();
      res.json(post);
    }
  },
];
