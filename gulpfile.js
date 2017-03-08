var gulp = require('gulp');
var concat = require('gulp-concat');


// 合并dcharts.js: gulp dcct
gulp.task('dcct', function() {
  gulp.src([
    './src/start.js', // NOTE: keep this first
    './src/init.js',
    './src/createBarChart.js',
    './src/createPieChart.js',
    './src/createLineChart.js',
    './src/tooltip.js',
    './src/flicker.js',
    './src/end.js' // NOTE: keep this last
  ])
  .pipe(concat('dcharts.js'))
  .pipe(gulp.dest('./lib'));
});

// 监控
gulp.task('watch', function() {
    gulp.watch('./src/*.js', ['dcct']);
});

gulp.task('default', ['dcct', 'watch']);
