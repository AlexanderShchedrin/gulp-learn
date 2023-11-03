const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fs = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpackStream = require('webpack-stream')
const webpackConfig = require('./../webpack.config');
const babel = require('gulp-babel');
const imageMin = require('gulp-imagemin');
const changed = require('gulp-changed');

const BUILD = './build/';
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
		.pipe(changed(`${BUILD}`))
		.pipe(plumber(plumberConfig({ title: 'HTML' })))
		.pipe(fileInclude({
			prefix: '@@',
			basepath: '@file',
		}))
		.pipe(gulp.dest(BUILD));
});

gulp.task('sass', () => {
	return gulp.src(SCSS_SRC)
		.pipe(changed(`${BUILD}scss/`))
		.pipe(plumber(plumberConfig({ title: 'SASS' })))
		.pipe(sourceMaps.init())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(sourceMaps.write())
		.pipe(gulp.dest(BUILD));
});

gulp.task('copyImages', () => {
	return gulp.src(IMAGE_SRC)
		.pipe(changed(`${BUILD}images/`))
		.pipe(imageMin({ verbose: true }))
		.pipe(gulp.dest(`${BUILD}images`));
});

gulp.task('copyFonts', () => {
	return gulp.src(FONTS_SRC)
		.pipe(changed(`${BUILD}fonts/`))
		.pipe(gulp.dest(`${BUILD}fonts`));
});

gulp.task('copyFiles', () => {
	return gulp.src(FILES_SR)
		.pipe(changed(`${BUILD}files/`))
		.pipe(gulp.dest(`${BUILD}files`));
});

gulp.task('js', () => {
	return gulp.src('./src/scripts/*.js')
		.pipe(changed(`${BUILD}*.js`))
		.pipe(plumber(plumberConfig({ title: 'JS' })))
		.pipe(babel())
		.pipe(webpackStream(webpackConfig))
		.pipe(gulp.dest(BUILD))
})

gulp.task('server', () => {
	return gulp.src(BUILD)
		.pipe(server({
			livereload: true,
			open: true,
		}));
});

gulp.task('clean', (done) => {
	if (!fs.existsSync(BUILD)) return done();

	return gulp.src(BUILD, { read: false })
		.pipe(clean({ force: true }));
});

gulp.task('watch', () => {
	gulp.watch('./src/**/*.scss', gulp.parallel('sass'));
	gulp.watch('./src/**/*.html', gulp.parallel('html'));
	gulp.watch('./src/images/**/*', gulp.parallel('copyImages'));
	gulp.watch('./src/fonts/**/*', gulp.parallel('copyFonts'));
	gulp.watch('./src/files/**/*', gulp.parallel('copyFiles'));
	gulp.watch('./src/**/*.js', gulp.parallel('js'));
});

gulp.task('run', gulp.series(
	'clean',
	gulp.parallel('html', 'sass', 'copyImages', 'copyFonts', 'copyFiles', 'js'),
	gulp.parallel('server', 'watch')
))

