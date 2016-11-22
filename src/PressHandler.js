class PressHandler {
  constructor(clientSocket, cameraApi, photosDirectory) {
    console.log(`socket: ${clientSocket}`); // eslint-disable-line no-console
    console.log(`cameraApi: ${cameraApi}`); // eslint-disable-line no-console
    this.clientSocket = clientSocket;
    this.cameraApi = cameraApi;
    this.photosDirectory = photosDirectory;
    this.takingPicture = false;
  }

  handlePress() {
    if (this.takingPicture) {
      console.log('already taking picture so exit'); // eslint-disable-line no-console
      return;
    }

    this.takingPicture = true;

    let counter = 3;
    const that = this;

    const interval = setInterval(() => {
      try {
        that.clientSocket.emit('message', counter);
        counter -= 1;

        if (counter < 0) {
          that.cameraApi.takePhoto();
          that.clientSocket.emit('flash');
          clearInterval(interval);
          that.cameraApi.saveLastPictureTo(that.photosDirectory, (filename) => {
            console.log(`photo retrieved and saved from camera ${filename}`); // eslint-disable-line no-console
            that.clientSocket.emit('newPhoto');
          }, (error) => {
            throw error;
          });
          that.takingPicture = false;
        }
      } catch (e) {
        console.error(`error in taking picture: ${e}`); // eslint-disable-line no-console
        that.clientSocket.emit('cameraError', 'something went wrong, check the camera');
        that.takingPicture = false;
        throw e;
      }
    }, 1000);
  }
}

export default PressHandler;
