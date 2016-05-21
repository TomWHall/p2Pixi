module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      core: {
        src: ['src/index.js'],
        dest: 'dist/<%= pkg.name %>.js',
        options: {
          browserifyOptions: {
            standalone: 'P2Pixi'
          },
          banner: '/** \n * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> \n * Copyright (c) <%= pkg.author %> \n * <%= pkg.description %> \n * License: MIT \n */\n'
        }
      }
    },
    uglify: {
      options: {
        banner: '/** \n * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> \n * Copyright (c) <%= pkg.author %> \n * <%= pkg.description %> \n * License: MIT \n */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= browserify.core.dest %>']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['browserify', 'uglify']);
};