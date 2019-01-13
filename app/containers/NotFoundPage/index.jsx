'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { routes } from '../../routing';
import styles from './styles/index.scss';
import { APP_TITLE } from '../../constants/meta';

export default class NotFound extends Component {
  render() {
    return (
      <React.Fragment>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>Resource not found!</title>
        </Helmet>
        <div className={styles.container}>
          <h1>Resource not found!</h1>
          <Link to={routes.Home.path}>Go back</Link>
        </div>
      </React.Fragment>
    );
  }
}
