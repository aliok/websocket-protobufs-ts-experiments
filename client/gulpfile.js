var gulp = require('gulp');
var changed = require('gulp-changed');
var del = require('del');
var exec = require('gulp-exec');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');
var ts = require('gulp-typescript');

var paths = {
    static: ['./src/**/*.html'],
    ts: ['./src/**/*.ts', './typings/**/*.d.ts', './proto-typings/**/*.d.ts'],
    defs: '../definitions/**/*.proto'
};

gulp.task('default', ['build']);

gulp.task('run', ['build', 'watch', 'browser-sync'], function () {
    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch(['target/**/*.*'], browserSync.reload);
});

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: "./target",
            index: "index.html"
        },
        ghostMode: false,
        injectChanges: true,
        open: false
    });
});

// this task is meant to run in a full build
gulp.task('static-copy-all', function () {
    gulp
        .src(paths.static, {base: './src'})
        .pipe(gulp.dest('target'));
});

// this task is meant to run in a full build
gulp.task('defs-copy-all', function () {
    gulp
        .src(paths.defs, {base: '../definitions'})
        .pipe(gulp.dest('target'));
});

// this task is meant to run during coding
gulp.task('static-copy-changed', function () {
    gulp
        .src(paths.static, {base: './src'})
        .pipe(changed('target'))
        .pipe(gulp.dest('target'));
});

// this task is meant to run during coding
gulp.task('defs-copy-changed', function () {
    gulp
        .src(paths.defs, {base: '../definitions'})
        .pipe(changed('target'))
        .pipe(gulp.dest('target'));
});

// this task is meant to run in a full build and during coding
// as TS operation is a compilation operation, we need to include all resources; not only the ones that changed.
gulp.task('ts', function () {
    var tsResult = gulp.src(paths.ts)
        .pipe(ts({
            out: 'application.js',
            declarationFiles: false,
            noExternalResolve: true
        }));

    // we don't generate dts for our files
    // following requires this : var merge = require('merge2');
    //return merge([tsResult.dts.pipe(gulp.dest('typings')), tsResult.js.pipe(gulp.dest('www'))]);

    return tsResult.js.pipe(gulp.dest('target'));
});

// generate JSON files for proto files. output is written into temporary '.temp-proto-json' folder.
gulp.task('generate-json-for-protos', function () {
    del("./.temp-proto-json");

    var options = {
        continueOnError: false, // default = false, true means don't emit error event
        pipeStdout: true // default = false, true means stdout is written to file.contents
    };
    var reportOptions = {
        err: true, // default = true, false means don't write err
        stderr: true, // default = true, false means don't write stderr
        stdout: false // default = true, false means don't write stdout
    };

    return gulp
        .src(paths.defs, {base: '../definitions'})

        .pipe(exec('pbjs <%= file.path %> --source proto --target json', options))
        .pipe(exec.reporter(reportOptions))
        .pipe(rename(function (path) {
            path.extname += ".json"
        }))
        .pipe(gulp.dest('./.temp-proto-json'));
});

// generate Typescript definitions for Protocol Buffers messages
// generate d.ts files for proto JSON files from temporary '.temp-proto-json' folder. output is written to 'proto-typings' folder
gulp.task('generate-tsd-for-protos', ['generate-json-for-protos'], function () {
    del("proto-typings");

    var options = {
        continueOnError: false, // default = false, true means don't emit error event
        pipeStdout: true // default = false, true means stdout is written to file.contents
    };
    var reportOptions = {
        err: true, // default = true, false means don't write err
        stderr: true, // default = true, false means don't write stderr
        stdout: false // default = true, false means don't write stdout
    };

    return gulp
        .src("./.temp-proto-json/**/*.proto.json", {base: './.temp-proto-json'})
        .pipe(exec('proto2typescript --file <%= file.path %> --camelCaseGetSet --properties', options))
        .pipe(exec.reporter(reportOptions))
        .pipe(rename({extname: ".d.ts"}))
        .pipe(gulp.dest('proto-typings'));
});

gulp.task('watch', function () {
    gulp.watch(paths.src, ['static-copy-changed']);
    gulp.watch(paths.ts, ['ts']);
    gulp.watch(paths.defs, ['defs-copy-changed', 'generate-tsd-for-protos']);
});

gulp.task('build', [
    'static-copy-all',
    'defs-copy-all',
    'generate-tsd-for-protos',
    'ts'
]);