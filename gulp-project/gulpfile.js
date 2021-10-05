// создание переменных
const { src, dest, parallel, series, watch } = require("gulp");
// подключение Browser Sync
const browserSync = require("browser-sync").create();
// подключение concat
const concat = require("gulp-concat");
// подключение uglify-es
const uglify = require("gulp-uglify-es").default;
// подключение gulp-scss
const sass = require("gulp-sass");
// подключение gulp-autoprefixer
const autoprefixer = require("gulp-autoprefixer");
// подключение clean-css
const cleancss = require("gulp-clean-css");
// подключение gulp-imagemin
const imagemin = require("gulp-imagemin");
// подключение gulp-newer
const newer = require("gulp-newer");
// подключение del - пакет NODE.JS
const del = require("del");

// Browser Sync
function browsersync() {
    browserSync.init({
        server: { baseDir: "app/" },
        // отключаем уведомления
        notify: false,
        // отключение зависимости от wi-fi.
        // Можем работать off-lene (true, false)
        online: true,
    });
}

// функция обрабатывающая наши скрипты
function scripts() {
    return src([
            "node_modules/jquery/dist/jquery.min.js",
            "app/js/app.js", //укажем путь к исходнику
        ])
        .pipe(concat("app.min.js")) //объединим
        .pipe(uglify()) //между конкатинацией и выгрузкой. Перед выгрузкой
        .pipe(dest("app/js/")) //выгрузим в один файл
        .pipe(browserSync.stream()); //мониторить за скриптами
}

//Подключаем функцию SASS
function styles() {
    return src("app/sass/main.sass")
        .pipe(sass())
        .pipe(concat("app.min.css"))
        .pipe(
            autoprefixer({ overrideBrowserslist: ["last 10 version"], grid: true })
        )
        .pipe(
            cleancss({ Level: { 1: { specialComments: 0 } } /*format: 'beautify'*/ })
        )
        .pipe(dest("app/css/"))
        .pipe(browserSync.stream()); //мониторить за css
}

//Функция для оптимизации изображений
function images() {
    return src("app/img/src/**/*")
        .pipe(newer("app/img/dest/"))
        .pipe(imagemin())
        .pipe(dest("app/img/dest/"));
}

function cleanimg() {
    return del("app/img/dest/**.*", { force: true });
}

function cleandist() {
    return del("dist/**.*", { force: true });
}

// копируем все, кроме исходников для дальнейшей выгрузки готового проекта
function buildcopy() {
    return src(
        [
            "app/css/**/*.min.css",
            "app/js/**/*.min.js",
            "app/img/dest/**/*",
            "app/**/*.html",
        ], { base: "app" }
    ).pipe(dest("*/dist")); //копируем все в папку dist
}

// функция следящая за изменениями и выводом автоматически на страницу
function startwatch() {
    watch(["app/**/*sass", "!app/**/*.min.css"], styles);
    watch(["app/**/*.js", "!app/**/*.min.js"], scripts); //наблюдаем за всеми js файлами + исключение рекурсирования
    watch("app/**/*.html").on("change", browserSync.reload);
    watch("app/img/src/**/*", images); //наблюдаем чисто за источниками
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;
exports.build = series(cleandist, styles, scripts, images, buildcopy); //последовательно
exports.default = parallel(scripts, styles, browsersync, startwatch);