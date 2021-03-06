'use strict';

var gulp = require('gulp');
var net = require('net');
var del = require('del');
var sass = require('gulp-sass');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var runSequence = require('run-sequence');
var assign = require('object-assign');

gulp.task('default', ['watch', 'server']);

gulp.task('clean', function () {
  return del(['./build/*']);
});

gulp.task('copy', function () {
  gulp.src('./docs/index.html')
    .pipe(gulp.dest('./build'));
  gulp.src('./docs/img/**/*')
      .pipe(gulp.dest('./build/img'));
  gulp.src('./node_modules/slick-carousel/slick/fonts/*')
      .pipe(gulp.dest('./build/fonts'));
  return gulp.src('./node_modules/slick-carousel/slick/ajax-loader.gif')
      .pipe(gulp.dest('./build'));
});

gulp.task('sass', function () {
  return gulp.src(['./docs/**/*.{scss,sass}'])
              .pipe(sass({ includePaths: ['bower_components', 'node_modules'], errLogToConsole: true}))
              .pipe(gulp.dest('./build'));
});

gulp.task('watch', ['copy', 'sass'], function () {
  gulp.watch(['./docs/**/*.{scss,sass}'], ['sass']);
  gulp.watch(['./docs/index.html'], ['copy']);
});

function findPort(port, cb){
  var s;
  s = net.createServer().listen(port, "0.0.0.0");
  s.on('listening', function() {
    s.close();
    return cb(port);
  });
  return s.on('error', function(err) {
    return findPort(port + 1, cb);
  })
}

var devConfig = require('./webpack.config');
devConfig.plugins = devConfig.plugins.concat(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('dev_docs')
    }
  })
);
gulp.task('server', ['copy', 'sass'], function (callback) {
  findPort(8080, function(port){
    return new WebpackDevServer(webpack(devConfig), {
      contentBase: './build',
      hot: true,
      debug: true
    }).listen(port, '0.0.0.0', function (err, result) {
      if (err) {
        console.log(err);
      }else{
        console.log('Dev server listening on port ' + port);
      }
    })
    callback();
  })
});


// gulp tasks for building dist files
gulp.task('dist-clean', function () {
  return del(['./dist/*']);
});

var distConfig = require('./webpack.config.dist.js');
gulp.task('dist-unmin', function (cb) {
  var unminConfig = assign({}, distConfig);
  unminConfig.output.filename = 'react-slick.js';
  return webpack(unminConfig, function (err, stat) {
    console.error(err);
    cb();
  });
});


gulp.task('dist-min', function (cb) {
  var minConfig = assign({}, distConfig);
  minConfig.output.filename = 'react-slick.min.js';
  minConfig.plugins = minConfig.plugins.concat(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  );
  return webpack(minConfig, function (err, stat) {
    console.error(err);
    cb();
  });
});

gulp.task('dist', function (cb) {
  runSequence('dist-clean', 'dist-unmin', 'dist-min', cb);
});
