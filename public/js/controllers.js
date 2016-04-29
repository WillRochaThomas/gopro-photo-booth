'use strict';

/* Controllers */
var uniqueRandoms = [];

function makeUniqueRandom(numRandoms) {
    // refill the array if needed
    if (!uniqueRandoms.length) {
        for (var i = 0; i < numRandoms; i++) {
            uniqueRandoms.push(i);
        }
    }
    var index = Math.floor(Math.random() * uniqueRandoms.length);
    var val = uniqueRandoms[index];

    // now remove that value from the array
    uniqueRandoms.splice(index, 1);

    return val;

}


angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, socket, $interval, $timeout) {
    $scope.photos = [];
    var intervalID;
    $scope.currentImage;
    $scope.hideImage = false;
    $scope.newFile = false;
    $scope.showBG = false;
    $scope.flash = false;
    socket.on('send:photos', function (data) {
      $scope.tempPhotos = data.photos;
      $scope.newFile = data.newFile;
      if ($scope.newFile) {
        $interval.cancel(intervalID);
        $scope.hideImage = true;
        $scope.flash = true;
        $('.flash').fadeIn(50);
        $scope.currentImage = $scope.tempPhotos.length - 1;
        $timeout(function() {
          angular.forEach($scope.tempPhotos, function(item) {
            console.log('tick');
            if ($scope.photos.indexOf(item) === -1) {
              $scope.photos.push(item);
            }
          });
          console.log($scope.photos, $scope.currentImage);
          startRandomizing();
        }, 100);
      } else {
      }
    });
    function startRandomizing() {
      intervalID = $interval(function() {
        if ($scope.tempPhotos && $scope.tempPhotos.length > 0) {
          $scope.showBG = true;
          $timeout(function() {
            $scope.currentImage = makeUniqueRandom($scope.tempPhotos.length);
          }, 300);
          // angular.forEach($scope.tempPhotos, function(item) {
          //   if ($scope.photos.indexOf(item) === -1) {
          //     $scope.photos.push(item);
          //   }
          // });
          // if ($scope.newFile) {
          //   $scope.newFile = false;
          //   $scope.currentImage = $scope.photos.length - 1;
          //   lastNewFile = true;
          // } else {
          //   lastNewFile = false;
          // }
        }
      }, 2500);
    }
  });
