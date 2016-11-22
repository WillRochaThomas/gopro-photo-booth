import GoPro from 'goproh4';

class GoProApi {
  constructor() {
    this.camera = new GoPro.Camera();
  }

  takePhoto() {
    this.enableCameraMode().bind(this);
    this.trigger().bind(this);
  }

  enableCameraMode() {
    this.camera.mode(GoPro.Settings.Modes.Photo, GoPro.Settings.Submodes.Photo.Single);
  }

  trigger() {
    this.camera.start();
  }

  saveLastPictureTo(targetDirectory, successCallback, errorCallback) {
    this.camera.listMedia().then((result) => {
      const lastDirectory = result.media[result.media.length - 1];
      const lastFile = lastDirectory.fs[lastDirectory.fs.length - 1];

      this.camera.getMedia(lastDirectory.d, lastFile.n, `${targetDirectory}/${lastFile.n}`).then((filename) => {
        successCallback(filename);
      }, errorCallback);
    }, errorCallback);
  }
}

export default GoProApi;
