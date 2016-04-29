 'use strict';

/* Directives */
angular.module('myApp.directives', []).
  directive('showImage', function ($timeout) {
    return {
      restrict: 'E',
      template: '<div class="img" ng-style="styles"></div>',
      replace: true,
      link: function(scope) {
        scope.$watch('flash', function() {
          if (scope.flash) {
            scope.flash = false;
            // $timeout(function() {
              $('.flash').delay(50).fadeOut(350);
            // }, 1000);
          }
        });
        var lastBG = 0;
        var maxBGs = 5;
        scope.$watch('showBG', function() {
          if (scope.showBG) {
            scope.showBG = false;
            $timeout(function() {
              // $timeout(function() {
              var r = lastBG - 1;
              if (r < 0) {
                r = maxBGs - 1;
              }
              console.log(r);
              // $('.bg').removeClass('bg' + (r));
              // $('.bg').addClass('bg' + lastBG);
              // $('.bg').fadeIn(150).delay(200).fadeOut(250);
              lastBG++;
              if (lastBG >= maxBGs) {
                lastBG = 0;
              }
            }, 1);
          }
        });
        scope.$watch('currentImage', function(currentImage) {
          $('.img').stop(true, true).fadeOut(100);
          $timeout(function() {
            if (currentImage >= 0) {
              scope.styles = {
                'background': 'url(\'linked-photos/' + scope.photos[currentImage] + '\') no-repeat center center fixed',
                'background-size': 'cover'
              };
              console.log('qqq');

              $('.img').stop(true, true).fadeIn(250);
            }
          }, 100);
        });
      }
    }
  });
