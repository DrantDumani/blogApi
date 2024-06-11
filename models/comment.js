const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: { type: String, required: true, minLength: 3, maxLength: 400 },
  timestamp: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  blogPost: { type: Schema.Types.ObjectId, ref: "Post" },
});

module.exports = mongoose.model("Comment", CommentSchema);
