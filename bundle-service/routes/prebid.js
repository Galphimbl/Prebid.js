const {ROOT_FOLDER} = require("../constants");
const nodeBundle = require(`${ROOT_FOLDER}/gulpfile`);
const {biddersMap} = require("../bidders");

function prebidJSRoute(req, res) {
  const {ba: bidAdapters = '', aa: analyticsAdapters = ''} = req.query
  const bidAdaptersList = bidAdapters
    .split(',')
    .filter(a => a.trim() !== '')
    .map((name) => `${biddersMap[name]}BidAdapter`);
  const analyticsAdaptersList = analyticsAdapters
    .split(',')
    .filter(a => a.trim() !== '')
    .map((name) => `${name}AnalyticsAdapter`);
  const modules = bidAdaptersList.concat(analyticsAdaptersList);
  nodeBundle(Array.from(new Set(modules))).then(function (file) {
    res.type('application/javascript');
    res.end(file.toString());
  })
    .catch(function (error) {
      res.writeHead(404);
      res.end(error.message);
    });
}

module.exports = {
  prebidJSRoute,
}
