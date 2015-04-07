var gulp = require('gulp'),
    sass = require('gulp-sass');

gulp.task('styles', function() {
  gulp
    .src('src/scss/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/css/'))
});

gulp.task('default', ['styles']);
