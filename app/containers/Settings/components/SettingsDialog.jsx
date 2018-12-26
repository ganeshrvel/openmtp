'use strict';

import React, { PureComponent } from 'react';
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
import { DEVICES_TYPE_CONST } from '../../../constants';

export class SettingsDialog extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      freshInstall,
      hideHiddenFiles,
      styles,
      enableAutoUpdateCheck,
      enableAnalytics,
      handleAnalytics,
      handleHiddenFilesChange,
      handleClick,
      handleAutoUpdateCheckChange
    } = this.props;
    const hideHiddenFilesLocal = hideHiddenFiles[DEVICES_TYPE_CONST.local];
    const hideHiddenFilesMtp = hideHiddenFiles[DEVICES_TYPE_CONST.mtp];

    return (
      <Dialog
        open={true}
        fullWidth={true}
        maxWidth={'sm'}
        aria-labelledby="settings-dialogbox"
      >
        <Typography variant="h5" className={styles.title}>
          Settings
        </Typography>
        <DialogContent>
          <FormControl component="fieldset" className={styles.fieldset}>
            <div className={styles.block}>
              <Typography variant="body1" className={styles.subheading}>
                General Settings
              </Typography>
              <FormGroup>
                <Typography variant="subtitle2" className={styles.subtitle}>
                  Enable auto-update check
                </Typography>

                <FormControlLabel
                  className={styles.switch}
                  control={
                    <Switch
                      checked={enableAutoUpdateCheck}
                      onChange={event =>
                        handleAutoUpdateCheckChange({
                          toggle: !enableAutoUpdateCheck
                        })
                      }
                    />
                  }
                  label={enableAutoUpdateCheck ? `Enabled` : `Disabled`}
                />
              </FormGroup>
              <FormGroup className={styles.formGroup}>
                <Typography variant="subtitle2" className={styles.subtitle}>
                  Enable anonymous usage statistics gathering
                </Typography>

                <FormControlLabel
                  className={styles.switch}
                  control={
                    <Switch
                      checked={enableAnalytics}
                      onChange={event =>
                        handleAnalytics({
                          toggle: !enableAnalytics
                        })
                      }
                    />
                  }
                  label={enableAnalytics ? `Enabled` : `Disabled`}
                />
                {freshInstall ? (
                  <Paper className={`${styles.onBoardingPaper}`} elevation={0}>
                    <div className={styles.onBoardingPaperArrow} />
                    <Typography
                      component="p"
                      className={`${styles.onBoardingPaperBody}`}
                    >
                      Choose your privacy settings. Use the toggles above to
                      enable or disable them.
                    </Typography>
                  </Paper>
                ) : null}
                <Typography variant="caption">
                  We do not gather any kind of personal information and neither
                  do we sell your data. We use this information only to improve
                  the User Experience and squash some bugs.&nbsp;
                  <a
                    className={styles.a}
                    onClick={event => {
                      privacyPolicyWindow(true);
                    }}
                  >
                    Learn more...
                  </a>
                </Typography>
              </FormGroup>
            </div>

            <div>
              <Typography variant="body1" className={styles.subheading}>
                File Manager Settings
              </Typography>

              <FormGroup>
                <Typography variant="subtitle2" className={styles.subtitle}>
                  Show hidden files
                </Typography>
                <FormControlLabel
                  className={styles.switch}
                  control={
                    <Switch
                      checked={!hideHiddenFilesLocal}
                      onChange={event =>
                        handleHiddenFilesChange(
                          { toggle: !hideHiddenFilesLocal },
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
                        handleHiddenFilesChange(
                          { toggle: !hideHiddenFilesMtp },
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
            onClick={e =>
              handleClick({
                confirm: false
              })
            }
            color="secondary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
