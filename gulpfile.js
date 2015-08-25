/**
 * Created by awaseem on 15-08-20.
 */

var gulp = require("gulp");
var gutil = require("gulp-util");
var gls = require("gulp-live-server");
var babel = require("gulp-babel");

gulp.task("moveHTML", function () {
    return gulp.src("public/html/index.html")
        .pipe(gulp.dest("build/public/html"));
});

gulp.task("serve", [ "moveHTML" ], function () {
    var server = gls.new("app.js");
    server.start();

    gulp.watch("public/html/index.html", ["moveHTML"]);

    gulp.watch("build/**/*.html", function (file) {
        server.notify.apply(server, [file]);
    })
});