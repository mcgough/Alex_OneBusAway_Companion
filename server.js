const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { alexaVerify } = require("./lib");                     
const { intentController } = require('./intents/intent-controller');

app.use(
  bodyParser.json({
    verify: function getRawBody(req, res, buf) {
      req.rawBody = buf.toString();
    }
  })
);

app.post("/", alexaVerify, (req, res) => {
  const { intent } = req.body.request;
  return intent !== undefined 
    ? intentController(intent.name, req, res) 
    : res.json({});
});

app.listen(3000);


