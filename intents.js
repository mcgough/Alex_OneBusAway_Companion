const lib = require("./lib");
const getArrivals = lib.getStopArrivalsDepartures;
const parseArrivals = lib.parseArrivals;
const createSpeech = lib.createSpeech;

class IntentResponse {
  constructor(speech, sessionData = {}, shouldEnd = true) {
    this.version = "1.0";
    this.sessionAttributes = sessionData;
    this.response = {
      shouldEndSesssion: shouldEnd,
      outputSpeech: {
        type: "SSML",
        ssml: speech
      }
    };
  }
}

const intents = {
  getarrivals: async (stopId, body) => {
    const route = body.request.intent.slots.Number.value;
    try {
      const data = await getArrivals(stopId);
      const parsedData = parseArrivals(data, route);
      return new IntentResponse(createSpeech(parsedData), { parsedData, stopId }, false);
    } catch (err) {
      return err;
    }
  },
  getnext: body => {
    const { attributes } = body.session;
    const speech = `<speak>After that the next bus will be arriving in ${attributes.parsedData[1].arrival} minutes</speak>`;
    return new IntentResponse(speech, attributes.parsedData);
  }
};

module.exports = intents;
