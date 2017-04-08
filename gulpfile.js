"use strict";

var gulp = require("gulp");
var del = require("del");
var concat = require("gulp-concat");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var replace = require("gulp-replace");
var debug = require("gulp-debug");
var notify = require("gulp-notify");
var uglify = require("gulp-uglify");

var AutoPrefixerOptions = {
	browsers: ["> 10%", "last 3 versions"],
	cascade: false
};

var cssAppSource = "./public/stylesheets/scss/**/*.scss";
var cssDestination = "./public/stylesheets/css";
var jsAppSource = "./public/scripts/pages/*.js";
var jsDestination = "./public/scripts/pages-min/";
var jsLibsDestination = "./public/scripts/lib/";

//build task
gulp.task("build", function () {
	del([
		"./public/stylesheets/css/style.min.css",
		"./public/stylesheets/css/style.css.map",
		jsLibsDestination,
		jsDestination
	]);

	gulp.start("styles-min");
	gulp.start("move-bootstrap-icons");
	gulp.start("js-libs");
	gulp.start("scripts");
	gulp.start("watch");
});

//styles task
gulp.task("styles-min", function () {
	return gulp.src([
		cssAppSource,
		"./bower_components/toastr/toastr.scss"
	]).pipe(sass({
		precision: 4,
		outputStyle: "compressed",
		includePaths: [
			"./bower_components/bootstrap-sass/assets/stylesheets"
		]
	})
			.on("error", notify.onError(function (e) {
				return e;
			})))
			.pipe(autoprefixer(AutoPrefixerOptions))
			.pipe(concat("./style.min.css"))
			.pipe(replace("\n", ""))
			.pipe(gulp.dest(cssDestination));
});

//bootstrap icons task
gulp.task("move-bootstrap-icons", function () {
	return gulp.src([
		"./bower_components/bootstrap-sass/assets/fonts/**/*"
	]).pipe(gulp.dest("public/stylesheets/fonts/"));
});


//js-libs task
gulp.task("js-libs", function () {
	return gulp.src([
		"./bower_components/jquery/dist/jquery.min.js",
		"./bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js",
		"./bower_components/toastr/toastr.min.js",
		"./bower_components/socket.io-client/dist/socket.io.min.js",
		"./bower_components/moment/min/moment.min.js"
	])
			.pipe(concat("lib.js"))
			.pipe(gulp.dest(jsLibsDestination));
});

//scripts task
gulp.task("scripts", function () {
	return gulp.src([
		jsAppSource
	])
			.pipe(uglify({
				mangle: true
			}))
			.pipe(gulp.dest(jsDestination));
});

//watch task
gulp.task("watch", function () {
	gulp.watch(cssAppSource, ["styles-min"]);
	gulp.watch(jsAppSource, ['scripts']);
});