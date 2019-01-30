'use strict';

import React, { PureComponent, Fragment } from 'react';

export default class SettingsDialogTabContainer extends PureComponent {
  render() {
    const { children } = this.props;
    return <Fragment>{children}</Fragment>;
  }
}
