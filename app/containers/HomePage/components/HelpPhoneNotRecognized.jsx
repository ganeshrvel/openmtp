import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import CachedIcon from '@material-ui/icons/Cached';
import UsbIcon from '@material-ui/icons/Usb';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import LockOpenIcon from '@material-ui/icons/Lock';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { styles } from '../styles/HelpPhoneNotRecognized';
import { openExternalUrl } from '../../../utils/url';
import { APP_GITHUB_ISSUES_URL } from '../../../constants/meta';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import { DEVICES_LABEL } from '../../../constants';
import { DEVICE_TYPE } from '../../../enums';
import { mtpErrors } from '../../../helpers/processBufferOutput';
import { MTP_ERROR } from '../../../enums/mtpError';
import { imgsrc } from '../../../utils/imgsrc';

const hotplugSettingText = `Check if 'Enable auto device detection (USB Hotplug)' is enabled under Settings > General Tab`;
const deviceLabel = DEVICES_LABEL[DEVICE_TYPE.mtp];

class HelpPhoneNotRecognized extends PureComponent {
  _handleGithubThreadTap = (events) => {
    openExternalUrl(`${APP_GITHUB_ISSUES_URL}8`, events);

    analyticsService.sendEvent(
      EVENT_TYPE.MTP_HELP_PHONE_NOT_CONNECTED_GITHUB_THREAD_TAP,
      {}
    );
  };

