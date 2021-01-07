import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Helmet } from 'react-helmet';
import { APP_TITLE } from '../../constants/meta';
import { resetOverFlowY } from '../../utils/styleResets';
import { styles } from './styles';
import {
  FAQS_PAGE_TITLE,
  HELP_PHONE_IS_NOT_CONNECTING,
} from '../../templates/helpFaqsPage';
import HelpPhoneNotRecognized from './components/HelpPhoneNotRecognized';

class FaqsPage extends Component {
  componentWillMount() {
    resetOverFlowY();
  }

  render() {
    const { classes: styles, showPhoneNotRecognizedNote } = this.props;

    const title = showPhoneNotRecognizedNote
      ? HELP_PHONE_IS_NOT_CONNECTING
      : FAQS_PAGE_TITLE;

    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>{title}</title>
        </Helmet>
        <Typography variant="h5" className={styles.heading}>
          {title}
        </Typography>
        <div className={styles.body}>
          <HelpPhoneNotRecognized
            showPhoneNotRecognizedNote={showPhoneNotRecognizedNote}
          />
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
)(withStyles(styles)(FaqsPage));
