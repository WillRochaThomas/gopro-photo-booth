'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, socket, $interval, $timeout) {
    $scope.photos = [];
    var intervalID;
    $scope.currentImage;
    $scope.hideImage = false;
    $scope.newFile = false;
    socket.on('send:photos', function (data) {
      $scope.tempPhotos = data.photos;
      $scope.newFile = data.newFile;
      if ($scope.newFile) {
        $interval.cancel(intervalID);
        $scope.hideImage = true;
        $timeout(function() {
          angular.forEach($scope.tempPhotos, function(item) {
            console.log('tick');
            if ($scope.photos.indexOf(item) === -1) {
              $scope.photos.push(item);
            }
          });
          $scope.currentImage = $scope.tempPhotos.length - 1;
          console.log($scope.photos, $scope.currentImage);
          startRandomizing();
        }, 100);
      } else {
      }
    });
    function startRandomizing() {
      intervalID = $interval(function() {
        if ($scope.tempPhotos && $scope.tempPhotos.length > 0) {
          $scope.currentImage = Math.floor(Math.random() * $scope.tempPhotos.length - 1);
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
