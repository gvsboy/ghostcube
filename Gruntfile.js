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

    bower_concat: {
      all: {
        dest: 'dist/js/lib.js'
      }
    },

    clean: {
      dist: 'dist'
    },

    watch: { 
      scripts: {
        files: ['src/**/*'],
        tasks: ['default'],
        options: {
          livereload: true
        }
      }
    },

    jasmine: {
      all: {
        src: 'src/js/**/*.js',
        options: {
          specs: 'jasmine/spec/*Spec.js',
          helpers: 'jasmine/spec/*Helper.js',
          vendor: [
            'dist/js/lib.js'
          ]
        }
      }
    },

    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'dist/js/main.js': 'dist/js/main.js'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('default', [
    'clean',
    'sass',
    'concat',
    'babel',
    'bower_concat'
  ]);

};
