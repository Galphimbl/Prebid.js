const Window = require('window');
const fs = require('fs');
const {BUILD_FOLDER} = require("./constants");

/** simulate and clone window to make work prebid.js like in browser */
const window = new Window();
Object.keys(window)
  .filter((key) => key !== 'window')
  .forEach((key) => Object.defineProperty(global, key, Object.getOwnPropertyDescriptor(window, key)));
Object.defineProperty(global, 'window', {
  get: () => global,
});
require(`${BUILD_FOLDER}/prebid-core.js`);
require(`${BUILD_FOLDER}/__FAKE_BIDDER__.js`);

const bidAdapterRegExp = /BidAdapter\.js$/;

fs.readdirSync(BUILD_FOLDER)
  .filter(
    (fileName) => bidAdapterRegExp.test(fileName)
  )
  // .slice(0, 1)
  .forEach(
    (fileName) => require(`${BUILD_FOLDER}/${fileName}`)
  );
const biddersMap = REGISTERED_BIDDERS.reduce((bMap, bidderSpec) => {
  if (bidderSpec.code) {
    bMap[bidderSpec.code] = bidderSpec.code;
    (bidderSpec.aliases || []).forEach((aliasName) => bMap[aliasName] = bidderSpec.code)
  }
  return bMap;
}, {});

module.exports = {
  biddersMap,
};
