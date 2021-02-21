import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import CheckIcon from '@material-ui/icons/Check';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SettingsIcon from '@material-ui/icons/Settings';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
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
import PowerIcon from '@material-ui/icons/Power';
import ReplayIcon from '@material-ui/icons/Replay';
import { styles } from '../styles/HelpPhoneNotRecognized';
import { openExternalUrl } from '../../../utils/url';
import {
  APP_GITHUB_ISSUES_URL,
  APP_NAME,
  APP_VERSION,
  AUTHOR_EMAIL,
} from '../../../constants/meta';
import { analyticsService } from '../../../services/analytics';
import { EVENT_TYPE } from '../../../enums/events';
import {
  BUY_ME_A_COFFEE_URL,
  DELETE_KEIS_SMARTSWITCH_URL,
  DEVICES_LABEL,
  DONATE_PAYPAL_URL,
} from '../../../constants';
import { DEVICE_TYPE } from '../../../enums';
import {
  localErrorDictionary,
  mtpErrors,
} from '../../../helpers/processBufferOutput';
import { MTP_ERROR } from '../../../enums/mtpError';
import { imgsrc } from '../../../utils/imgsrc';
import { helpPhoneNotConnecting } from '../../../templates/fileExplorer';

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
    const { classes: styles, showPhoneNotRecognizedNote } = this.props;
    const { RenderBasicConnection, RenderRefreshButtonIsStuck } = this;

    return (
      <div className={styles.root}>
        <Paper elevation={0}>
          {showPhoneNotRecognizedNote && (
            <>
              <Typography component="p" variant="body2">
                <strong>{APP_NAME}</strong> was a project that I started to
                solve a problem that was so personal to me. But I always knew,
                that there&apos;s a community, whose facing the same problem as
                I did.
              </Typography>
              <Typography component="p" variant="body2" paragraph>
                I wasn&apos;t wrong, I guess. Now, we are a strong community
                with users from over&nbsp;
                <strong>180 countries</strong>. It&apos;s overwhelming to see
                the response that I have received from all of you, not just
                appreciating the app, but also giving me suggestions and
                feedback to improve it.
              </Typography>
              <Typography component="p" variant="body2">
                As they say, you build for the community and learn from it.
              </Typography>
              <Typography component="p" variant="body2" paragraph>
                I read each and every message that you send and am constantly
                working to improve the app based on your feedback. Keep sending
                more of those :)
              </Typography>
              <Typography component="p" variant="body2" paragraph>
                Some of you have been telling me that there are issues with
                connecting certain mobile phones (<i>mostly Samsung</i>) to
                {APP_NAME}. I have been working hard to fix this issue by
                migrating the existing MTP Kernel to a better one.
              </Typography>
              <Typography component="p" variant="body2" paragraph>
                You may reach out to me at&nbsp;
                <a
                  href={`mailto:${AUTHOR_EMAIL}?Subject=${helpPhoneNotConnecting}&Body=${APP_NAME} - ${APP_VERSION}`}
                >
                  {AUTHOR_EMAIL}
                </a>
                &nbsp;or check out this&nbsp;
                <a onClick={this._handleGithubThreadTap}>thread</a>
                &nbsp;on GitHub for tracking the same,&nbsp;
                <i>
                  to collaborate and make this community bigger and stronger
                </i>
                !
              </Typography>
              <Typography component="p" variant="body2" paragraph>
                If you&apos;d like to support my work or buy me up a cup of
                coffee, donate via&nbsp;Paypal:&nbsp;
                <a
                  onClick={(events) => {
                    openExternalUrl(DONATE_PAYPAL_URL, events);
                  }}
                >
                  {DONATE_PAYPAL_URL}
                </a>
                &nbsp;or Buy me a coffee:&nbsp;
                <a
                  onClick={(events) => {
                    openExternalUrl(BUY_ME_A_COFFEE_URL, events);
                  }}
                >
                  {BUY_ME_A_COFFEE_URL}
                </a>
                .
              </Typography>
              <Typography component="p" variant="h6" paragraph>
                FAQs
              </Typography>
            </>
          )}

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

          {/* <----- The app goes blank while trying to connect a Samsung device -----> */}

          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`The app goes blank while trying to connect a Samsung device`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List component="div" disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Uninstall Samsung SmartSwitch, if installed"
                    secondary={
                      <a
                        onClick={(events) => {
                          openExternalUrl(DELETE_KEIS_SMARTSWITCH_URL, events);
                        }}
                      >
                        How to remove Samsung SmartSwitch and drivers from your
                        MacBook
                      </a>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <ReplayIcon />
                  </ListItemIcon>
                  <ListItemText primary={`Restart ${APP_NAME}`} />
                </ListItem>

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

          {/* <----- i keep seeing multiple devices error -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`I keep seeing "Quit 'Android File Transfer' app (by Google) and Refresh"`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon />
                  </ListItemIcon>
                  <ListItemText primary="Quit and uninstall Google's 'Android File Transfer' app" />
                </ListItem>

                <RenderBasicConnection showUnplugPhone={false} />
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- my phone is still not detected -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`My phone is still not connecting`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Uninstall Samsung SmartSwitch, if installed"
                    secondary={
                      <a
                        onClick={(events) => {
                          openExternalUrl(DELETE_KEIS_SMARTSWITCH_URL, events);
                        }}
                      >
                        How to remove Samsung SmartSwitch and drivers from your
                        MacBook
                      </a>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <PowerIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Try changing the MTP mode"
                    secondary={`Settings > Tab > Change the "MTP Mode"`}
                  />
                </ListItem>

                <RenderBasicConnection />
              </List>
            </AccordionDetails>
          </Accordion>

          {/* <----- Operation not permitted error -----> */}
          <Accordion className={styles.expansionRoot}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={styles.heading}>
                {`I keep seeing "${localErrorDictionary.noPerm}" error whenever I try to open a folder in the Local Disk pane`}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <List component="div" disablePadding>
                <ListItem>
                  <ListItemIcon>
                    <FolderSpecialIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`macOS requires that you provide access to your Documents, Desktop, Downloads, and Bin folders, iCloud Drive, the folders of third-party cloud storage providers, removable media, and external drives`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <ThumbUpIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Tap on the "Ok" button, if you see a "${APP_NAME} would like to access files in your..." pop up while trying to open a folder`}
                    secondary={
                      <>
                        <img
                          src={imgsrc(`help/macos-directory-access.jpg`)}
                          alt="Directory access permission prompt"
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
                    primary={`If you keep getting the "${localErrorDictionary.noPerm}" error then you may need to give access to these folders by going to Security and Privacy in System Preferences`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Open macOS System Preferences > Security and Privacy > Privacy Tab`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <ListAltIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`In the left hand side pane find the "Files and Folders" option, select it. In the right hand side pane find "${APP_NAME}"`}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Mark all the folders to which you want to provide ${APP_NAME} access`}
                    secondary={
                      <>
                        <img
                          src={imgsrc(
                            `help/privacy-restricted-folder-access.png`
                          )}
                          alt="Files and Folders"
                          className={styles.imagePlaceholder}
                        />
                      </>
                    }
                  />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(HelpPhoneNotRecognized);
