const gulp = require('gulp'),
      babel = require('gulp-babel'),
      rename = require("gulp-rename"),
      jsmin = require('gulp-jsmin');

// Rerun the task
gulp.task('js-transformers', () => {
    return gulp.src([
        './*.js',
        '!*.min.js',
        '!*gulpfile.js',
        '!jquery.mCustomScrollbar.js',
        '!jquery.mousewheel-3.0.6.js',
        '!loader.js',
        '!arrayLogo.js'
    ])
    .pipe(jsmin())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulp.dest('./'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch('./*.js', ['js-transformers']);
});