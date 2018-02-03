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

const getRouteAndTime = data => {
  return {
    routeName: data.routeShortName,
    arrival: differenceInMinutes(data.predictedArrivalTime, new Date())
  };
};

exports.createSpeech = data => {
  const validBuses = data.filter(time => time.arrival > 0);
  const results = validBuses.reduce((result, bus) => {
    result += `The ${bus.routeName} is arriving in ${bus.arrival} minutes <break time="1s"> `;
    return result
  }, "")
  return `<speak>${results}</speak>`;
}

exports.parseArrivals = data => {
  const { arrivalsAndDepartures } = data;
  return arrivalsAndDepartures.map(arrival => getRouteAndTime(arrival));
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

exports.isMyStop = stop => {
  const exp = new RegExp("12th Ave S & S Massachusetts St", "g");
  return exp.test(stop.name) && stop.direction === "N";
};

exports.printArrivalTime = arrivalTime => {
  console.log(
    chalk.blue(arrivalTime.routeShortName),
    `${differenceInMinutes(
      arrivalTime.predictedArrivalTime,
      new Date()
    )} minutes`
  );
};
