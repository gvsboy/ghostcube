'use strict';

// Requires
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserify = require('browserify'),
    babelify = require('babelify'),
    watchify = require('watchify'),
    assign = require('lodash.assign'),

    // Browserify config
    browserifyConfig = {
      debug: true,
      entries: './src/js/app',
      transform: [babelify]
    },
    browserifyOptions = assign({}, watchify.args, browserifyConfig),
    b = watchify(browserify(browserifyOptions));

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify error'))
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/js/'))
    .pipe(livereload());
}

// Boot the livereload server.
livereload.listen();

/**
 * Browserify, Babelify, and uglify scripts using Watchify FTW.
 */
gulp.task('scripts', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

/**
 * Compile all that SASS.
 */
gulp.task('styles', function() {
  gulp
    .src('src/scss/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/css/'))
    .pipe(livereload());
});

/**
 * Copy over the index file. Nothing fancy.
 */
gulp.task('html', function() {
  gulp
    .src('src/html/index.html')
    .pipe(gulp.dest('dist/'));
});

/**
 * Watch for SCSS changes and reload.
 */
gulp.task('watch', function() {
  gulp.watch('src/scss/*.scss', ['styles']);
});

/**
 * Configure the default task to compile all the things.
 */
gulp.task('default', ['styles', 'scripts', 'html', 'watch']);
