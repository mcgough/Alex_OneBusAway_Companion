const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  stop_id: String,
  device_id: String
});

const User = mongoose.model("User", userSchema);

module.exports = User;
