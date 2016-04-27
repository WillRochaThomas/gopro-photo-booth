'use strict';

/* Directives */

angular.module('myApp.directives', []).
  directive('showImage', function ($timeout) {
    return {
      restrict: 'E',
      template: '<img class="img" ng-src="{{ url }}" />',
      replace: true,
      link: function(scope) {
        scope.$watch('hideImage', function() {
          scope.hideImage = false;
          $('.img').fadeOut(100);
        });
        scope.$watch('currentImage', function(currentImage) {
          $('.img').fadeOut(100);
          $timeout(function() {
            if (currentImage >= 0) {
              scope.url = 'linked-photos/' + scope.photos[currentImage];
              $('.img').fadeIn(250);
            }
          }, 250);
        });
      }
    }
  });
