'use strict';
var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task("uglify", function() {
  return gulp.src('./src/textassist.js')
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest("./dist"));
});

gulp.task('default', ['uglify']);