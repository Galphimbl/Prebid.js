var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');

module.exports = function() {
  var webpackConfig = require('./webpack.serve');
  return gulp.src(['bundle-service/index.js'])
    // .pipe(helpers.nameModules(externalModules))
    .pipe(webpackStream(webpackConfig, webpack))
    // .pipe(uglify())
    // .pipe(gulpif(file => file.basename === 'prebid-core.js', header(banner, { prebid: prebid })))
    .pipe(gulp.dest('build/serve'));
}
