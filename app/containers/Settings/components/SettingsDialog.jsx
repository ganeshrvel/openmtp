'use strict';

import React, { PureComponent } from 'react';
import electronIs from 'electron-is';
import classNames from 'classnames';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { privacyPolicyWindow } from '../../../utils/createWindows';
import { DEVICES_LABEL, DEVICES_TYPE_CONST } from '../../../constants';
import SettingsDialogTabContainer from './SettingsDialogTabContainer';

const isMas = electronIs.mas();

export default class SettingsDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0
    };

    this.isMasHidePosition = 1;
  }

  _handleTabChange = (event, index) => {
    this.setState({
      tabIndex: index
    });
  };

  shoudThisTabHeadRender = position => {
    return !(isMas && this.isMasHidePosition === position);
  };

  tabBodyRenderTabIndex = position => {
    if (isMas && this.isMasHidePosition === position) {
      return null;
    }

    if (isMas && position > this.isMasHidePosition) {
      return position - 1 < 1 ? 0 : position - 1;
    }

    return position;
  };

  render() {
    const {
      open,
      freshInstall,
      hideHiddenFiles,
      fileExplorerListingType,
      styles,
      enableAutoUpdateCheck,
      enableBackgroundAutoUpdate,
      enablePrereleaseUpdates,
      enableAnalytics,
      enableStatusBar,
      onAnalyticsChange,
      onHiddenFilesChange,
      onFileExplorerListingType,
      onDialogBoxCloseBtnClick,
      onAutoUpdateCheckChange,
      onEnableBackgroundAutoUpdateChange,
      onPrereleaseUpdatesChange,
      onStatusBarChange
    } = this.props;

    const { tabIndex } = this.state;

    const hideHiddenFilesLocal = hideHiddenFiles[DEVICES_TYPE_CONST.local];
    const hideHiddenFilesMtp = hideHiddenFiles[DEVICES_TYPE_CONST.mtp];

    const fileExplorerListingTypeLocalGrid =
      fileExplorerListingType[DEVICES_TYPE_CONST.local] === 'grid';
    const fileExplorerListingTypeMtpGrid =
      fileExplorerListingType[DEVICES_TYPE_CONST.mtp] === 'grid';

    return (
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        aria-labelledby="settings-dialogbox"
        disableEscapeKeyDown={false}
        onEscapeKeyDown={() =>
          onDialogBoxCloseBtnClick({
            confirm: false
          })
        }
      >
        <Typography variant="h5" className={styles.title}>
          Settings
        </Typography>
        <DialogContent>
          <Tabs
            className={styles.tabHeadingWrapper}
            value={tabIndex}
            onChange={this._handleTabChange}
            indicatorColor="secondary"
            textColor="secondary"
            variant="fullWidth"
          >
            {this.shoudThisTabHeadRender(0) && <Tab label="File Manager" />}
            {this.shoudThisTabHeadRender(1) && <Tab label="Software Updates" />}
            {this.shoudThisTabHeadRender(2) && <Tab label="Privacy" />}
          </Tabs>
          <FormControl component="fieldset" className={styles.fieldset}>
            {tabIndex === this.tabBodyRenderTabIndex(0) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      Show hidden files
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={!hideHiddenFilesLocal}
                          onChange={() =>
                            onHiddenFilesChange(
                              { toggle: !hideHiddenFilesLocal },
                              DEVICES_TYPE_CONST.local
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICES_TYPE_CONST.local]}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={!hideHiddenFilesMtp}
                          onChange={() =>
                            onHiddenFilesChange(
                              { toggle: !hideHiddenFilesMtp },
                              DEVICES_TYPE_CONST.mtp
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      View As Grid
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={fileExplorerListingTypeLocalGrid}
                          onChange={() =>
                            onFileExplorerListingType(
                              {
                                type: fileExplorerListingTypeLocalGrid
                                  ? 'list'
                                  : 'grid'
                              },
                              DEVICES_TYPE_CONST.local
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICES_TYPE_CONST.local]}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={fileExplorerListingTypeMtpGrid}
                          onChange={() =>
                            onFileExplorerListingType(
                              {
                                type: fileExplorerListingTypeMtpGrid
                                  ? 'list'
                                  : 'grid'
                              },
                              DEVICES_TYPE_CONST.mtp
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      Show Status Bar
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableStatusBar}
                          onChange={() =>
                            onStatusBarChange({
                              toggle: !enableStatusBar
                            })
                          }
                        />
                      }
                      label={enableStatusBar ? `Enabled` : `Disabled`}
                    />

                    {freshInstall ? (
                      <Paper
                        className={`${styles.onboardingPaper}`}
                        elevation={0}
                      >
                        <div className={styles.onboardingPaperArrow} />
                        <Typography
                          component="p"
                          className={`${styles.onboardingPaperBody}`}
                        >
                          Use the toggles to enable or disable them.
                        </Typography>
                      </Paper>
                    ) : null}
                  </FormGroup>
                </div>
              </SettingsDialogTabContainer>
            )}
            {tabIndex === this.tabBodyRenderTabIndex(1) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      Automatically check for updates
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableAutoUpdateCheck}
                          onChange={() =>
                            onAutoUpdateCheckChange({
                              toggle: !enableAutoUpdateCheck
                            })
                          }
                        />
                      }
                      label={enableAutoUpdateCheck ? `Enabled` : `Disabled`}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      Automatically download the new updates when available
                      (recommended)
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableBackgroundAutoUpdate}
                          disabled={!enableAutoUpdateCheck}
                          onChange={() =>
                            onEnableBackgroundAutoUpdateChange({
                              toggle: !enableBackgroundAutoUpdate
                            })
                          }
                        />
                      }
                      label={
                        enableBackgroundAutoUpdate ? `Enabled` : `Disabled`
                      }
                    />
                  </FormGroup>

                  <FormGroup>
                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.subtitleMarginFix}`}
                    >
                      Enable beta update channel
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enablePrereleaseUpdates}
                          onChange={() =>
                            onPrereleaseUpdatesChange({
                              toggle: !enablePrereleaseUpdates
                            })
                          }
                        />
                      }
                      label={enablePrereleaseUpdates ? `Enabled` : `Disabled`}
                    />
                  </FormGroup>
                  <Typography variant="caption">
                    Early access preview of the upcoming features but might
                    result in crashes.
                  </Typography>
                </div>
              </SettingsDialogTabContainer>
            )}
            {tabIndex === this.tabBodyRenderTabIndex(2) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      Enable anonymous usage statistics gathering
                    </Typography>

                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableAnalytics}
                          onChange={() =>
                            onAnalyticsChange({
                              toggle: !enableAnalytics
                            })
                          }
                        />
                      }
                      label={enableAnalytics ? `Enabled` : `Disabled`}
                    />
                    <Typography variant="caption">
                      We do not gather any kind of personal information and
                      neither do we sell your data. We use this information only
                      to improve the User Experience and squash some bugs.&nbsp;
                      <a
                        className={styles.a}
                        onClick={() => {
                          privacyPolicyWindow(true);
                        }}
                      >
                        Learn more...
                      </a>
                    </Typography>
                  </FormGroup>
                </div>
              </SettingsDialogTabContainer>
            )}
          </FormControl>

          <FormControl component="fieldset" className={styles.fieldset} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              onDialogBoxCloseBtnClick({
                confirm: false
              })
            }
            color="primary"
            className={classNames(styles.btnPositive)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
