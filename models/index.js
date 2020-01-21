const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/BUS_STOP");

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);

const User = require("./User");

exports.User = User;
