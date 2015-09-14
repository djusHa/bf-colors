var gulp = require('gulp');
var run = require('gulp-run');
var browserSync = require('browser-sync');

gulp.task('watch', function() {
  gulp.watch('./**/*.html', browserSync.reload);
  gulp.watch('./index.js', ['runprg']);
})

gulp.task('runprg', function() {
  run('node index.js').exec();
})

gulp.task('serve', function() {
  browserSync.init({
    open: false,
    server: {
      baseDir: './',
      index: 'bf-colors.html'
    }
  });
});

gulp.task('default', ['watch', 'serve']);