var gulp = require('gulp');
var changed = require('gulp-changed');

var browserSync = require('browser-sync');

var paths = {
    src: './src/**/*.*',
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
gulp.task('src-copy-all', function () {
    gulp
        .src(paths.src, {base: './src'})
        .pipe(gulp.dest('target'));
});

// this task is meant to run in a full build
gulp.task('defs-copy-all', function () {
    gulp
        .src(paths.defs, {base: '../definitions'})
        .pipe(gulp.dest('target'));
});

// this task is meant to run during coding
gulp.task('src-copy-changed', function () {
    gulp
        .src(paths.src, {base: './src'})
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

gulp.task('watch', function () {
    gulp.watch(paths.src, ['src-copy-changed']);
    gulp.watch(paths.defs, ['defs-copy-changed']);
});

gulp.task('build', [
    'src-copy-all',
    'defs-copy-all'
]);
