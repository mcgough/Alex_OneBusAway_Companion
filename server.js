require('dotenv').config();
const axios = require("axios");
const chalk = require("chalk");
const differenceInMinutes = require('date-fns/difference_in_minutes');
const apiRoot = "http://api.pugetsound.onebusaway.org/api/";
const coords = {
  lat: "47.588656",
  lon: "-122.318176"
};

const getStopArrivalsDepartures = async stop => {
  try {
    const { data } = await axios.get(
      `${apiRoot}where/arrivals-and-departures-for-stop/${stop[0].id}?key=${process.env.apiKey}`
    );
    return data.data.entry;
  } catch (err) {
    return { arrivalsAndDepartures: [], error: 'Request Limit' };
  }
};

const getStopsForLocation = async coords => {
  try {
    const { data } = await axios.get(
      `${apiRoot}where/stops-for-location.json?key=${process.env.apiKey}&lat=${coords.lat}&lon=${coords.lon}`
    );
    return data; 
  } catch (err) {
    console.log(err);
  }
};

const getRoute = async route => {
  try {
    const response = await axios.get(
      `${apiRoot}where/route/${route}.json?key=${process.env.apiKey}`
    );
    return response.data.data;
  } catch (err) {
    console.log(`${chalk.red('Error:')} ${err.response.data.text}`);
  }
};

const isMyStop = (stop) => {
  const exp = new RegExp('12th Ave S & S Massachusetts St', "g");
  return exp.test(stop.name) && stop.direction === "N";
};

const printArrivalTime = (arrivalTime) => {
  console.log(
    chalk.blue(arrivalTime.routeShortName),
    `${differenceInMinutes(arrivalTime.predictedArrivalTime, new Date())} minutes`
  );
};

const main = async () => {
  try {
    const stops = await getStopsForLocation(coords);
    const myStops = stops.data.list.filter(isMyStop);
    const results = await getStopArrivalsDepartures(myStops);
    const { arrivalsAndDepartures } = results;
    // console.log(arrivalsAndDepartures)
    if (arrivalsAndDepartures.length) {
      arrivalsAndDepartures.forEach(printArrivalTime);
    } else {
      throw new Error(results.error);
    }
  } catch (err) {
    console.log(chalk.red(err));
  }
};

main();
