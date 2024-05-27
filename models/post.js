const mongoose = require("mongoose");
const { Schema } = mongoose;

const PostSchema = new Schema({
  title: { type: String, required: true, minLength: 3 },
  subTitle: { type: String },
  content: { type: String, required: true, minLength: 3 },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  edited_at: { type: Date },
  likes: { type: [String], default: [] },
  likes_count: { type: Number, default: 0 },
  tags: { type: [String], default: [] },
});

PostSchema.pre("save", function (next) {
  this.tags = this.tags.map((tag) => tag.toLowerCase());
  next();
});

PostSchema.virtual("mm-dd-yyyy").get(function () {
  // return date in the correct format
});

module.exports = mongoose.model("Post", PostSchema);
