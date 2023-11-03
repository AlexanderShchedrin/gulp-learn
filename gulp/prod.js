const gulp = require('gulp');

// HTML
const fileInclude = require('gulp-file-include');
const htmlClean = require('gulp-htmlclean');

// SCSS
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso')
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries')

// IMAGES
const imageMin = require('gulp-imagemin');
const webp = require('gulp-webp');

const clean = require('gulp-clean');
const fs = require('fs');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpackStream = require('webpack-stream')
const webpackConfig = require('./../webpack.config');
const babel = require('gulp-babel');

const changed = require('gulp-changed');

const DIST = './dist/';
const HTML_SRC = './src/pages/*.html'
const SCSS_SRC = './src/scss/*.scss'
const IMAGE_SRC = './src/images/**/*'
const FONTS_SRC = './src/fonts/**/*'
const FILES_SR = './src/files/**/*'

const plumberConfig = ({ title }) => ({
	errorHandler: notify.onError({
		title,
		message: 'Error <%= error.message %>',
		sound: false,
	})
})

gulp.task('html', () => {
	return gulp.src(HTML_SRC)
		.pipe(changed(`${DIST}`))
		.pipe(plumber(plumberConfig({ title: 'HTML' })))
		.pipe(fileInclude({
			prefix: '@@',
			basepath: '@file',
		}))
		.pipe(htmlClean())
		.pipe(gulp.dest(DIST));
});

gulp.task('sass', () => {
	return gulp.src(SCSS_SRC)
		.pipe(changed(`${DIST}scss/`))
		.pipe(plumber(plumberConfig({ title: 'SASS' })))
		.pipe(sourceMaps.init())
		.pipe(autoprefixer())
		.pipe(sassGlob())
		.pipe(groupMedia())
		.pipe(sass())
		.pipe(csso())
		.pipe(sourceMaps.write())
		.pipe(gulp.dest(DIST));
});

gulp.task('copyImages', () => {
	return gulp.src(IMAGE_SRC)
		.pipe(changed(`${DIST}images/`))
		.pipe(webp())
		.pipe(gulp.dest(`${DIST}images/`))

		.pipe(gulp.src(IMAGE_SRC))
		.pipe(changed(`${DIST}images/`))
		.pipe(imageMin({ verbose: true }))
		.pipe(gulp.dest(`${DIST}images`));
});

gulp.task('copyFonts', () => {
	return gulp.src(FONTS_SRC)
		.pipe(changed(`${DIST}fonts/`))
		.pipe(gulp.dest(`${DIST}fonts`));
});

gulp.task('copyFiles', () => {
	return gulp.src(FILES_SR)
		.pipe(changed(`${DIST}files/`))
		.pipe(gulp.dest(`${DIST}files`));
});

gulp.task('js', () => {
	return gulp.src('./src/scripts/*.js')
		.pipe(changed(`${DIST}*.js`))
		.pipe(plumber(plumberConfig({ title: 'JS' })))
		.pipe(babel())
		.pipe(webpackStream(webpackConfig))
		.pipe(gulp.dest(DIST))
})


gulp.task('clean', (done) => {
	if (!fs.existsSync(DIST)) return done();

	return gulp.src(DIST, { read: false })
		.pipe(clean({ force: true }));
});

gulp.task('run', gulp.series(
	'clean',
	gulp.parallel('html', 'sass', 'copyImages', 'copyFonts', 'copyFiles', 'js'),
))

