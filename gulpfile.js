var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var ts = require('gulp-typescript');
var del = require('del');

var secrets = require('./secrets.js');

gulp.task('clean', function () {
    return del('dist/**');
});

gulp.task('compile', ['clean'], function () {
    return gulp.src(['src/**/*.ts', 'typings/**/*.d.ts'])
        //.pipe(plugins.print())
        .pipe(plugins.typescript({
            noImplicitAny: false,
            noExternalResolve: true,
            target: 'ES5',
            module: 'commonjs'
        }))
        .pipe(plugins.replace(/require\("\.\/(.+)"\);/g,'require("$1");'))
        .pipe(gulp.dest('dist'));

});

gulp.task('upload', ['compile'], function () {
    gulp.src('dist/*.js')
        .pipe(plugins.screeps(secrets));
});

gulp.task('ptr', ['compile'], function () {
    secrets.ptr = true;
    gulp.src('dist/*.js')
        .pipe(plugins.screeps(secrets));
});

gulp.task('default', ['compile']);