const gulp = require('gulp');

if (process.env.npm_lifecycle_event === 'dev:watch') require('./gulp/dev');
else if (process.env.npm_lifecycle_event === 'prod:build') require('./gulp/prod');


