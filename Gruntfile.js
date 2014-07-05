module.exports = function(grunt) {

  var path = require('path'),
      pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({

    pkg: pkg,

    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'dist/css/main.css': 'src/scss/main.scss'
        }
      }
    },

    concat: {
      html: {
        src: 'src/html/**/*.html',
        dest: 'dist/index.html'
      },
      js: {
        src: 'src/js/**/*.js',
        dest: 'dist/js/main.js'
      }
    },

    clean: {
      dist: 'dist'
    },

    express: {
      server: {
        options: {
          debug: true,
          port: 4000,
          bases: [path.resolve(__dirname, 'dist')],
          server: path.resolve(__dirname, './server'),
          livereload: true
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-express');

  grunt.registerTask('server', [
    'express:server',
    'express-keepalive'
  ]);

  grunt.registerTask('default', [
    'clean',
    'sass',
    'concat'
  ]);

};
