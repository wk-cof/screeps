var gulp = require('gulp');
var ts = require('gulp-typescript');
var https = require('https');
var fs = require('fs');
var secrets = require('./secrets.js');
var del = require('del');

gulp.task('clean', function () {
    return del('dist/**');
});

gulp.task('compile', function () {
	var tsResult = gulp.src(['src/**/*.ts', 'typings/**/*.d.ts'])
		.pipe(ts({
			noImplicitAny: false,
			noExternalResolve: true,
			target: 'ES5',
			module: 'commonjs'
		}));
	return tsResult.js.pipe(gulp.dest('dist'));
});
gulp.task('upload-sim', ['compile'], function () {
	console.log(secrets);
	var email = secrets.email,
		password = secrets.password,
		data = {
			branch: 'dev',
			modules: { main: fs.readFileSync('./dist/main.js', {encoding: "utf8"}) }
		};
	var req = https.request({
		hostname: 'screeps.com',
		port: 443,
		path: '/api/user/code',
		method: 'POST',
		auth: email + ':' + password,
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		}
	}, function(res) {
		console.log(res.headers);
		console.log(res.statusCode + res.statusMessage);
	});
	req.write(JSON.stringify(data));
	req.end();
});
gulp.task('build', ['upload-sim']);
gulp.task('default', ['compile']);