const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { alexaVerify } = require("./lib");                     
const { getarrivals, getnext } = require('./intents');
const mongoose = require('mongoose');
const User = require('./models/user');
mongoose.connect('mongodb://localhost/BUS_STOP');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const stopId = "1_3541";

User.find({ stop_id: '3541'}, (err, user) => {
  console.log(user);
  // User.findByIdAndUpdate(user[0]._id, { stop_id: '3541' }, (err, user) => {
  //   console.log(user);
  // });
});

app.use(
  bodyParser.json({
    verify: function getRawBody(req, res, buf) {
      req.rawBody = buf.toString();
    }
  })
);

app.post("/", alexaVerify, async (req, res) => {
  const { intent } = req.body.request;
  if (intent !== undefined) {
    switch (intent.name) {
      case 'getarrivals':
        return res.json(await getarrivals(stopId, req.body));
      case 'getnext':
        return res.json(getnext(req.body));
      default:
        return res.json({});
    }
  } 
  return res.json({});
});
app.listen(3000);


