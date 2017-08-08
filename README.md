# GoPro Photo Booth

A web-based photo booth that is designed to work in conjunction with an Arduino and a GoPro camera.

This was built on top of [Kriasoft's react starter kit](https://github.com/kriasoft/react-starter-kit)

This was written as throw-away code, so there are no tests and it's a little hacky.

## How it works

1. a physical button is pressed
1. the arduino writes a '1' to serial port
1. this application is listening on the serial port and detects data being written
1. the application triggers a countdown using a websocket to communicate with the code running in browser and trigger it to update the view
1. the application issues http calls to the webserver running on the GoPro which trigger it to enable camera mode and take a picture
1. when pictures aren't being taken, the application cycles through photos already taken and shows those in the browser   

## How to run this web app

`npm install` #installs dependencies
`npm start` #runs the application


## What else it needs (arduino and GoPro)

* install the [Arduino Desktop IDE](https://www.arduino.cc/en/Guide/ArduinoUno)
* the sketch file containing the code run on the arduino is committed in the `arduino` directory of this repository. This needs to be loaded onto the Arduino
* The arduino code assumes a button is connected to pin 2 and when the button is pressed the pin state goes from 1 (on) to 0 (off).
* A GoPro should be switched on with Wifi enabled (I used a Hero 4)

There is a config file in `src/config` where you can change: 

* the application port, 
* the directory it saves photos to and reads them from, 
* the name of the arduino serial port, and 
* the name of the wifi network your gopro exposes.
 

   


