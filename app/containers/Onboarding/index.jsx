import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { styles } from './styles';
import { setOnboarding } from '../Settings/actions';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from '../Alerts/reducers';
import { makeFreshInstall, makeOnboarding } from '../Settings/selectors';
import WhatsNew from './components/WhatsNew';
import Features from './components/Features';
import { latestUpdatePushVersion } from '../../constants/onboarding';

class Onboarding extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fireOnboarding: false,
    };
  }

  componentDidMount() {
    const { onboarding } = this.props;
    const { lastFiredVersion } = onboarding;

    this.setState({
      fireOnboarding: latestUpdatePushVersion !== lastFiredVersion,
    });
  }

  _handleClose = () => {
    const { actionCreateOnboarding } = this.props;

    this.setState({
      fireOnboarding: false,
    });

    actionCreateOnboarding({ lastFiredVersion: latestUpdatePushVersion });
  };

  render() {
    const { classes: styles } = this.props;
    const { fireOnboarding } = this.state;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        className={styles.root}
        fullWidth
        maxWidth="md"
        scroll="paper"
        aria-labelledby="onboaring-dialogbox"
        onClose={() => this._handleClose()}
        open={fireOnboarding}
      >
        <DialogTitle>Release at a Glance!</DialogTitle>
        <DialogContent>
          <div className={styles.contentBox}>
            <WhatsNew hideTitle={false} />
            <Divider className={styles.divider} />
            <Features hideTitle={false} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this._handleClose()}
            color="primary"
            className={styles.btnPositive}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapDispatchToProps = (dispatch, __) =>
  bindActionCreators(
    {
      actionCreateOnboarding:
        ({ ...data }) =>
        (_, getState) => {
          dispatch(setOnboarding({ ...data }, getState));
        },
    },
    dispatch
  );

const mapStateToProps = (state, __) => {
  return {
    onboarding: makeOnboarding(state),
    freshInstall: makeFreshInstall(state),
  };
};

export default withReducer(
  'App',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Onboarding)));
