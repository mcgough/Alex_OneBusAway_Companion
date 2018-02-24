require("dotenv").config();
const axios = require("axios");
const chalk = require("chalk");
const differenceInMinutes = require("date-fns/difference_in_minutes");
const apiRoot = "http://api.pugetsound.onebusaway.org/api/";
const alexaVerifier = require("alexa-verifier");

exports.alexaVerify = (req, res, next) => {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({ message: "Verification Failure", error: err });
      } else {
        next();
      }
    }
  );
};

/**
 * Returns route name and minutes till arrival
 * @param  { object } data - Stop info
 */
const getRouteAndTime = data => {
  return {
    routeName: data.routeShortName,
    arrival: differenceInMinutes(data.predictedArrivalTime, new Date())
  };
};

/**
 * @param  { array } data
 * @return { string }
 */
exports.createSpeech = data => {
  const validArrivals = data.filter(time => time.arrival > 0);
  const results = validArrivals.reduce((result, bus, index) => {
    result +=
      index === 0
        ? `The next ${bus.routeName} is arriving in ${bus.arrival} ${bus.arrival >
          1
            ? "minutes"
            : "minute"}<break time="1s"/> `
        : "";
    return result;
  }, "");
  return `<speak>${results}</speak>`;
};

/**
 * @param  { object } data
 * @param  { string } route
 */
exports.parseArrivals = (data, route) => {
  const { arrivalsAndDepartures } = data;
  return arrivalsAndDepartures
    .filter(arrival => arrival.routeShortName === route)
    .map(arrival => getRouteAndTime(arrival));
};

exports.Stop = class Stop {
  constructor(stop) {
    this.id = stop.id;
    this.routes = stop.routeIds;
  }
  async getArrivalsDepartures() {
    try {
      const { data } = await axios.get(
        `${apiRoot}where/arrivals-and-departures-for-stop/${this
          .id}?key=${process.env.apiKey}`
      );
      return data.data.entry;
    } catch (err) {
      return { arrivalsAndDepartures: [], error: "Rate Limit Exceeded" };
    }
  }
  async printArrivalTimes() {
    try {
      const times = await this.getArrivalsDepartures();
      if (!times.arrivalsAndDepartures.length) throw new Error(times.error);
      times.arrivalsAndDepartures.forEach(time => {
        console.log(
          chalk.blue(time.routeShortName),
          `${differenceInMinutes(
            time.predictedArrivalTime,
            new Date()
          )} minutes`
        );
      });
    } catch (err) {
      console.log(chalk.red(err));
    }
  }
};

/**
 * @param  { string } id
 * @returns { array }
 */
exports.getStopArrivalsDepartures = async id => {
  try {
    const { data } = await axios.get(
      `${apiRoot}where/arrivals-and-departures-for-stop/${id}?key=${process.env
        .apiKey}`
    );
    return data.data.entry;
  } catch (err) {
    return {
      arrivalsAndDepartures: [],
      error: "There was an error",
      response: err
    };
  }
};

/**
 * @param  { object } coords - lat, lon
 */
exports.getStopsForLocation = async coords => {
  try {
    const { data } = await axios.get(
      `${apiRoot}where/stops-for-location.json?key=${process.env
        .apiKey}&lat=${coords.lat}&lon=${coords.lon}`
    );
    return data;
  } catch (err) {
    console.log(err);
  }
};

/**
 * @param  { string } route
 */
exports.getRoute = async route => {
  try {
    const response = await axios.get(
      `${apiRoot}where/route/${route}.json?key=${process.env.apiKey}`
    );
    return response.data.data;
  } catch (err) {
    console.log(`${chalk.red("Error:")} ${err.response.data.text}`);
  }
};

/**
 * @param  { object } stop
 */
exports.isMyStop = stop => {
  const exp = new RegExp("12th Ave S & S Massachusetts St", "g");
  return exp.test(stop.name) && stop.direction === "N";
};

/**
 * @param  { objects } arrivalTime
 */
exports.printArrivalTime = arrivalTime => {
  console.log(
    chalk.blue(arrivalTime.routeShortName),
    `${differenceInMinutes(
      arrivalTime.predictedArrivalTime,
      new Date()
    )} minutes`
  );
};
