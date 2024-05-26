const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema({
  title: { type: String, required: true, minLength: 3 },
  subTitle: { type: String },
  content: { type: String, required: true, minLength: 3 },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  likes: { type: Array, default: [] },
});

PostSchema.virtual("mm-dd-yyyy").get(function () {
  // return date in the correct format
});

module.exports = mongoose.model("Post", PostSchema);
