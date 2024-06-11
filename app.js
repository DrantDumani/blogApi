const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const logger = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");

const postRouter = require("./routes/postRouter");
const userRouter = require("./routes/userRouter");
const commentRouter = require("./routes/commentRouter");

const mongoURI = process.env.PRODUCTION_DB || process.env.DEVELOPMENT_DB;
const port = process.env.PORT;

mongoose.set("strictQuery", "false");
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoURI);
}

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

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
