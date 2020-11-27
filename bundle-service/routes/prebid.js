const nodeBundle = require(`../../gulpfile.js`);
const biddersMap = __BIDDERS_MAP__;

function prebidJSRoute(req, res) {
  const {ba: bidAdapters = '', aa: analyticsAdapters = '', pm: prebidModules = ''} = req.query
  const bidAdaptersList = bidAdapters
    .split(',')
    .filter(a => a.trim() !== '')
    .map((name) => `${biddersMap[name]}BidAdapter`);
  const analyticsAdaptersList = analyticsAdapters
    .split(',')
    .filter(a => a.trim() !== '')
    .map((name) => `${name}AnalyticsAdapter`);
  const prebidModulesList = prebidModules
    .split(',')
    .filter(a => a.trim() !== '')
  const allModules = bidAdaptersList.concat(analyticsAdaptersList).concat(prebidModulesList);
  nodeBundle(Array.from(new Set(allModules))).then(function (file) {
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
