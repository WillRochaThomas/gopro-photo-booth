'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [

  'myApp.controllers',
  'myApp.services',
  'myApp.directives',

  // 3rd party dependencies
  'btford.socket-io'
]).
config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});
