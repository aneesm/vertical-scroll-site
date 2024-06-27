// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const cache = require('gulp-cache');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const eslint = require('gulp-eslint');
const fs = require('fs');
const header = require('gulp-header');
const imagemin = require('gulp-imagemin');
const jsdoc = require('gulp-jsdoc3');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const stylelint = require('gulp-stylelint');
const svgSprite = require('gulp-svg-sprite');
const uglify = require('gulp-uglify');
const webpack = require('webpack-stream');

// Get data from package.json
const pckg = JSON.parse(fs.readFileSync('package.json'));
const paths = pckg.paths;

// Sass task: compiles the style.scss file into style.css
function scssTask(){
    return src(`${paths.src.css}style.scss`)
        .pipe(sourcemaps.init()) // track changes to generate sourcemap
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(sourcemaps.write('./')) // save sourcemap
        .pipe(dest(paths.dist.css)); // put final CSS in patternlab public folder
}

// CSS Lint taks - runs stylelint
function cssLintTask(){
    return src(paths.src.css + '/scss/**/*.scss')
        .pipe(stylelint({
          reporters: [{
            formatter: 'string',
            console: true,
          }],
        })); // lint CSS
}

// JS task:manages Webpack and Babel to concatenate and transpile the JS
function jsTask(){
    return src(`${paths.src.js}main.js`)
        .pipe(webpack(require('./webpack/config.production.js'))) // run webpack
        .pipe(dest(paths.dist.js)
    ); // put final JS in patternlab public folder
}

// JS dev task:manages Webpack and Babel to concatenate and transpile the JS
function jsDevTask(){
    return src(`${paths.src.js}main.js`)
        .pipe(webpack(require('./webpack/config.development.js'))) // run webpack
        .pipe(dest(paths.dist.js)) // put final JS in patternlab public folder
        .pipe(browserSync.stream());
}

// JS Lint taks - runs eslint
function jsLintTask(){
    return src([`${paths.src.js}**/*.js`, `!${paths.src.js}vendor/*.js`])
      .pipe(eslint())
    	.pipe(eslint.format())
    	.pipe(jsdoc()); // lint JS
}

// Copy theme info from package to dist style.css
function themeInfoTask(){
    return src(`${paths.dist.css}style.css`)
    	.pipe(header('/*!\nTheme Name: ${pckg.themename}\nTheme URI: ${pckg.themeuri}\nAuthor: ${pckg.author}\nAuthor URI: ${pckg.authoruri}\nDescription: ${pckg.description}\nVersion: ${pckg.version}\n*/', {pckg : pckg}))
      .pipe(dest(paths.dist.css)) // put final CSS in dist folder
      .pipe(browserSync.stream());
}

// Generate icon sprite sheet
function iconSpriteTask() {
  return src(`${paths.src.icons}/*.svg`)
    .pipe(svgSprite({
      mode: {
        symbol: {
          dest: '.',
          sprite: 'icon-sprite.twig',
          bust: false,
          inline: true,
          dimensionAttributes: false,
        },
      },
    }))
    .pipe(dest(paths.views));
}

// Optimize images
function imageOptimizeTask() {
  return src(`${paths.src.images}*`)
    .pipe(cache(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true,
    })))
    .pipe(dest(paths.dist.images));
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = parallel(
  series(cssLintTask, scssTask, themeInfoTask),
  series(jsLintTask, jsTask),
  iconSpriteTask,
  imageOptimizeTask
);

exports.build = parallel(
  series(cssLintTask, scssTask, themeInfoTask),
  series(jsLintTask, jsTask),
  iconSpriteTask,
  imageOptimizeTask
);

exports.images = parallel(
  iconSpriteTask,
  imageOptimizeTask
);

exports.watch = function() {
  browserSync.init({
    proxy: 'frontend.dev',
    port: 3001,
    ghostMode: {
      scroll: true,
    },
    open: false,
  });

  watch(`${paths.src.css}**/*.scss`, series(cssLintTask, scssTask, themeInfoTask));
  watch([`${paths.src.js}**/*.js`, `!${paths.src.js}vendor/*.js`], series(jsLintTask, jsDevTask));
  watch(`${paths.src.icons}/*.svg`, iconSpriteTask);
  watch(`${paths.src.images}*`, imageOptimizeTask);
}
