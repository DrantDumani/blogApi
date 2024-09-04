const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const logger = require("morgan");
require("dotenv").config();
const compression = require("compression");
const helmet = require("helmet");
const RateLimit = require("express-rate-limit");

const postRouter = require("./routes/postRouter");
const userRouter = require("./routes/userRouter");
const commentRouter = require("./routes/commentRouter");

const port = process.env.PORT;

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

const app = express();
app.use(compression());
app.use(helmet());
app.use(limiter);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: [
      "https://almagorge-admin-portal.netlify.app",
      "https://almagorge.netlify.app",
      "http://localhost:5173",
    ],
  })
);

app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Currently running on port ${port}`);
});
