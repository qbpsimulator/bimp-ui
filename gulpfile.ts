import { Gulpclass, Task, SequenceTask } from 'gulpclass';

const cp = require('child_process');
const del = require('del');
const gulp = require('gulp');
const gutil = require('gulp-util');

const path = require('path');
const typescript = require('gulp-typescript');
const webpack = require('webpack');
const gulpWebpack = require('webpack-stream');
const gulpCopy = require('gulp-copy');


const pkg = require('./package');

const product = {
  dist: {
    dir: 'dist',
    sourceFiles: [
      'example/**/*',
      'resources/**/*',
      'LICENSE',
      'README.md'
    ]
  },
  compiled: {
    es6dir: 'dist/libES6',
    es5dir: 'dist/lib'
  },
  packaged: {
    dir: 'dist/static'
  },
  npmModule: {
    dir: 'dist/npm_package',
    sourceFiles: [
      'dist/lib/**/*',
      'package.json',
      'LICENSE',
      'README.md'
    ]
  },
};

let docs = {
  dir: 'dist/docs',
  conf: 'jsdoc.json',
  files: [
    product.compiled.es6dir
  ]
};

@Gulpclass()
export class Gulpfile {

  @Task()
  buildDevBundle() {
    const configFunc = require('./webpack.config.js');
    const webpackConfig = configFunc('dev');

    return gulp.src('./webpack.prod.js')
      .pipe(gulpWebpack(webpackConfig, webpack))
      .pipe(gulp.dest(product.packaged.dir));
  }

  @Task()
  buildMinifiedBundle() {
    const configFunc = require('./webpack.config.js');
    const webpackConfig = configFunc('prod');

    return gulp.src('./webpack.config.js')
      .pipe(gulpWebpack(webpackConfig, webpack))
      .pipe(gulp.dest(product.packaged.dir));
  }

  @SequenceTask()
  packageBundles() {
    return ['buildDevBundle', 'buildMinifiedBundle', 'copyResourcesToPackage'];
  }

  @Task()
  copyResourcesToPackage() {
    return gulp
      .src(product.dist.sourceFiles)
      .pipe(gulpCopy(product.dist.dir, { prefix: 1 }))
  }


  @Task()
  copySourceFilesToNpmPackage() {
    return gulp
      .src(product.npmModule.sourceFiles)
      .pipe(gulpCopy(product.npmModule.dir, { prefix: 2 }))
  }

  @SequenceTask()
  packageNpmModule() {
    return ['copySourceFilesToNpmPackage'];
  }

  @Task()
  clean() {
    return del([
      product.compiled.es5dir,
      product.compiled.es6dir,
      product.packaged.dir,
      product.dist.dir,
      product.npmModule.dir
    ]);
  }

  @Task()
  cleanDoc() {
    return del([
      docs.dir
    ]);
  }

  @SequenceTask()
  doc() {
    return ['buildES6Lib', 'cleanDoc', 'generateJSDoc'];
  }

  @SequenceTask()
  default() {
    return [
      'clean',
      'packageBundles'
      //'packageNpmModule',
      //'doc'
    ];
  }

  @Task()
  generateJSDoc(cb: Function) {
    cp.exec(['node', 'node_modules/jsdoc/jsdoc',
      '-d', docs.dir,
      '-c', docs.conf,
      docs.files.join(' ')].join(' '), cb);
  }
}

