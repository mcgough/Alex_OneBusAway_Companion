const lib = require("../lib");
const db = require('../models');
const getStopArrivals = lib.getStopArrivalsDepartures;
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
    console.log(stopId);
    const { Route } = body.request.intent.slots;
    if (Route.value !== '?') {
      try {
        const data = await getStopArrivals(stopId);
        const parsedData = parseArrivals(data, Route.value);
        return new IntentResponse(
          createSpeech(parsedData),
          { parsedData, stopId },
          false,
        );
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
  setUserStop: async (body, deviceId, userId) => {
    const { StopId } = body.request.intent.slots;
    let speech;
    if (StopId.value !== '?') {
      try {
        const data = await getStopArrivals(`1_${StopId.value}`);
        if (!data.arrivalsAndDepartures.length) throw new Error('Could not find stop');
        const user = await db.User.findOneAndUpdate(
          { device_id: deviceId },
          { stop_id: StopId.value },
          { upsert: true },
        );
        speech = `<speak>Your stop has been set to ${StopId.value}</speak>`;
        return new IntentResponse(speech, {}, true);
      } catch (err) {
        console.log('error:', err);
        speech = `<speak>I could not find a bus stop with the id of ${StopId.value.split('').join(' ')}</speak>`
        return new IntentResponse(speech, {}, true);
      }
    }
  },
};

module.exports = intents;