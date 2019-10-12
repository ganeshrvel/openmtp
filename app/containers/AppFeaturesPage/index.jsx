'use strict';

import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Helmet } from 'react-helmet';
import { APP_TITLE } from '../../constants/meta';
import { resetOverFlowY } from '../../utils/styleResets';
import { styles } from './styles';
import Features from '../Onboarding/components/Features';
import WhatsNew from '../Onboarding/components/WhatsNew';
import { APP_FEATURES_PAGE_TITLE } from '../../templates/appFeaturesPage';

class AppFeaturesPage extends Component {
  componentWillMount() {
    resetOverFlowY();
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>{APP_FEATURES_PAGE_TITLE}</title>
        </Helmet>
        <div className={styles.body}>
          <Features hideTitle={false} />
          <div className={styles.marginDivider} />
          <WhatsNew hideTitle={false} />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(AppFeaturesPage);
