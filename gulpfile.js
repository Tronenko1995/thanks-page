//Название папки в OpenServer
const domain = 'thanks-page.loc';

//Поключаем модули галпа
const gulp = require('gulp');
//const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const cssmin = require('gulp-clean-css');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const jsmin = require('gulp-uglify');
const del = require('del');
const server = require('browser-sync').create();
const rename = require('gulp-rename');
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgsprite = require("gulp-svgstore");
const cheerio = require('gulp-cheerio');
const svgmin = require('gulp-svgmin');
const replace = require('gulp-replace');
const cache = require('gulp-cache');

//Порядок подключения css файлов
const cssFiles = [
  './src/scss/config.scss',
  './src/scss/fonts.scss',
  './src/scss/photo-message.scss',
  './src/scss/items-block.scss',
  './src/scss/order.scss'
]

function styles() {
	return gulp.src(cssFiles)
	// .pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(concat('style.css'))
	.pipe(autoprefixer({
    cascade: false
  }))
  .pipe(cssmin({
  	level: 2
  }))
  // .pipe(sourcemaps.write('./'))
  .pipe(rename({
  	suffix: '.min'
  }))
	.pipe(gulp.dest('./css'))
	.pipe(server.stream());
}


function scripts() {
	return gulp.src('./src/js/**/*.js')
	.pipe(concat('app.js'))
 // .pipe(babel({
 //          presets: ['@babel/env']
 //      }))
        // .pipe(babel({
        //     plugins: ['@babel/transform-runtime']
        // }))
	// .pipe(jsmin({
	// 	toplevel: false
	// }))
  .pipe(rename({
  	suffix: '.min'
  }))
	.pipe(gulp.dest('./js'))
	.pipe(server.stream());
}

function libs() {
	return gulp.src('./src/libs/**/*.**')
	.pipe(gulp.dest('./libs'))
}

function images() {
  // return gulp.src("src/img/**/*.{png,jpg,jpeg}")
  return gulp.src("src/img/**/*.**")
  .pipe(cache(imagemin([
    // imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 85, progressive: true}),
    imagemin.optipng({optimizationLevel: 3}),
  ])))
	.pipe(gulp.dest("./img"));
}

function webpfun() {
	return gulp.src("./src/img/**/*.{png,jpg,jpeg}")
	.pipe(webp())
	.pipe(gulp.dest("./img"));
}

function sprite() {
  return gulp.src("./src/img/sprite/*.svg")
  .pipe(svgmin({
    js2svg: {
      pretty: true
    }
  }))
  .pipe(cheerio({
    run: function ($) {
      $('style').remove();
      $('title').remove();
      $('path').removeAttr('class');
    },
    parserOptions: {xmlMode: true}
  }))
  .pipe(replace('&gt;', '>'))
  .pipe(svgsprite ({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))

  .pipe(gulp.dest("./img/sprite"));
}


function clear() {
	return del(['css/*','js/*'])
}

function clean() {
  return cache.clearAll();
}


function watch() {
  server.init({
        proxy: domain,
        ghostMode: false
  });
  gulp.watch('./src/scss/**/*.scss', styles);
  gulp.watch('./src/js/**/*.js', scripts);
  // gulp.watch("./src/img/**/*.{png,jpg,jpeg}", gulp.series(images, webpfun))
  gulp.watch("./src/img/**/*.{png,jpg,jpeg}", images)
  gulp.watch("./src/img/**/*.svg", sprite)
  gulp.watch('./src/libs/**/*.**', libs);
  gulp.watch("./*.php").on('change', server.reload);
}

gulp.task('clean', clean);
gulp.task('clear', clear);
gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task("images", images);
gulp.task("webp", webpfun);
gulp.task("sprite", sprite);
gulp.task('libs', libs);
gulp.task('watch', watch);

// gulp.task('build', gulp.series(clear, gulp.parallel(styles,scripts), images, webpfun, sprite, libs));
gulp.task('build', gulp.series(clear, gulp.parallel(styles,scripts), images));
gulp.task('dev', gulp.series('build','watch'));