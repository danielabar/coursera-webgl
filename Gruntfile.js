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
          {src: ['EXAMPLES/*.js'], dest: 'dist/', expand: true},
          {src: ['EXAMPLES/*.html'], dest: 'dist/', expand: true},
          {src: ['Common/*.js'], dest: 'dist/', expand: true},
          {src: ['homework/**/*.js'], dest: 'dist/', expand: true},
          {src: ['homework/**/*.html'], dest: 'dist/', expand: true}
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
