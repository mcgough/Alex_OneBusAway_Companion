const lib = require("../lib");
const db = require('../models');
const getArrivals = lib.getStopArrivalsDepartures;
const parseArrivals = lib.parseArrivals;
const createSpeech = lib.createSpeech;

class IntentResponse {
  constructor(speech, sessionData = {}, shouldEnd = true) {
    this.version = "1.0";
    this.sessionAttributes = sessionData;
    this.response = {
      shouldEndSession: shouldEnd,
      outputSpeech: {
        type: "SSML",
        ssml: speech
      }
    };
  }
}

const intents = {
  getArrivals: async (stopId, body) => {
    const { Route } = body.request.intent.slots;
    if (Route.value !== '?') {
      try {
        const data = await getArrivals(stopId);
        const parsedData = parseArrivals(data, Route.value);
        return new IntentResponse(createSpeech(parsedData), { parsedData, stopId }, false);
      } catch (err) {
        return err;
      }
    }
    const noRouteHeard = '<speak>I\'m sorry which route are you asking about?</speak>';
    return new IntentResponse(noRouteHeard, {}, false);
  },
  getNext: body => {
    const { attributes } = body.session;
    const speech = `<speak>After that the next bus will be arriving in ${attributes.parsedData[1].arrival} minutes</speak>`;
    return new IntentResponse(speech, attributes.parsedData);
  },
  notUser: body => {
    const speech = `<speak>What is your bus stop four digit id? It can be found either in the one bus away app or on the sign at the stop.</speak>`;
    return new IntentResponse(speech, {}, false);
  },
  setUserStop: async (body, deviceId) => {
    const { StopId } = body.request.intent.slots;
    if (StopId.value !== '?') {
      const user = await db.User.create({ stop_id: StopId.value, device_id: deviceId });
      console.log(user);
    }
  },
};

module.exports = intents;