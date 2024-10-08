const passport = require("../passportConfig");
const middleware = require("../middleware/middleUtils");
const validation = require("../middleware/validationUtils");
const { validationResult } = require("express-validator");
const client = require("../prisma/client");

exports.get_all_published_posts = async (req, res, next) => {
  try {
    const filter = { published: true };
    if (req.query.tag) {
      filter.tags = {
        some: { name: { mode: "insensitive", equals: req.query.tag } },
      };
    }

    const allPosts = await client.posts.findMany({
      omit: {
        content: true,
      },
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

exports.get_authored_posts = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err || (user.role !== "Author" && user.role !== "Super")) {
        return;
      }
      req.user = user;
    })(req, res, next);

    if (!req.user) return res.json({ err: "Forbidden" });

    const filter = { authorId: req.user.id };
    if (req.query.tag) {
      filter.tags = {
        some: { name: { mode: "insensitive", equals: req.query.tag } },
      };
    }

    const allPosts = await client.posts.findMany({
      omit: {
        content: true,
      },
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

    return res.json({ posts: allPosts });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

exports.get_all_posts = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err || user.role !== "Super") {
        return;
      }
      req.user = user;
    })(req, res, next);

    if (!req.user) return res.status(403).json({ err: "Forbidden" });

    const filter = {};
    if (req.query.tag) {
      filter.tags = {
        some: { name: { mode: "insensitive", equals: req.query.tag } },
      };
    }

    const allPosts = await client.posts.findMany({
      omit: {
        content: true,
      },
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

exports.get_single_published_post = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err) return next(err);
      req.user = user;
    })(req, res, next);

    const post = await client.posts.findUnique({
      where: { id: Number(req.params.postId), published: true },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        tags: true,
        _count: {
          select: {
            likes: true,
          },
        },
        likes: {
          where: {
            id: req.user.id || 0,
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

exports.get_single_authored_post = async (req, res, next) => {
  try {
    passport.authenticate("jwt", { session: false }, (err, user) => {
      if (err || (user.role !== "Author" && user.role !== "Super")) {
        return res.status(403).json({ err: "Forbidden" });
      }
      req.user = user;
    })(req, res, next);

    const post = await client.posts.findUnique({
      where: { id: Number(req.params.postId) },
      include: {
        tags: true,
      },
    });
    if (post) return res.json(post);
    else return res.status(404).json("Not found");
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

exports.create_post = [
  passport.authenticate("jwt", { session: false }),
  middleware.checkIsAuthor,
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
  middleware.checkIsAuthor,
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
  middleware.checkIsAuthor,
  async (req, res, next) => {
    const filter = { id: Number(req.params.postId) };
    if (req.user.role !== "Super") filter.authorId = req.user.id;
    try {
      await client.posts.delete({
        where: filter,
      });
      return res.json(true);
    } catch (err) {
      if (err.code === "P2025") return res.json(false);
      return next(err);
    }
  },
];

exports.like_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
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

      return res.json({ msg: "Liked post" });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  },
];

exports.unlike_post = [
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
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

      return res.json({ msg: "Unliked post" });
    } catch {
      console.error(err);
      return next(err);
    }
  },
];
