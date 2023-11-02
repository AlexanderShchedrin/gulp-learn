const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
// const groupMedia = require('gulp-group-css-media-queries')
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

const DIST = './dist/';
const HTML_SRC = './src/pages/*.html'
const SCSS_SRC = './src/**/*.scss'
const IMAGE_SRC = './src/images/**/*'

const plumberSassConfig = {
	errorHandler: notify.onError({
		title: 'Styles',
		message: 'Error <%= error.message %>',
		sound: false,
	})
}

gulp.task('html', () => {
	return gulp.src(HTML_SRC)
		.pipe(fileInclude({
			prefix: '@@',
			basepath: '@file',
		}))
		.pipe(gulp.dest(DIST));
});

gulp.task('sass', () => {
	return gulp.src(SCSS_SRC)
		.pipe(plumber(plumberSassConfig))
		.pipe(sourceMaps.init())
		.pipe(sass())
		// .pipe(groupMedia())
		.pipe(sourceMaps.write())
		.pipe(gulp.dest(DIST));
});

gulp.task('copyImages', () => {
	return gulp.src(IMAGE_SRC)
		.pipe(gulp.dest(`${DIST}/images`));
});

gulp.task('server', () => {
	return gulp.src(DIST)
		.pipe(server({
			livereload: true,
			open: true,
		}));
});

gulp.task('clean', (done) => {
	if (!fs.existsSync(DIST)) return done();

	return gulp.src(DIST, { read: false })
		.pipe(clean({ force: true }));
});

gulp.task('watch', () => {
	gulp.watch('./src/**/*.scss', gulp.parallel('sass'));
	gulp.watch('./src/**/*.html', gulp.parallel('html'));
	gulp.watch('./src/images/**/*', gulp.parallel('copyImages'));
});

gulp.task('dev:watch', gulp.series(
	'clean',
	gulp.parallel('html', 'sass', 'copyImages'),
	gulp.parallel('server', 'watch')
))
