const db = require("../models");

const { getArrivals, getNext, notUser, setUserStop } = require("./intents");

exports.intentController = async (intent, req, res) => {
  const { userId } = req.body.session.user;
  const [user] = await db.User.find({ device_id: userId });
  if (user) {
    const { stop_id, _id } = user;
    switch (intent) {
      case "getarrivals":
        return res.json(await getArrivals(`1_${stop_id}`, req.body));
      case "getnext":
        return res.json(getNext(req.body));
      case "setUserStop":
        return res.json(await setUserStop(req.body, userId, _id));
      default:
        return res.json({});
    }
  } else {
    return res.json(
      intent !== "setUserStop"
        ? notUser(req.body)
        : setUserStop(req.body, userId)
    );
  }
};
