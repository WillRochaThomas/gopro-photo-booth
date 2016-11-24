/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import 'babel-polyfill';
import path from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import EventEmitter from 'events';
import React from 'react';
import ReactDOM from 'react-dom/server';
import UniversalRouter from 'universal-router';
import PrettyError from 'pretty-error';
import fs from 'fs';
import io from 'socket.io';
import SerialPort from 'serialport';
import WiFiControl from 'wifi-control';
import GoProApi from './GoProApi';
import DataReceivedAction from './DataReceivedAction';
import App from './components/App';
import Html from './components/Html';
import { ErrorPageWithoutStyle } from './routes/error/ErrorPage';
import errorPageStyle from './routes/error/ErrorPage.css';
import routes from './routes';
import assets from './assets'; // eslint-disable-line import/no-unresolved
import { port, photosDirectory, arduinoSerialName, clientOrigin, goProWifiSSID } from './config';

EventEmitter.defaultMaxListeners = 15;

const app = express();
const relativePathToPhotos = `./src/public/${photosDirectory}`;

const corsOptions = {
  origin: clientOrigin,
  methods: ['GET', 'PUT', 'POST'],
  allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
};

app.use(cors(corsOptions));

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/api/photos', async (req, res) => {
  fs.readdir(relativePathToPhotos, (error, files) => {
    if (error) {
      console.error('Could not read photos directory'); // eslint-disable-line no-console
      res.status(500).send({ error: 'Something failed!' });
    }

    const onlyImages = files.filter(filename => (/\.(gif|jpg|jpeg|tiff|png)$/i).test(filename));
    const fullImageUrls = onlyImages.map(filename => `/${photosDirectory}/${filename}`);
    res.json(fullImageUrls);
  });
});

// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
    };

    const route = await UniversalRouter.resolve(routes, {
      path: req.path,
      query: req.query,
    });

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    const data = { ...route };
    data.children = ReactDOM.renderToString(<App context={context}>{route.component}</App>);
    data.style = [...css].join('');
    data.script = assets.main.js;
    data.chunk = assets[route.chunk] && assets[route.chunk].js;
    const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);

    res.status(route.status || 200);
    res.send(`<!doctype html>${html}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      style={errorPageStyle._getCss()} // eslint-disable-line no-underscore-dangle
    >
      {ReactDOM.renderToString(<ErrorPageWithoutStyle error={err} />)}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------
/* eslint-disable no-console */
const server = app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}/`);
});
/* eslint-enable no-console */

const arduinoPortConfig = {
  baudRate: 9600,
  // call .on('data') when a newline is received:
  parser: SerialPort.parsers.readline('\n'),
};

const arduinoSerialPort = new SerialPort(arduinoSerialName, arduinoPortConfig);

function onPortClose() {
  console.log('Port is closed'); // eslint-disable-line no-console
}

function onPortError() {
  console.log('Error reading from port'); // eslint-disable-line no-console
}

async function dataReceivedFromArduino(data, action) {
  await arduinoSerialPort.flush();
  console.log(`received data from arduino: ${data}`); // eslint-disable-line no-console
  action.trigger();
}

arduinoSerialPort.on('close', onPortClose);
arduinoSerialPort.on('error', onPortError);
arduinoSerialPort.flush();

const goProApi = new GoProApi();

function onSocketOpen(socket) {
  console.log(`new user address: ${socket.handshake.address}`); // eslint-disable-line no-console

  const dataReceivedAction = new DataReceivedAction(socket, goProApi, relativePathToPhotos);

  arduinoSerialPort.on('data', (data) => {
    dataReceivedFromArduino(data, dataReceivedAction);
  });
}

const socketServer = io(server, { origins: clientOrigin });
socketServer.sockets.setMaxListeners(0);
socketServer.on('connection', onSocketOpen);

WiFiControl.init({});

function confirmConnectedToNetwork(wifiSSID) {
  const wifiState = WiFiControl.getIfaceState();
  console.log(`checking connected to ${wifiSSID}`); // eslint-disable-line no-console
  console.log(`wifi state ${JSON.stringify(wifiState)}`); // eslint-disable-line no-console

  if (wifiState.connection === 'connected' && wifiState.ssid === wifiSSID) {
    console.log('already connected to right wifi network, nothing to do'); // eslint-disable-line no-console
    return;
  }

  console.log(`connecting to ${wifiSSID} wifi network`); // eslint-disable-line no-console

  const wifiDetails = {
    ssid: wifiSSID,
  };

  WiFiControl.connectToAP(wifiDetails, (error, response) => {
    if (error) {
      console.error(error); // eslint-disable-line no-console
    } else {
      console.log(response);  // eslint-disable-line no-console
    }
  });
}

console.log(`wifi SSID ${goProWifiSSID}`); // eslint-disable-line no-console
confirmConnectedToNetwork(goProWifiSSID);
const fiveMinutesInMs = 300000;
setInterval(() => { confirmConnectedToNetwork(goProWifiSSID); }, fiveMinutesInMs);
