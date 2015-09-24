/**
 * Created by awaseem on 15-08-20.
 */

var gulp = require("gulp");
var gls = require("gulp-live-server");
var babel = require("gulp-babel");

gulp.task("moveStatic", function () {
    return gulp.src(["public/**/*.html", "public/**/*.css", "public/**/*.js"])
        .pipe(gulp.dest("build/public"));
});

gulp.task("babelToJS", function () {
    return gulp.src("./**/*.es6")
        .pipe(babel())
        .pipe(gulp.dest("build"));
});

gulp.task("serve", [ "moveStatic", "babelToJS" ], function () {
    var server = gls.new("build/app.js");
    server.start();

    gulp.watch(["public/**/*.html", "public/**/*.css", "public/**/*.js"], ["moveStatic"]);

    gulp.watch("./**/*.es6", ["babelToJS"]);

    gulp.watch("build/public/*.*", function (file) {
        server.notify.apply(server, [file]);
    });

    gulp.watch("build/**/*.js", function () {
        server.start.apply(server);
    });
});

gulp.task("build", [ "moveStatic", "babelToJS"]);