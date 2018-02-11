const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const db = require('./models');
const { alexaVerify } = require("./lib");                     
const { getarrivals, getnext } = require('./intents');

app.use(
  bodyParser.json({
    verify: function getRawBody(req, res, buf) {
      req.rawBody = buf.toString();
    }
  })
);

app.post("/", alexaVerify, async (req, res) => {
  const { userId } = req.body.session.user;
  const { intent } = req.body.request;
  const user = await db.User.find({ device_id: userId });
  const stop_id = user[0].stop_id; 
  if (intent !== undefined) {
    switch (intent.name) {
      case 'getarrivals':
        return res.json(await getarrivals(`1_${stop_id}`, req.body));
      case 'getnext':
        return res.json(getnext(req.body));
      default:
        return res.json({});
    }
  } 
  return res.json({});
});
app.listen(3000);


