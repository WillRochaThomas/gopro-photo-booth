/*
 * Serve content over a socket
 */

var _ = require('lodash');
var fs = require('fs-extra');

function getPhotos(cb) {
 fs.readdir('./public/linked-photos', function(err, files) {
   if (err) {
     console.log('omg', err);
   } else {
     console.log('aaa');
     cb(files)
   }
 });
}

module.exports = function (socket) {
  var oldFiles = [];
  setInterval(function () {
    getPhotos(function(files) {
      _.remove(files, function(file) {
        return !file.match(/.*(\.JPG|\.gif|\.jpeg|\.png)/);
      });
      var newFile;
      if (files.length > oldFiles.length) {
        oldFiles = files;
        newFile = true;
        socket.emit('send:photos', {
          photos: files,
          newFile: newFile
        });
      }
    });
  }, 1000);
};
