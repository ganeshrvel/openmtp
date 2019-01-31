import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import semver from 'semver';
import { styles } from './styles';
import { setOnboarding } from '../Settings/actions';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from '../Alerts/reducers';
import { makeFreshInstall, makeOnboarding } from '../Settings/selectors';
import { APP_VERSION } from '../../constants/meta';
import { undefinedOrNull } from '../../utils/funcs';
import WhatsNew from './components/WhatsNew';
import Features from './components/Features';

class Onboarding extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      fireOnboarding: false
    };
  }

  componentDidMount() {
    const { onboarding } = this.props;
    const { lastFiredVersion } = onboarding;

    this.setState({
      fireOnboarding:
        undefinedOrNull(lastFiredVersion) ||
        semver.lt(lastFiredVersion, APP_VERSION)
    });
  }

  _handleClose = () => {
    const { actionCreateOnboarding } = this.props;
    this.setState({
      fireOnboarding: false
    });

    actionCreateOnboarding({ lastFiredVersion: APP_VERSION });
  };

  render() {
    const { classes: styles, freshInstall } = this.props;
    const { fireOnboarding } = this.state;

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        className={styles.root}
        fullWidth
        maxWidth="lg"
        scroll="paper"
        aria-labelledby="onboaring-dialogbox"
        onClose={() => this._handleClose()}
        open={true || fireOnboarding}
      >
        {/* todo: fix me ^ */}
        <DialogTitle>Hiya!</DialogTitle>
        <DialogContent>
          <div>
            {freshInstall ? (
              <Fragment>
                <Features />
                <Divider className={styles.divider} />
                <WhatsNew />
              </Fragment>
            ) : null}
            {!freshInstall ? (
              <Fragment>
                <WhatsNew />
                <Divider className={styles.divider} />
                <Features />
              </Fragment>
            ) : null}
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

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      actionCreateOnboarding: ({ ...data }) => (_, getState) => {
        dispatch(setOnboarding({ ...data }, getState));
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    onboarding: makeOnboarding(state),
    freshInstall: makeFreshInstall(state)
  };
};

export default withReducer('App', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Onboarding))
);
