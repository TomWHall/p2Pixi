module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/** \n * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> \n * Copyright (c) <%= pkg.author %> \n * <%= pkg.description %> \n * License: MIT \n */\n',
                separator: ';'
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/** \n * <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> \n * Copyright (c) <%= pkg.author %> \n * <%= pkg.description %> \n * License: MIT \n */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);
};