  RenderFileTransfer = () => {
    const { classes: styles } = this.props;

    return (
      <>
        <ListItem>
          <ListItemIcon>
            <TouchAppIcon />
          </ListItemIcon>
          <ListItemText
            primary="On your device, tap the 'Charging this device via
                  USB' notification"
            secondary={
              <>
                <img
                  src={imgsrc(`help/usb-notification-charging-via-usb.png`)}
                  alt="Use USB for"
                  className={styles.imagePlaceholder}
                />
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <RadioButtonCheckedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Under 'Use USB for' select File Transfer"
            secondary={
              <>
                <img
                  src={imgsrc(`help/transfer-media-permission.png`)}
                  alt="Allow access to the device data"
                  className={styles.imagePlaceholder}
                />
              </>
            }
          />
        </ListItem>
      </>
    );
  };

  RenderRefreshButtonIsStuck = () => {
    const { classes: styles } = this.props;

    const { RenderFileTransfer } = this;

    return (
      <>
        <ListItem>
          <ListItemIcon>
            <LockOpenIcon />
          </ListItemIcon>
          <ListItemText primary="Unlock your Android device" />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <UsbIcon />
          </ListItemIcon>
          <ListItemText
            primary={`Unplug your ${deviceLabel.toLowerCase()} and reconnect it`}
            secondary={`Follow the instructions below if your ${deviceLabel.toLowerCase()} is still undetected`}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <TouchAppIcon />
          </ListItemIcon>
          <ListItemText
            primary="On your device, tap the 'Transferring media files' notification"
            secondary={
              <>
                <img
                  src={imgsrc(`help/usb-notification-transferring-media.png`)}
                  alt="Transferring media files"
                  className={styles.imagePlaceholder}
                />
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <RadioButtonCheckedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Under 'Use USB for' select 'Charging'"
            secondary={
              <>
                <img
                  src={imgsrc(`help/charge-only-permission.png`)}
                  alt="Charging"
                  className={styles.imagePlaceholder}
                />
              </>
            }
          />
        </ListItem>

        <RenderFileTransfer />

        <ListItem>
          <ListItemIcon>
            <FiberManualRecordIcon />
          </ListItemIcon>
          <ListItemText
            primary="It should connect automatically"
            secondary={hotplugSettingText}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CachedIcon />
          </ListItemIcon>
          <ListItemText
            primary={`Tap on the 'Refresh' button in the app if the ${deviceLabel.toLowerCase()} doesn't get connected automatically`}
            secondary={hotplugSettingText}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <TouchAppIcon />
          </ListItemIcon>
          <ListItemText
            primary={`Tap on the "Allow" button, if you see the "Allow access to the device data" pop up`}
            secondary={
              <>
                <img
                  src={imgsrc(`help/allow-data-access.png`)}
                  alt="Allow access to the device data"
                  className={styles.imagePlaceholder}
                />
              </>
            }
          />
        </ListItem>
      </>
    );
  };

  RenderBasicConnection = ({
    showUnplugPhone = true,
    showUnlockPhone = true,
  }) => {
    const { RenderFileTransfer } = this;

    return (
      <>
        {showUnlockPhone && (
          <ListItem>
            <ListItemIcon>
              <LockOpenIcon />
            </ListItemIcon>
            <ListItemText primary="Unlock your Android device" />
          </ListItem>
        )}

        {showUnplugPhone && (
          <ListItem>
            <ListItemIcon>
              <UsbIcon />
            </ListItemIcon>
            <ListItemText
              primary={`Unplug your ${deviceLabel.toLowerCase()} and reconnect it`}
            />
          </ListItem>
        )}

        <RenderFileTransfer />

        <ListItem>
          <ListItemIcon>
            <FiberManualRecordIcon />
          </ListItemIcon>
          <ListItemText
            primary="It should connect automatically"
            secondary={hotplugSettingText}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CachedIcon />
          </ListItemIcon>
          <ListItemText
            primary={`Tap on the 'Refresh' button in the app if the ${deviceLabel.toLowerCase()} doesn't get connected automatically`}
            secondary={hotplugSettingText}
          />
        </ListItem>
      </>
    );
  };

  render() {
    const { classes: styles } = this.props;
    const { RenderBasicConnection, RenderRefreshButtonIsStuck } = this;

    return (
      <div className={styles.root}>
        <Paper elevation={0}>
          <Accordion className={styles.expansionRoot}>
            {/* <----- my device is not connecting -----> */}

            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`My ${deviceLabel.toLowerCase()} is not connecting`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List component="div" disablePadding>
                <RenderBasicConnection />
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- i keep seeing setting up device -----> */}

          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`I keep seeing "${mtpErrors[[MTP_ERROR.ErrorDeviceSetup]]}"`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List component="div" disablePadding>
                <RenderBasicConnection />
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- i keep seeing allow storage access -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`I keep seeing "${
                  mtpErrors[[MTP_ERROR.ErrorAllowStorageAccess]]
                }"`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <LockOpenIcon />
                  </ListItemIcon>
                  <ListItemText primary="Unlock your Android device" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TouchAppIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Tap on the "Allow" button, if you see the "Allow access to the device data" pop up`}
                    secondary={
                      <>
                        <img
                          src={imgsrc(`help/allow-data-access.png`)}
                          alt="Allow access to the device data"
                          className={styles.imagePlaceholder}
                        />
                      </>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FiberManualRecordIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`If you don't see the "Allow access to the device data" pop up then reconnect your ${deviceLabel.toLowerCase()}`}
                    secondary={`Follow the instructions below if your ${deviceLabel.toLowerCase()} is still undetected`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <FiberManualRecordIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`If you are prompted to "Allow access to the device data" multiple times then reconnect your ${deviceLabel.toLowerCase()} and try again`}
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- Allow access to the device data" multiple times -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`I am prompted to "Allow access to the device data" multiple times`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <RenderRefreshButtonIsStuck />
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- refresh button is stuck -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`Refresh button is stuck`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <RenderRefreshButtonIsStuck />
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- i keep seeing multiple devices error -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`I keep seeing "${
                  mtpErrors[[MTP_ERROR.ErrorMultipleDevice]]
                }"`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <FiberManualRecordIcon />
                  </ListItemIcon>
                  <ListItemText primary="Unplug all your MTP devices" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <UsbIcon />
                  </ListItemIcon>
                  <ListItemText primary="Plug your MTP devices" />
                </ListItem>

                <RenderBasicConnection showUnplugPhone={false} />
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- phone gets disconnected everytime screen goes into sleep -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`My ${deviceLabel.toLowerCase()} gets disconnected everytime the display goes into sleep`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <FiberManualRecordIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`In a very rare case your ${deviceLabel.toLowerCase()} may get disconnected when your display goes into sleep. This may disrupt any active file transfers`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <LockOpenIcon />
                  </ListItemIcon>
                  <ListItemText primary="Unlock your Android device" />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <RadioButtonCheckedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Open ${deviceLabel.toLowerCase()}'s Settings > Display > Sleep and set it as 30 minutes or whatever is the highest`}
                    secondary={
                      <>
                        <img
                          src={imgsrc(`help/sleep-setting.jpg`)}
                          alt="Sleep settings"
                          className={styles.imagePlaceholder}
                        />
                      </>
                    }
                  />
                </ListItem>

                <RenderBasicConnection showUnlockPhone={false} />
              </List>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(HelpPhoneNotRecognized);
