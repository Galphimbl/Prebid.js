const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require("url");
const {prebidJSRoute} = require("./routes/prebid");
const express = require('express');
const bodyParser = require('body-parser');
const {loaderJSRoute} = require("./routes/loader");
/**
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

const app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/prebid.js', prebidJSRoute);
app.use('/loader.js', loaderJSRoute);
const server = app.listen(3000, function () {
  console.log('Listening on port %s...', server.address().port);
});

// function serverHandler(req, res) {
//   const parsedUrl = url.parse(req.url, true);
//   console.log(parsedUrl.pathname);x
//   const query = parsedUrl.query;
//   const bidAdapters = (query.ba || '')
//     .split(',')
//     .filter(a => a.trim() !== '')
//     .map((name) => `${biddersMap[name]}BidAdapter`);
//   const analyticsAdapters = (query.aa || '').split(',').filter(a => a.trim() !== '').map((name) => `${name}AnalyticsAdapter`);
//   const modules = bidAdapters.concat(analyticsAdapters);
//   nodeBundle(Array.from(new Set(modules))).then(function (file) {
//     res.writeHead(200, {
//       'Content-Type': 'application/javascript'
//     });
//     res.end(file.toString());
//   })
//     .catch(function (error) {
//       res.writeHead(404);
//       res.end(error.message);
//     });
// }
//
// let server = new http.Server(serverHandler);
// server.listen(8000, '127.0.0.1');
