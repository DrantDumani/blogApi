const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, required: true, minLength: 3, maxLength: 20 },
  email: { type: String, required: true },
  password: { type: String, required: true, minLength: 8 },
  isAdmin: { type: Boolean, default: false },
});

UserSchema.pre("save", async function (next) {
  const hashPw = await bcrypt.hash(this.password, 10);
  this.password = hashPw;
});

module.exports = mongoose.model("User", UserSchema);
