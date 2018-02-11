const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/BUS_STOP');

const User = require('./User');

exports.User = User;