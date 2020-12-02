var gulp = require('gulp');
const gulpClean = require('gulp-clean');
const gulpCopy = require('gulp-copy');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
function build() {
  var webpackConfig = require('./webpack.serve');
  return gulp.src(['bundle-service/index.js'])
    // .pipe(helpers.nameModules(externalModules))
    .pipe(webpackStream(webpackConfig, webpack))
    // .pipe(uglify())
    // .pipe(gulpif(file => file.basename === 'prebid-core.js', header(banner, { prebid: prebid })))
    .pipe(gulp.dest('build-with-serve'));
}
function copyCore() {
  return gulp
    .src(['build/dist/*'])
    .pipe(gulpCopy('build-with-serve/', {}));
}
function copyModules() {
  return gulp
    .src(['modules/*'])
    .pipe(gulpCopy('build-with-serve/', {}))
}
function clean() {
  return gulp.src(['build-with-serve'], {
    read: false,
    allowEmpty: true
  })
    .pipe(gulpClean());
}
module.exports = {
  build,
  clean,
  copyCore,
  copyModules,
}
