'use strict';

// Requires
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    assign = require('lodash.assign'),

    libraries = [
      'lodash',
      'hammerjs',
      'events',
      'babel/polyfill'
    ];

gulp.task('dev-libs', function() {

  var b = browserify({debug: false});

  libraries.forEach(function(lib) {
    b.require(lib);
  });

  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify error'))
    .pipe(source('libs.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/dev/'));
});

gulp.task('dev', function() {

  // Browserify config
  var browserifyConfig = {
        debug: true,
        entries: './src/js/app',
        transform: [babelify]
      },
      browserifyOptions = assign({}, watchify.args, browserifyConfig),
      b = watchify(browserify(browserifyOptions));

  libraries.forEach(function(lib) {
    b.external(lib);
  });
  b.on('update', compileJS);
  b.on('log', gutil.log);

  function compileJS() {
    return b.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify error'))
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(gulp.dest('dist/dev/'))
      .pipe(livereload());
  }

  /**
   * Compile all that SASS.
   */
  function compileSASS() {
    gulp
      .src('src/scss/main.scss')
      .pipe(sass())
      .pipe(gulp.dest('dist/dev/'))
      .pipe(livereload());
  }

  // Copy over the index file. Nothing fancy.
  gulp
    .src('src/html/index.dev.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest('dist/dev/'));

  //Watch for SCSS changes and reload.
  gulp.watch('src/scss/*.scss', compileSASS);

  // Boot the livereload server.
  livereload.listen();

  // Execute an initial compile.
  compileJS();
  compileSASS();
});

/**
 * Configure the default task to compile all the things for dev.
 */
gulp.task('default', ['dev-libs', 'dev']);
