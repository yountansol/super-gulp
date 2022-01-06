import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import gulpSass from "gulp-sass";
import nodeSass from "node-sass";
import bro from "gulp-bro";
import babelify from "babelify";
import autop from "gulp-autoprefixer";
import miniCSS from "gulp-csso";
import ghPages from "gulp-gh-pages";

const sass = gulpSass(nodeSass);


// sass.compiler = require("node-sass");


const routes = {
    pug: {
        watch: "src/**/*.pug",
        src: "src/*.pug",
        dest: "build"
    },
    img:{
        src: "src/img/*",
        dest: "build/img"
    },
    scss:{
        watch:"src/scss/**/*.scss",
        src:"src/scss/styles.scss",
        dest:"build/css"
    },
    js:{
        watch: "src/js/**/*.js",
        src: "src/js/main.js",
        dest:"build/js"
    }
};

const pug = () => 
    gulp
        .src(routes.pug.src)
        .pipe(gpug())
        .pipe(gulp.dest(routes.pug.dest));

const js = () => 
    gulp
        .src(routes.js.src)
        .pipe(bro({
            transform: [babelify.configure({presets: ["@babel/preset-env"]}),
            ["uglifyify", {global: true}]]
        })
        .pipe(gulp.dest(routes.js.dest)));

const styles = () => 
    gulp
    .src(routes.scss.src)
    .pipe(sass().once("error", sass.logError))
    .pipe(autop({
        overrideBrowserslist: ["last 2 versions"]
        })
    )
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));


const clean = () => del(["build", ".publish"]);

const webserver = () =>gulp.src("build").pipe(ws({livereload: true, open: true}));

const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.img.src, img);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.watch, js);
};

const img = () => 
    gulp
        .src(routes.img.src)
        .pipe(image())
        .pipe(gulp.dest(routes.img.dest));

const gh = () => 
    gulp
        .src("build/**/*")
        .pipe(ghPages());


const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]); //dev 명령어가 gulp를 통해 어떤 일을 할건지 지정해주고 외부로 export
export const deploy = gulp.series([build, gh, clean]);
