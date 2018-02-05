const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { alexaVerify } = require("./lib");                     
const { getarrivals, getnext } = require('./intents');

const stopId = "1_3541";

app.use(
  bodyParser.json({
    verify: function getRawBody(req, res, buf) {
      req.rawBody = buf.toString();
    }
  })
);

app.post("/", alexaVerify, async (req, res) => {
  const { intent } = req.body.request;
  switch (intent.name) {
    case 'getarrivals':
      res.json(await getarrivals(stopId, req.body));
      break;
    case 'getnext':
      res.json(getnext(req.body));
      break;
    default:
      break;
  }
});
app.listen(3000);

