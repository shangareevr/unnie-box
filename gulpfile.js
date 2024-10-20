const { src, dest, parallel, series, watch } = require('gulp');
const browserSync  = require('browser-sync').create();
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify-es').default;
const sass         = require('gulp-dart-sass');
const cleanCss     = require('gulp-clean-css');
const pug          = require('gulp-pug');
const del          = require('del');

function browsersync () {
    browserSync.init({
        server: { baseDir : 'app/' },
        notify: false,
        online: true
    })
}

function scripts () {
    return src([
        'app/src/plugins/**/*.js',
        'app/src/js/app.js',
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .pipe(dest('app/assets/js/'))
    .pipe(browserSync.stream())
}

function styles () {
    return src([
        'app/src/plugins/**/*.css',
        'app/src/scss/main.scss'
    ])
    .pipe(sass())
    .pipe(concat('styles.min.css'))
    .pipe(cleanCss(( { level: { 1: { specialComment: 0 } }, /*format: 'beautify'*/ } )))
    .pipe(dest('app/assets/css/'))
    .pipe(browserSync.stream())
}

function html () {
    return src('app/src/pug/*.pug')
        .pipe(
            pug({
                pretty: '\t'
            })
        )
        .pipe(dest('app/'));
}

function startWhatch() {
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
    watch(['app/**/*.scss', '!app/**/*.css'], styles)
    watch('app/**/*.html').on('change', browserSync.reload)
    watch('app/**/*.pug', html);
}

function cleanDist() {
	return del('dist/**/*', { force: true })
}

function buildcopy() {
    return src([ // Выбираем нужные файлы
        'app/assets/css/**/*.min.css',
        'app/assets/js/**/*.min.js',
        'app/assets/images/**/*',
        'app/assets/fonts/**/*',
        'app/**/*.html',
    ], { base: 'app' }) // Параметр "base" сохраняет структуру проекта при копировании
        .pipe(dest('dist')) // Выгружаем в папку с финальной сборкой
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.html = html;
exports.cleanDist = cleanDist;
exports.default = parallel(html, styles, scripts, browsersync, startWhatch)
exports.build = series(cleanDist, styles, scripts, buildcopy);