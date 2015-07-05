'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'dist/{,*/}*',
            '!dist/.git{,*/}*'
          ]
        }]
      }
    },

    copy: {
      dist: {
        files: [
          {src: ['index.html'], dest: 'dist/'},
          {src: [
              'css/*.css',
              'vendor/*.js',
              'images/*.jpg',
              'EXAMPLES/*.js',
              'EXAMPLES/*.html',
              'Common/*.js',
              'homework/**/*.js',
              'homework/**/*.html',
              'experiments/**/*.js',
              'experiments/**/*.html'
            ],
            dest: 'dist/',
            expand: true
          }
        ]
      }
    },

    'gh-pages': {
      dist: {
        options: {
          base: 'dist',
          message: 'Deployed by grunt gh-pages'
        },
        src: '**/*'
      }
    }

  });

  grunt.registerTask('dist', ['clean:dist', 'copy:dist']);
  grunt.registerTask('deploy', ['dist', 'gh-pages:dist']);

};
