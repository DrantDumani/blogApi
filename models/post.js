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
  published: { type: Boolean, default: false },
});

PostSchema.pre("save", function (next) {
  this.tags = this.tags.map((tag) => tag.toLowerCase());
  next();
});

module.exports = mongoose.model("Post", PostSchema);
