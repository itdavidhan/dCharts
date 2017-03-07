var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function() {
  // 将你的默认的任务代码放在这
});

// 合并dcharts.js: gulp dcct
gulp.task('dcct', function() {
  gulp.src([
    './src/start.js', // NOTE: keep this first
    './src/init.js',
    './src/createBarChart.js',
    './src/createPieChart.js',
    './src/createLineChart.js',
    './src/tooltip.js',
    './src/end.js' // NOTE: keep this last
  ])
  .pipe(concat('dcharts.js'))
  .pipe(gulp.dest('./lib'));
});
