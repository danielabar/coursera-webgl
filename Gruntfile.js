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
          {src: ['Common/*.js'], dest: 'dist/', expand: true},
          {src: ['Common/*.html'], dest: 'dist/', expand: true},
          {src: ['homework/**/*.js'], dest: 'dist/', expand: true},
          {src: ['homework/**/*.html'], dest: 'dist/', expand: true}
        ]
      }
    }

  });

  grunt.registerTask('dist', ['clean:dist', 'copy:dist']);

};
