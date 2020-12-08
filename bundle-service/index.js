const {prebidJSRoute} = require("./routes/prebid.js");
const express = require('express');
const bodyParser = require('body-parser');
const argv = require('yargs').argv;
/**
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

const app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/prebidcdn.js', prebidJSRoute);
const server = app.listen(argv.port || 3000, function () {
  console.log('Listening on port %s...', server.address().port);
});

