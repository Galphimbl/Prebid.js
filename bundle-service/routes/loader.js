const {SERVICE_FOLDER} = require("../constants");
const path = require('path');
const fs = require('fs');
const loader = fs.readFileSync(path.resolve(SERVICE_FOLDER, 'loader.js'));
function loaderJSRoute(req, res) {
  res.type('application/javascript');
  res.end(loader.toString());
}
module.exports = {
  loaderJSRoute,
};
