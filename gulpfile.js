'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const debug = require('gulp-debug');
const eslint = require('gulp-eslint');

const SRC_FILES = {
  JS: ['./*.js']
};

gulp.task('jslint', function() {
  const completionTracker = function(results) {
    results = results || [];

    const result = results.reduce(function(all, current) {
      all.errors += current.errorCount;
      all.warnings += current.warningCount;
      return all;
    }, { errors: 0, warnings: 0 });

    if (result.errors > 0) {
      gutil.log(gutil.colors.red('>>> Javascript linting: ' + gutil.colors.underline('FAILED') + '.'));
    } else if (result.warnings > 0) {
      gutil.log(gutil.colors.yellow('>>> Javascript linting ' + gutil.colors.underline('COMPLETED with warnings') + '.'));
    } else {
      gutil.log(gutil.colors.green('>>> Javascript linting ' + gutil.colors.underline('COMPLETED') + '.'));
    }
  };

  return gulp.src(SRC_FILES.JS)
    .pipe(debug({title: 'Linting'}))
    .pipe(eslint({ useEslintrc: true }))
    .pipe(eslint.format('codeframe'))
    .pipe(eslint.format())
    .pipe(eslint.format(completionTracker));
});

gulp.task('watch', function() {
  gulp.watch([SRC_FILES.JS], ['jslint']);
});

gulp.task('default', ['jslint', 'watch']);