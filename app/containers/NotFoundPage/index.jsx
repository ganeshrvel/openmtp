'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../routing';
import styles from './styles/index.scss';
import { Helmet } from 'react-helmet';
import { title } from '../../utils/meta';

export default class NotFound extends Component {
  render() {
    return (
      <React.Fragment>
        <Helmet titleTemplate={`%s | ${title}`}>
          <title>Resource not found!</title>
        </Helmet>
        <div className={styles.container} data-tid="container">
          <h1>Resource not found!</h1>
          <Link to={routes.Home.path}>Go back Home</Link>
        </div>
      </React.Fragment>
    );
  }
}
