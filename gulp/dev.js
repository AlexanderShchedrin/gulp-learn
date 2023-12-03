const gulp = require('gulp');
const iconfont = require('gulp-iconfont');
const runTimestamp = Math.round(Date.now()/1000);
const fileInclude = require('gulp-file-include');
const iconfontCss = require('gulp-iconfont-css');

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
const HTML_SRC = './src/pages/*.html';
const SCSS_SRC = './src/scss/*.scss';
const IMAGE_SRC = './src/images/**/*';
const FONTS_SRC = './src/fonts/**/*';
const FILES_SRC = './src/files/**/*';
const ICONS_SRC = './src/fi/svg/*.svg';

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
	return gulp.src(FILES_SRC)
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

gulp.task('Iconfont', () => {
	return gulp.src(ICONS_SRC)
		.pipe(iconfontCss({
			path: './src/fi/templates/icon-template.scss',
			fontName: 'fi',
			targetPath: './../variables.scss',
			fontPath: './src/fi/font'
		}))
		.pipe(iconfont({
			fontName: 'fi', // required
			prependUnicode: false, // recommended option
			formats: ['woff2'], // default, 'woff2' and 'svg' are available
			timestamp: runTimestamp, // recommended to get consistent builds when watching files
		}))
		.pipe(gulp.dest('./src/fi/font/'));
});

gulp.task('watch', () => {
	gulp.watch('./src/**/*.scss', gulp.parallel('sass'));
	gulp.watch('./src/**/*.html', gulp.parallel('html'));
	gulp.watch('./src/images/**/*', gulp.parallel('copyImages'));
	gulp.watch('./src/fonts/**/*', gulp.parallel('copyFonts'));
	gulp.watch('./src/files/**/*', gulp.parallel('copyFiles'));
	gulp.watch('./src/**/*.js', gulp.parallel('js'));
	gulp.watch(ICONS_SRC, gulp.parallel('Iconfont'));
});

gulp.task('run', gulp.series(
	'clean',
	gulp.parallel('html', 'sass', 'copyImages', 'copyFonts', 'copyFiles', 'js'),
	gulp.parallel('server', 'watch')
))

