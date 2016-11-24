/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import io from 'socket.io-client';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';
import history from '../../core/history';

const socket = io.connect('http://localhost:3000');

class Home extends React.Component {
  static propTypes = {
    photos: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  };

  static getRandomInt(min, max) {
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
  }

  static newPhoto() {
    console.log('new photo received, reloading page'); // eslint-disable-line no-console
    history.push(history.location.pathname);
  }

  static stringIsEmpty(string) {
    return typeof string === 'undefined' || string == null || string.toString().trim().length === 0;
  }

  constructor(props, context) {
    super(props, context);

    let currentPhoto;
    if (this.props.photos.length > 1) {
      currentPhoto = this.props.photos[this.props.photos.length - 1];
    }

    this.state = {
      currentPhoto,
      message: '',
      flash: false,
    };

    this.messageReceived = this.messageReceived.bind(this);
    this.nextPhoto = this.nextPhoto.bind(this);
    this.flash = this.flash.bind(this);
    this.removeFlash = this.removeFlash.bind(this);
    this.handleError = this.handleError.bind(this);
    this.photoReload = false;
  }

  componentDidMount() {
    this.photoReload = setInterval(this.nextPhoto, 3000);
    socket.on('message', this.messageReceived);
    socket.on('flash', this.flash);
    socket.on('newPhoto', this.constructor.newPhoto);
    socket.on('cameraError', this.handleError);
  }

  componentWillUnmount() {
    if (this.photoReload) {
      clearInterval(this.photoReload);
      this.photoReload = false;
    }
  }

  nextPhoto() {
    if (this.props.photos.length < 1) {
      return;
    }

    const nextIndex = this.constructor.getRandomInt(0, this.props.photos.length - 1);

    this.setState({
      currentPhotoIndex: nextIndex,
      currentPhoto: this.props.photos[nextIndex],
    });
  }

  messageReceived(message) {
    this.setState({ message });
  }

  removeFlash() {
    this.setState({ flash: false, message: 'incoming photo...' });
  }

  flash() {
    console.log('flash requested'); // eslint-disable-line no-console
    this.setState({ flash: true });
    setTimeout(this.removeFlash, 400);
  }

  handleError(errorMessage) {
    setInterval(window.location.reload, 2000);
    this.messageReceived(errorMessage);
  }

  render() {
    let containerStyle = {};
    let flashStyle = s.flashHide;

    if (this.state.flash) {
      flashStyle = s.flashShow;
    } else if (this.constructor.stringIsEmpty(this.state.message)) {
      containerStyle = { backgroundImage: `url(${this.state.currentPhoto})` };
    }

    return (
      <div className={s.root}>
        <div className={flashStyle} />
        <div className={s.container} style={containerStyle}>
          {this.state.message}
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Home);
