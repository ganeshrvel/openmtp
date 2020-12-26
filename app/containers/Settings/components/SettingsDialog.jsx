import React, { PureComponent } from 'react';
import electronIs from 'electron-is';
import classNames from 'classnames';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { privacyPolicyWindow } from '../../../helpers/createWindows';
import { DEVICES_LABEL } from '../../../constants';
import SettingsDialogTabContainer from './SettingsDialogTabContainer';
import {
  DEVICE_TYPE,
  FILE_EXPLORER_VIEW_TYPE,
  APP_THEME_MODE_TYPE,
  MTP_MODE,
  FILE_TRANSFER_DIRECTION,
} from '../../../enums';
import { capitalize, isPrereleaseVersion } from '../../../utils/funcs';

const isMas = electronIs.mas();

export default class SettingsDialog extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
    };

    this.isMasHidePosition = 1;
  }

  _handleTabChange = (event, index) => {
    this.setState({
      tabIndex: index,
    });
  };

  shoudThisTabHeadRender = (position) => {
    return !(isMas && this.isMasHidePosition === position);
  };

  tabBodyRenderTabIndex = (position) => {
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
      appThemeMode,
      styles,
      enableAutoUpdateCheck,
      enableBackgroundAutoUpdate,
      enablePrereleaseUpdates,
      enableAnalytics,
      enableStatusBar,
      showLocalPane,
      showLocalPaneOnLeftSide,
      showDirectoriesFirst,
      mtpMode,
      filesPreprocessingBeforeTransfer,
      onAnalyticsChange,
      onHiddenFilesChange,
      onFileExplorerListingType,
      onDialogBoxCloseBtnClick,
      onAutoUpdateCheckChange,
      onEnableBackgroundAutoUpdateChange,
      onPrereleaseUpdatesChange,
      onStatusBarChange,
      onAppThemeModeChange,
      onShowLocalPaneChange,
      onShowLocalPaneOnLeftSideChange,
      onShowDirectoriesFirstChange,
      onMtpModeChange,
      onFilesPreprocessingBeforeTransferChange,
      onEnableUsbHotplug,
      enableUsbHotplug,
    } = this.props;

    const { tabIndex } = this.state;

    const hideHiddenFilesLocal = hideHiddenFiles[DEVICE_TYPE.local];
    const hideHiddenFilesMtp = hideHiddenFiles[DEVICE_TYPE.mtp];

    const fileExplorerListingTypeLocalGrid =
      fileExplorerListingType[DEVICE_TYPE.local] ===
      FILE_EXPLORER_VIEW_TYPE.grid;
    const fileExplorerListingTypeMtpGrid =
      fileExplorerListingType[DEVICE_TYPE.mtp] === FILE_EXPLORER_VIEW_TYPE.grid;

    return (
      <Dialog
        open={open}
        fullWidth
        maxWidth="sm"
        aria-labelledby="settings-dialogbox"
        disableEscapeKeyDown={false}
        onEscapeKeyDown={() =>
          onDialogBoxCloseBtnClick({
            confirm: false,
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
            variant="scrollable"
            scrollButtons="auto"
          >
            {this.shoudThisTabHeadRender(0) && (
              <Tab label="General" className={styles.tab} />
            )}
            {this.shoudThisTabHeadRender(1) && (
              <Tab label="File Manager" className={styles.tab} />
            )}
            {this.shoudThisTabHeadRender(2) && (
              <Tab label="Updates" className={styles.tab} />
            )}
            {this.shoudThisTabHeadRender(3) && (
              <Tab label="Privacy" className={styles.tab} />
            )}
          </Tabs>

          {/* ----- General Tab ----- */}
          <FormControl component="fieldset" className={styles.fieldset}>
            {tabIndex === this.tabBodyRenderTabIndex(0) && (
              <SettingsDialogTabContainer>
                <div className={styles.tabContainer}>
                  <FormGroup>
                    <Typography variant="subtitle2" className={styles.subtitle}>
                      Theme
                    </Typography>
                    <RadioGroup
                      aria-label="app-theme-mode"
                      name="app-theme-mode"
                      value={appThemeMode}
                      onChange={onAppThemeModeChange}
                    >
                      <FormControlLabel
                        value={APP_THEME_MODE_TYPE.light}
                        control={<Radio />}
                        label="Light"
                      />
                      <FormControlLabel
                        value={APP_THEME_MODE_TYPE.dark}
                        control={<Radio />}
                        label="Dark"
                      />
                      <FormControlLabel
                        value={APP_THEME_MODE_TYPE.auto}
                        control={<Radio />}
                        label="Auto"
                      />
                    </RadioGroup>

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle}  ${styles.fmSettingsStylesFix}`}
                    >
                      MTP Mode
                    </Typography>
                    <RadioGroup
                      aria-label="app-theme-mode"
                      name="app-theme-mode"
                      value={mtpMode}
                      onChange={(e, value) =>
                        onMtpModeChange(e, value, DEVICE_TYPE.mtp)
                      }
                    >
                      <FormControlLabel
                        value={MTP_MODE.kalam}
                        control={<Radio />}
                        label={capitalize(MTP_MODE.kalam)}
                      />
                      <FormControlLabel
                        value={MTP_MODE.legacy}
                        control={<Radio />}
                        label={capitalize(MTP_MODE.legacy)}
                      />
                    </RadioGroup>

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      Enable auto device detection (USB Hotplug)
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableUsbHotplug}
                          onChange={(e) =>
                            onEnableUsbHotplug(e, !enableUsbHotplug)
                          }
                        />
                      }
                      label={enableUsbHotplug ? `Enabled` : `Disabled`}
                    />
                  </FormGroup>
                </div>
              </SettingsDialogTabContainer>
            )}

            {/* ----- File Manager Tab ----- */}
            {tabIndex === this.tabBodyRenderTabIndex(1) && (
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
                          onChange={(e) =>
                            onHiddenFilesChange(
                              e,
                              !hideHiddenFilesLocal,
                              DEVICE_TYPE.local
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICE_TYPE.local]}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={!hideHiddenFilesMtp}
                          onChange={(e) =>
                            onHiddenFilesChange(
                              e,
                              !hideHiddenFilesMtp,
                              DEVICE_TYPE.mtp
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICE_TYPE.mtp]}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      View as grid
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={fileExplorerListingTypeLocalGrid}
                          onChange={(e) =>
                            onFileExplorerListingType(
                              e,
                              fileExplorerListingTypeLocalGrid
                                ? FILE_EXPLORER_VIEW_TYPE.list
                                : FILE_EXPLORER_VIEW_TYPE.grid,
                              DEVICE_TYPE.local
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICE_TYPE.local]}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={fileExplorerListingTypeMtpGrid}
                          onChange={(e) =>
                            onFileExplorerListingType(
                              e,
                              fileExplorerListingTypeMtpGrid
                                ? FILE_EXPLORER_VIEW_TYPE.list
                                : FILE_EXPLORER_VIEW_TYPE.grid,
                              DEVICE_TYPE.mtp
                            )
                          }
                        />
                      }
                      label={DEVICES_LABEL[DEVICE_TYPE.mtp]}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      Display overall progress on the file transfer screen
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={
                            filesPreprocessingBeforeTransfer[
                              FILE_TRANSFER_DIRECTION.download
                            ]
                          }
                          onChange={(e) =>
                            onFilesPreprocessingBeforeTransferChange(
                              e,
                              !filesPreprocessingBeforeTransfer[
                                FILE_TRANSFER_DIRECTION.download
                              ],
                              FILE_TRANSFER_DIRECTION.download
                            )
                          }
                        />
                      }
                      label={`To ${DEVICES_LABEL[DEVICE_TYPE.local]}`}
                    />
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={
                            filesPreprocessingBeforeTransfer[
                              FILE_TRANSFER_DIRECTION.upload
                            ]
                          }
                          onChange={(e) =>
                            onFilesPreprocessingBeforeTransferChange(
                              e,
                              !filesPreprocessingBeforeTransfer[
                                FILE_TRANSFER_DIRECTION.upload
                              ],
                              FILE_TRANSFER_DIRECTION.upload
                            )
                          }
                        />
                      }
                      label={`To ${DEVICES_LABEL[DEVICE_TYPE.mtp]}`}
                    />

                    {freshInstall ? (
                      <Paper
                        className={`${styles.onboardingPaper}`}
                        elevation={0}
                      >
                        <Typography
                          component="p"
                          className={`${styles.onboardingPaperBody}`}
                        >
                          <span className={`${styles.onboardingPaperBodyItem}`}>
                            &#9679;&nbsp;Use the toggles to enable or disable an
                            item.
                          </span>
                          <span className={`${styles.onboardingPaperBodyItem}`}>
                            &#9679;&nbsp;Scroll down for more Settings.
                          </span>
                        </Typography>
                      </Paper>
                    ) : null}

                    <Typography variant="caption">
                      Note: To fetch the total transfer information, the files
                      need to be processed first. It may take a few seconds to a
                      few minutes depending on the total number of files to be
                      copied.
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      Show directories first
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={showDirectoriesFirst}
                          onChange={(e) =>
                            onShowDirectoriesFirstChange(
                              e,
                              !showDirectoriesFirst
                            )
                          }
                        />
                      }
                      label={showDirectoriesFirst ? `Enabled` : `Disabled`}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      Show status bar
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={enableStatusBar}
                          onChange={(e) =>
                            onStatusBarChange(e, !enableStatusBar)
                          }
                        />
                      }
                      label={enableStatusBar ? `Enabled` : `Disabled`}
                    />

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      Show Local Disk pane
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={showLocalPane}
                          onChange={(e) =>
                            onShowLocalPaneChange(e, !showLocalPane)
                          }
                        />
                      }
                      label={showLocalPane ? `Enabled` : `Disabled`}
                    />
                    <Typography variant="caption">
                      Note: You can drag files from the Finder into the Mobile
                      pane but not the other way around.
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      className={`${styles.subtitle} ${styles.fmSettingsStylesFix}`}
                    >
                      Show Local Disk pane on the left side
                    </Typography>
                    <FormControlLabel
                      className={styles.switch}
                      control={
                        <Switch
                          checked={showLocalPaneOnLeftSide}
                          onChange={(e) =>
                            onShowLocalPaneOnLeftSideChange(
                              e,
                              !showLocalPaneOnLeftSide
                            )
                          }
                        />
                      }
                      label={showLocalPaneOnLeftSide ? `Enabled` : `Disabled`}
                    />
                  </FormGroup>
                </div>
              </SettingsDialogTabContainer>
            )}

            {/* ----- Updates Tab ----- */}

            {tabIndex === this.tabBodyRenderTabIndex(2) && (
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
                          onChange={(e) =>
                            onAutoUpdateCheckChange(e, !enableAutoUpdateCheck)
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
                          onChange={(e) =>
                            onEnableBackgroundAutoUpdateChange(
                              e,
                              !enableBackgroundAutoUpdate
                            )
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
                          disabled={isPrereleaseVersion()}
                          onChange={(e) =>
                            onPrereleaseUpdatesChange(
                              e,
                              !enablePrereleaseUpdates
                            )
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

            {/* ----- Privacy Tab ----- */}

            {tabIndex === this.tabBodyRenderTabIndex(3) && (
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
                          onChange={(e) =>
                            onAnalyticsChange(e, !enableAnalytics)
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
                confirm: false,
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
