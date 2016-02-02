var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var ts = require('gulp-typescript');
var del = require('del');

var https = require('https');
var fs = require('fs');
var secrets = require('./secrets.js');

gulp.task('clean', function () {
    return del('dist/**');
});

gulp.task('compile', ['clean'], function () {
	return 	gulp.src(['src/**/*.ts', 'typings/**/*.d.ts'])
		//.pipe(plugins.print())
		.pipe(plugins.typescript({
			noImplicitAny: false,
			noExternalResolve: true,
			target: 'ES5',
			module: 'commonjs'
		}))
		.pipe(gulp.dest('dist'));

});
gulp.task('upload-sim', ['compile'], function () {
	var email = secrets.email,
		password = secrets.password,
		data = {
			branch: 'dev',
			modules: {
				main: fs.readFileSync('./dist/main.js', {encoding: "utf8"}),
				harvester: fs.readFileSync('./dist/harvester.js', {encoding: "utf8"}),
				builder: fs.readFileSync('./dist/builder.js', {encoding: "utf8"}),
				'creep-assembler': fs.readFileSync('./dist/creep-assembler.js', {encoding: "utf8"}),
				config: fs.readFileSync('./dist/config.js', {encoding: "utf8"}),
				creep: fs.readFileSync('./dist/creep.js', {encoding: "utf8"}),
				carrier: fs.readFileSync('./dist/carrier.js', {encoding: "utf8"}),
				tower: fs.readFileSync('./dist/tower.js', {encoding: "utf8"})
			}
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
		console.log('Server Response:');
		console.log(res.headers);
		console.log(res.statusCode, res.statusMessage);
	});
	req.write(JSON.stringify(data));
	req.end();
});
gulp.task('build', ['upload-sim']);
gulp.task('default', ['compile']);