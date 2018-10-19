import React, { Component } from 'react';
import { styles } from './styles';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withReducer } from '../../store/reducers/withReducer';
import reducers from './reducers';
import { makeToggleSettings, makeHideHiddenFiles } from './selectors';
import { hideHiddenFiles, toggleSettings } from './actions';
import { deviceTypeConst } from '../../constants';
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

  render() {
    const { toggleSettings, hideHiddenFiles } = this.props;
    const hideHiddenFilesLocal = hideHiddenFiles[deviceTypeConst.local];
    const hideHiddenFilesMtp = hideHiddenFiles[deviceTypeConst.mtp];

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
              <FormLabel component="legend">Show Hidden Files</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!hideHiddenFilesLocal}
                      onChange={event =>
                        this.handleHiddenFilesChange(
                          {
                            toggle: !hideHiddenFilesLocal
                          },
                          deviceTypeConst.local
                        )
                      }
                    />
                  }
                  label="Desktop"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!hideHiddenFilesMtp}
                      onChange={event =>
                        this.handleHiddenFilesChange(
                          {
                            toggle: !hideHiddenFilesMtp
                          },
                          deviceTypeConst.mtp
                        )
                      }
                    />
                  }
                  label="MTP Device"
                />
              </FormGroup>
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
        dispatch(hideHiddenFiles({ ...data }, deviceType));
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
