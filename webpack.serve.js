const webpack = require('webpack');
const Window = require('window');
const fs = require('fs');
const path = require('path');
// var VirtualModulesPlugin = require("webpack-virtual-modules");
// const VIRTUAL_MODULES = {
//   'build-serve.js': 'module.exports = {"_buildServe": function(){}};',
//   'node_modules/webpack-stream/index.js': 'module.exports = function(){};',
//   'node_modules/uglify': 'module.exports = function(){};',
//   'node_modules/karma/lib/index.js': 'module.exports = {Server: function(){}}',
// };
// if (!fs.existsSync(path.resolve('node_modules/emitter'))) {
//   VIRTUAL_MODULES['node_modules/emitter'] = 'module.exports = function(){};';
// }
// var virtualModules = new VirtualModulesPlugin(VIRTUAL_MODULES);
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
const ALIAS_EMPTY = path.resolve(__dirname, 'build-serve.empty.js');
module.exports = {
  // entry: {
  //   asd: ['./webpack.serve']
  // },
  output: {
    filename: "serve.js"
  },
  resolve: {
    alias: {
      "./build-serve": ALIAS_EMPTY,
      "gulp-connect": ALIAS_EMPTY,
      "karma": ALIAS_EMPTY,
      "webpack-bundle-analyzer": ALIAS_EMPTY,
      "webpack": ALIAS_EMPTY,
      "webpack-stream": ALIAS_EMPTY,
      "./webpack.conf": ALIAS_EMPTY,
      "gulp-uglify": ALIAS_EMPTY,
      "gulp-replace": ALIAS_EMPTY,
      "gulp-eslint": ALIAS_EMPTY,
    },
  },
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
    // virtualModules,
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
