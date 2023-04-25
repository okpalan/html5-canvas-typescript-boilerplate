const gulp = require("gulp");
const path = require("path");
const ts = require("gulp-typescript");
const merge2 = require("merge2");
const browserSync = require("browser-sync").create();

const paths = {
    source: {
        tsLib: ["src/lib/*.?(ts)", "src/@types/lib/*.?(d.ts)"],
        html: ["src/html/*.?(htm|html)"]
    },
    dest: {
        tsLib: "dist/lib",
        tsDeclaration: "dist/@types/lib",
        html: "dist/html/",
        out: "dist"
    }
};

const transpile = function ({ watch, outDir }) {
    const { source: src, dest } = paths;
    const tsProj = ts.createProject("tsconfig.json", {
        watch: watch === true ? true : false,
        outDir: outDir || dest.tsLib,
        declarationDir: dest.tsDeclaration
    });

    const tsResult = gulp.src(src.tsLib)
        .pipe(tsProj())
    return merge2([
        tsResult.dts.pipe(gulp.dest(dest.tsDeclaration)),
        tsResult.js.pipe(gulp.dest(dest.tsLib))
    ])
        .pipe(browserSync.stream())

};

gulp.task("ts:lib", transpile);

gulp.task("copy:html", function () {
    return gulp.src(paths.source.html)
        .pipe(gulp.dest(paths.dest.html))
        .pipe(browserSync.stream())
})

gulp.task("build", gulp.parallel(["ts:lib", "copy:html"]));

gulp.task("watch:all", function () {
    gulp.watch(paths.source.tsLib, gulp.parallel("ts:lib"))
        .on('change', browserSync.reload)
    gulp.watch(paths.source.html, gulp.parallel("copy:html"))
        .on('change', browserSync.reload)
        
});

gulp.task("serve", gulp.series("watch:all"), function () {
    browserSync.init({
        server: {
            baseDir: paths.dest.out
        }
    });
})

gulp.task("default", gulp.series("build", "serve"));
