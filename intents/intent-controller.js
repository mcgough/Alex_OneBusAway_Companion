const { getarrivals, getnext } = require('./intents');
const db = require('../models');

const myInfo = [
  {
    stop_id: '3541',
    device_id: 'amzn1.ask.account.AFM3ZO6VDQJILQZ5T7OJYRNUMZQCEUCKCWEPGZI2FSNGXMIYTH5CPGE6QMW7FVCYSLLETD7A7V5AIQJKUBU2XRHE4IUMLOVL7GLJ6QJNYTILYFC6HQ6OFMPAUDKJJKN2MD6BDM6ILO7K43NLVKQF2JINFDZN2WRRYIHO4XPLRAFBKR4MX7LNUVAJC5TCK5DIYRLX4NKOY6ELDWA',
  }
];

exports.intentController = async (intent, req, res) => {
  const { userId } = req.body.session.user;
  const user = await db.User.find({ device_id: userId });
  if (user) {
    const stop_id = user[0].stop_id; 
    switch (intent.name) {
      case 'getarrivals':
        return res.json(await getarrivals(`1_${stop_id}`, req.body));
      case 'getnext':
        return res.json(getnext(req.body));
      default:
        return res.json({});
    }
  } else {
    return res.json(getstop(req.body));
  }

}