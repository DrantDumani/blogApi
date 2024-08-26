const Post = require("../models/post");
const User = require("../models/user");
const passport = require("../passportConfig");
const middleware = require("../middleware/middleUtils");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");
const client = require("../prisma/client");

exports.get_all_posts = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err) return next(err);
      req.user = user;
    })(req, res, next);
    const filter = {};
    if (req.query.tag) {
      filter.tags = {
        some: { name: { mode: "insensitive", equals: req.query.tag } },
      };
    }

    if (req.user.role !== "Super") req.query.published = true;

    if (req.query.published !== "" && req.query.published !== undefined) {
      filter.published = req.query.published;
    }

    const allPosts = await client.posts.findMany({
      where: filter,
      include: {
        tags: true,
      },
      orderBy: [
        {
          timestamp: "desc",
        },
      ],
    });

    res.json({ posts: allPosts });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

// You can split this up into super / admin and author versions.
// This would be the general reader route that only gets published posts
// Then there'd be another route that can get both published and unpublished
// But it would require the user to be an admin or author to use it at all.
// Authors can only see their own posts, whereas admins can see everything.
// For now, just change this to use postgres
// for now, just leave it at super since author doesn't exist
// returns both the likes count and the ids of the users who did the like
exports.get_single_post = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err) return next(err);
      req.user = user;
    })(req, res, next);
    const filter = { id: Number(req.params.postId) };
    if (!req.user && req.user.role !== "Super") {
      filter.published = true;
    }
    const post = await client.posts.findUnique({
      where: filter,
      include: {
        tags: true,
        _count: {
          select: {
            likes: true,
          },
        },
        likes: {
          where: {
            id: req.user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });
    if (post) return res.json(post);
    else return res.status(404).json("Not found");
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

// No author feature so only supers can create posts for now
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

      const tags = req.body.tags.map((tag) => ({
        where: { name: tag },
        create: { name: tag },
      }));

      const post = await client.posts.create({
        data: {
          title: req.body.title,
          subTitle: req.body.subTitle,
          content: req.body.content,
          authorId: req.user.id,
          published: req.body.published,
          tags: {
            connectOrCreate: tags,
          },
        },
      });

      res.json(post);
    } catch (err) {
      console.error(err);
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
        const tags = req.body.tags.map((tag) => ({
          where: { name: tag },
          create: { name: tag },
        }));

        const updatedPost = await client.posts.update({
          where: {
            id: Number(req.params.postId),
          },
          data: {
            title: req.body.title,
            subTitle: req.body.subTitle,
            content: req.body.content,
            authorId: req.user.id,
            published: req.body.published,
            edited_at: new Date(),
            tags: {
              set: [],
              connectOrCreate: tags,
            },
          },
        });

        if (!updatedPost) return res.status(404).json("Post not found");

        return res.json(updatedPost);
      }
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json("Post not found");
      console.error(err);
      return next(err);
    }
  },
];

exports.delete_post = [
  passport.authenticate("jwt", { session: false }),
  middleware.checkIsAdmin,
  async (req, res, next) => {
    try {
      await client.posts.delete({
        where: {
          id: Number(req.params.postId),
        },
      });
      return res.json(true);
    } catch (err) {
      if (err.code === "P2025") return res.json(false);
      return next(err);
    }
  },
];

// Likes and unlikes can stay as the same route for now, I guess
// depending on how much trouble it is, I might split them up
// that way, you don't have to do a 2nd query and can just do the action
//
exports.like_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      const post = await client.posts.findUnique({
        where: {
          id: Number(req.params.postId),
        },
        include: {
          _count: {
            select: {
              likes: true,
            },
          },
          likes: {
            where: {
              id: req.user.id,
            },

            select: {
              id: true,
            },
          },
        },
      });

      const isPostLiked = post.likes.some((like) => req.user.id === like.id);

      if (!isPostLiked) {
        await client.posts.update({
          where: {
            id: Number(req.params.postId),
          },
          data: {
            likes: {
              connect: {
                id: req.user.id,
              },
            },
          },
        });
      } else {
        await client.posts.update({
          where: {
            id: Number(req.params.postId),
          },
          data: {
            likes: {
              disconnect: {
                id: req.user.id,
              },
            },
          },
        });
      }

      return res.json({ likedPost: isPostLiked });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
];
