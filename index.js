const lib = require('./lib');
const getStopsForLocation = lib.getStopsForLocation;
const isMyStop = lib.isMyStop;
const Stop = lib.Stop;

const coords = {
  lat: "47.588656",
  lon: "-122.318176"
};

const main = async () => {
  try {
    const stops = await getStopsForLocation(coords);
    const myStop = new Stop(stops.data.list.filter(isMyStop)[0]);
    myStop.printArrivalTimes();
  } catch (err) {
    console.log(chalk.red(err));
  }
};

main();
