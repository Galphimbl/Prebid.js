const webpack = require('webpack');
const Window = require('window');
const fs = require('fs');
const path = require('path');

const BUILD_FOLDER = "./build/dist";

/** simulate and clone window to make work prebid.js like in browser */
const window = new Window();
Object.keys(window)
  .filter((key) => key !== 'window')
  .forEach((key) => {
    if (!(key in global)) {
      Object.defineProperty(global, key, Object.getOwnPropertyDescriptor(window, key))
    }
  });
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
  // entry: {
  //   asd: ['./webpack.serve']
  // },
  // output: {
  //   filename: "asd.js"
  // },
  cache: false,
  target: 'node',
  // externals: [
  //   function(context, request, callback) {
  //     if (/^window$/.test(request)){
  //       console.log(request, context);
  //     }
  //     callback();
  //   }
  // ],
  bail: true,
  profile: true,
  module: {
    // rules: [
    //   {
    //     test: /\.js$/,
    //     exclude: path.resolve('./node_modules'), // required to prevent loader from choking non-Prebid.js node_modules
    //     use: [
    //       {
    //         loader: 'babel-loader',
    //         // options: helpers.getAnalyticsOptions(),
    //       }
    //     ]
    //   }
    // ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "__BIDDERS_MAP__": JSON.stringify(biddersMap),
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'prebid',
    //   // filename: 'prebid-core.js',
    //   // minChunks: function(module) {
    //   //   return (
    //   //     (
    //   //       module.context && module.context.startsWith(path.resolve('./src')) &&
    //   //       !(module.resource && neverBundle.some(name => module.resource.includes(name)))
    //   //     ) ||
    //   //     module.resource && (allowedModules.src.concat(['core-js'])).some(
    //   //       name => module.resource.includes(path.resolve('./node_modules/' + name))
    //   //     )
    //   //   );
    //   // }
    // })
  ]
};
