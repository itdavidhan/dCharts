var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function() {
  // 将你的默认的任务代码放在这
});

gulp.task('test', function() {
  gulp.src(['./test/a.js','./test/b.js'])
  .pipe(concat('main.js'))
  .pipe(gulp.dest('./lib'));
});
