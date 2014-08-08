module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mocha: {
      test: {
        src: "test/**/*.js"
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('test', ['mocha:test']);
};