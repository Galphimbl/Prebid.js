const {prebidJSRoute} = require("./routes/prebid.js");
const express = require('express');
const bodyParser = require('body-parser');
/**
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

const app = express();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/prebid.js', prebidJSRoute);
const server = app.listen(3000, function () {
  console.log('Listening on port %s...', server.address().port);
});

