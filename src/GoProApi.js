import GoPro from 'goproh4';

class GoProApi {
  constructor() {
    this.camera = new GoPro.Camera();
  }

  async numberPhotos() {
    const result = await this.camera.listMedia();
    let numberOfPics = 0;

    result.media.forEach((directory) => {
      directory.fs.forEach(() => {
        numberOfPics += 1;
      });
    });

    return numberOfPics;
  }

  takePhoto() {
    this.enableCameraMode();
    this.trigger();
  }

  enableCameraMode() {
    this.camera.mode(GoPro.Settings.Modes.Photo, GoPro.Settings.Submodes.Photo.Single);
  }

  trigger() {
    this.camera.start();
  }

  async saveLastPictureTo(targetDirectory) {
    const result = await this.camera.listMedia();
    const lastDirectory = result.media[result.media.length - 1];
    const lastFile = lastDirectory.fs[lastDirectory.fs.length - 1];

    return await this.camera.getMedia(lastDirectory.d, lastFile.n, `${targetDirectory}/${lastFile.n}`);
  }
}

export default GoProApi;
