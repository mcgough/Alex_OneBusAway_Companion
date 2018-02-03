const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const lib = require("./lib");
const getArrivals = lib.getStopArrivalsDepartures;
const parseArrivals = lib.parseArrivals;
const createSpeech = lib.createSpeech;
const stopId = "1_3541";

const alexaVerify = lib.alexaVerify;

app.use(bodyParser.json());
app.post("/getArrivals", async (req, res) => {
  try {
    const data = await getArrivals(stopId);
    const parsedData = parseArrivals(data);
    const speech = createSpeech(parsedData);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": speech
        }
      }
    });
  } catch (err) {
    res.json({ err });
  }
});
app.listen(3000);