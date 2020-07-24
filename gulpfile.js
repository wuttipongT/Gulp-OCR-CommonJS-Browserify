const { task, series, src, dest, watch } = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var transform = require('vinyl-transform');
var webpack = require('webpack-stream');
var source = require('vinyl-source-stream');
var sass = require('gulp-ruby-sass');
var uglify = require('gulp-uglify');

//https://wecodetheweb.com/2015/05/22/using-react-with-es6-and-browserify/
//https://stackoverflow.com/questions/48917992/gulp-task-not-recognizing-sass-gem-undefined-not-installed

task('bundle', function () {
  return browserify({
    entries: 'js/main.js',
  })
  .transform(babelify.configure({
    ignore: /(bower_components)|(node_modules)/
  }))
  .transform('uglifyify')
  .bundle()
  .on("error", function (err) { console.log("Error : " + err.message); })
  .pipe(source('bundle.js'))
  .pipe(dest('./js'));
});

task('css', function(){
  return sass('sass/app.sass')
        .pipe(dest('./css'));
});

task('default', series('bundle', 'css', function(done) {
  watch('js/main.js', series('bundle'));
  console.log("Default task that cleans, builds and runs the application [END]");
  done();
}));
