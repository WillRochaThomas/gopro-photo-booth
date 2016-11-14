/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';

class Home extends React.Component {
  static propTypes = {
    photos: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      currentPhotoIndex: 0,
      currentPhoto: this.props.photos[0],
    };

    setInterval(() => {
      let nextIndex = 0;
      if (this.state.currentPhotoIndex + 1 < this.props.photos.length) {
        nextIndex = this.state.currentPhotoIndex + 1;
      }

      this.setState({
        currentPhotoIndex: nextIndex,
        currentPhoto: this.props.photos[nextIndex],
      });
    }, 3000);
  }

  render() {
    const divStyle = {
      backgroundImage: `url(${this.state.currentPhoto})`,
    };


    return (
      <div className={s.root}>
        <div className={s.container} style={divStyle} />
      </div>
    );
  }
}

export default withStyles(s)(Home);
