class DataReceivedAction {
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  constructor(clientSocket, cameraApi, photosDirectory) {
    console.log(`socket: ${clientSocket}`); // eslint-disable-line no-console
    console.log(`cameraApi: ${cameraApi}`); // eslint-disable-line no-console
    this.clientSocket = clientSocket;
    this.cameraApi = cameraApi;
    this.photosDirectory = photosDirectory;
    this.pictureInProgress = false;
    this.counter = 3;
    this.countdownInterval = false;
  }

  async trigger() {
    if (this.alreadyTakingPicture()) {
      console.log('already taking picture so exit'); // eslint-disable-line no-console
      return;
    }

    this.takingPicture();
    this.countdownTick();
    this.countdownInterval = setInterval(() => { this.countdownTick.call(this); }, 1000);
  }

  async countdownTick() {
    try {
      this.clientSocket.emit('message', this.counter);
      this.counter -= 1;

      if (this.counter < 0) {
        this.resetCountdown();
        const beforePhotosCount = await this.cameraApi.numberPhotos();
        this.cameraApi.takePhoto();
        this.clientSocket.emit('flash');

        let timeout = 2;
        let currentPhotosCount = beforePhotosCount;

        for (timeout; timeout > 0; timeout -= 1) {
          console.log(`waiting for new photo and ${timeout} seconds until timeout`); // eslint-disable-line no-console

          try {
            currentPhotosCount = await this.cameraApi.numberPhotos();

            if (currentPhotosCount > beforePhotosCount) {
              break;
            }
          } catch (e) {
            console.log(`Camera reported an error when checking number of photos: ${e}, will try again`); // eslint-disable-line no-console
          }

          await this.constructor.sleep(1000);
        }

        if (timeout <= 0) {
          throw new Error('Could not access new photo, check camera');
        }

        const newPhotoFilename = await this.cameraApi.saveLastPictureTo(this.photosDirectory);

        console.log(`photo retrieved and saved from camera ${newPhotoFilename}`); // eslint-disable-line no-console
        this.clientSocket.emit('newPhoto');
        this.notTakingPicture();
      }
    } catch (e) {
      console.error(`error in taking picture: ${e}`); // eslint-disable-line no-console
      this.clientSocket.emit('cameraError', 'something went wrong, check the camera');
      this.notTakingPicture();
      throw e;
    }
  }

  resetCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = false;
    this.counter = 3;
  }

  alreadyTakingPicture() {
    return this.pictureInProgress;
  }

  takingPicture() {
    this.pictureInProgress = true;
  }

  notTakingPicture() {
    this.pictureInProgress = false;
  }
}

export default DataReceivedAction;
