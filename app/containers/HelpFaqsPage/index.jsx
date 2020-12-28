import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet } from 'react-helmet';
import { APP_TITLE } from '../../constants/meta';
import { resetOverFlowY } from '../../utils/styleResets';
import { styles } from './styles';
import { HELP_FAQS_PAGE_TITLE } from '../../templates/helpFaqsPage';
import HelpPhoneNotRecognized from './components/HelpPhoneNotRecognized';
import { helpPhoneNotConnecting } from '../../templates/fileExplorer';

class HelpFaqsPage extends Component {
  componentWillMount() {
    resetOverFlowY();
  }

  render() {
    const { classes: styles } = this.props;

    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>{HELP_FAQS_PAGE_TITLE}</title>
        </Helmet>
        <Typography variant="h5" className={styles.heading}>
          {helpPhoneNotConnecting}
        </Typography>
        <div className={styles.body}>
          <HelpPhoneNotRecognized />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, __) => bindActionCreators({}, dispatch);

const mapStateToProps = (_, __) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(HelpFaqsPage));
