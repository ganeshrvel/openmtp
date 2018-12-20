import React, { Component } from 'react';
import { styles } from './styles';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import {
  makeToggleSettings,
  makeHideHiddenFiles,
  makeEnableAutoUpdateCheck,
  makeEnableAnalytics
} from './selectors';
import {
  enableAnalytics,
  enableAutoUpdateCheck,
  hideHiddenFiles,
  toggleSettings
} from './actions';
import { DEVICES_TYPE_CONST } from '../../constants';
import { handleReloadDirList } from '../HomePage/actions';
import {
  makeCurrentBrowsePath,
  makeMtpStoragesList
} from '../HomePage/selectors';

class Settings extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = ({ confirm = false }) => {
    this._handleToggleSettings(false);
  };

  _handleToggleSettings = confirm => {
    const { handleToggleSettings } = this.props;
    handleToggleSettings(confirm);
  };

  handleHiddenFilesChange = ({ ...args }, deviceType) => {
    const {
      handleHideHiddenFiles,
      handleReloadDirList,
      mtpStoragesList,
      currentBrowsePath
    } = this.props;
    const { toggle } = args;

    handleHideHiddenFiles({ ...args }, deviceType);
    handleReloadDirList(
      {
        filePath: currentBrowsePath[deviceType],
        ignoreHidden: toggle
      },
      deviceType,
      mtpStoragesList
    );
  };

  handleAutoUpdateCheckChange = ({ ...args }) => {
    const { handleEnableAutoUpdateCheck } = this.props;

    handleEnableAutoUpdateCheck({ ...args });
  };

  handleAnalytics = ({ ...args }) => {
    const { handleEnableAnalytics } = this.props;

    handleEnableAnalytics({ ...args });
  };

  render() {
    const {
      toggleSettings,
      hideHiddenFiles,
      classes: styles,
      enableAutoUpdateCheck,
      enableAnalytics
    } = this.props;
    const hideHiddenFilesLocal = hideHiddenFiles[DEVICES_TYPE_CONST.local];
    const hideHiddenFilesMtp = hideHiddenFiles[DEVICES_TYPE_CONST.mtp];

    if (toggleSettings) {
      return (
        <Dialog
          open={true}
          fullWidth={true}
          maxWidth={'sm'}
          aria-labelledby="settings-dialogbox"
        >
          <DialogTitle>Settings</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset">
              <div className={styles.block}>
                <Typography variant="subheading" className={styles.subheading}>
                  General Settings
                </Typography>
                <FormGroup>
                  <Typography variant="body2" className={styles.title}>
                    Enable auto-update check
                  </Typography>

                  <FormControlLabel
                    className={styles.switch}
                    control={
                      <Switch
                        checked={enableAutoUpdateCheck}
                        onChange={event =>
                          this.handleAutoUpdateCheckChange({
                            toggle: !enableAutoUpdateCheck
                          })
                        }
                      />
                    }
                    label={enableAutoUpdateCheck ? `Enabled` : `Disabled`}
                  />
                </FormGroup>
                <FormGroup className={styles.formGroup}>
                  <Typography variant="body2" className={styles.title}>
                    Enable anonymous usage statistics gathering
                  </Typography>

                  <FormControlLabel
                    className={styles.switch}
                    control={
                      <Switch
                        checked={enableAnalytics}
                        onChange={event =>
                          this.handleAnalytics({
                            toggle: !enableAnalytics
                          })
                        }
                      />
                    }
                    label={enableAnalytics ? `Enabled` : `Disabled`}
                  />
                </FormGroup>
              </div>

              <div>
                <Typography variant="subheading" className={styles.subheading}>
                  File Manager Settings
                </Typography>

                <FormGroup>
                  <Typography variant="body2" className={styles.title}>
                    Show hidden files
                  </Typography>
                  <FormControlLabel
                    className={styles.switch}
                    control={
                      <Switch
                        checked={!hideHiddenFilesLocal}
                        onChange={event =>
                          this.handleHiddenFilesChange(
                            {
                              toggle: !hideHiddenFilesLocal
                            },
                            DEVICES_TYPE_CONST.local
                          )
                        }
                      />
                    }
                    label="Desktop"
                  />
                  <FormControlLabel
                    className={styles.switch}
                    control={
                      <Switch
                        checked={!hideHiddenFilesMtp}
                        onChange={event =>
                          this.handleHiddenFilesChange(
                            {
                              toggle: !hideHiddenFilesMtp
                            },
                            DEVICES_TYPE_CONST.mtp
                          )
                        }
                      />
                    }
                    label="MTP Device"
                  />
                </FormGroup>
              </div>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={e => this.handleClick({ confirm: true })}
              color="secondary"
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      );
    }
    return <React.Fragment />;
  }
}

const mapDispatchToProps = (dispatch, ownProps) =>
  bindActionCreators(
    {
      handleToggleSettings: data => (_, getState) => {
        dispatch(toggleSettings(data));
      },

      handleHideHiddenFiles: ({ ...data }, deviceType) => (_, getState) => {
        dispatch(hideHiddenFiles({ ...data }, deviceType, getState));
      },

      handleEnableAutoUpdateCheck: ({ ...data }) => (_, getState) => {
        dispatch(enableAutoUpdateCheck({ ...data }, getState));
      },

      handleEnableAnalytics: ({ ...data }) => (_, getState) => {
        dispatch(enableAnalytics({ ...data }, getState));
      },

      handleReloadDirList: ({ ...args }, deviceType, mtpStoragesList) => (
        _,
        getState
      ) => {
        dispatch(
          handleReloadDirList(
            { ...args },
            deviceType,
            mtpStoragesList,
            getState
          )
        );
      }
    },
    dispatch
  );

const mapStateToProps = (state, props) => {
  return {
    toggleSettings: makeToggleSettings(state),
    hideHiddenFiles: makeHideHiddenFiles(state),
    enableAutoUpdateCheck: makeEnableAutoUpdateCheck(state),
    enableAnalytics: makeEnableAnalytics(state),
    currentBrowsePath: makeCurrentBrowsePath(state),
    mtpStoragesList: makeMtpStoragesList(state)
  };
};

export default withReducer('Settings', reducers)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Settings))
);
