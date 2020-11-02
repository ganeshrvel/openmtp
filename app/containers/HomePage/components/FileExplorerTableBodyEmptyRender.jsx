

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Collapse from '@material-ui/core/Collapse';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import StarRateIcon from '@material-ui/icons/StarRate';
import WarningIcon from '@material-ui/icons/Warning';
import CloseIcon from '@material-ui/icons/Close';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import UsbIcon from '@material-ui/icons/Usb';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import CachedIcon from '@material-ui/icons/Cached';
import SettingsInputHdmiIcon from '@material-ui/icons/SettingsInputHdmi';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { styles } from '../styles/FileExplorerTableBodyEmptyRender';
import KeyboadShortcuts from '../../KeyboardShortcutsPage/components/KeyboadShortcuts';
import Features from '../../Onboarding/components/Features';
import { Notification as NotificationDialog } from '../../../components/DialogBox';
import FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender from './FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender';
import { helpPhoneNotConnecting } from '../../../templates/fileExplorer';

class FileExplorerTableBodyEmptyRender extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      expansionPanel: {
        noMtpInstructions: true,
        keyboardNavigation: false,
        features: false,
      },
      showHelpPhoneNotRecognizedDialog: false,
    };
  }

  _handleExpansionPanel = ({ key }) => {
    this.setState((prevState) => {
      return {
        expansionPanel: {
          ...prevState.expansionPanel,
          [key]: !prevState.expansionPanel[key],
        },
      };
    });
  };

  _handleHelpPhoneNotRecognizedBtn = (value) => {
    this.setState({ showHelpPhoneNotRecognizedDialog: value });
  };

  _handleHelpPhoneNotRecognizedDialog = () => {
    this._handleHelpPhoneNotRecognizedBtn(false);
  };

  render() {
    const {
      classes: styles,
      mtpDevice,
      isMtp,
      currentBrowsePath,
      deviceType,
      directoryLists,
      onContextMenuClick,
    } = this.props;

    const { expansionPanel, showHelpPhoneNotRecognizedDialog } = this.state;

    const _eventTarget = 'emptyRowTarget';

    const tableData = {
      path: currentBrowsePath[deviceType],
      directoryLists: directoryLists[deviceType],
    };

    if (isMtp && !mtpDevice.isAvailable) {
      return (
        <TableRow className={styles.emptyTableRowWrapper}>
          <TableCell colSpan={6} className={styles.tableCell}>
            <Paper style={{ height: `100%` }} elevation={0}>
              <Button
                color="secondary"
                className={styles.helpPhoneNotRecognized}
                onClick={() => this._handleHelpPhoneNotRecognizedBtn(true)}
              >
                {helpPhoneNotConnecting}
              </Button>

              <List>
                <ListItem
                  button
                  onClick={() =>
                    this._handleExpansionPanel({
                      key: 'noMtpInstructions',
                    })
                  }
                >
                  <ListItemIcon>
                    <WarningIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Android device is either busy or not connected"
                    secondary={
                      !expansionPanel.noMtpInstructions
                        ? 'Click here for the instructions'
                        : 'Click here to hide the instructions'
                    }
                  />
                  {expansionPanel.noMtpInstructions ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  in={expansionPanel.noMtpInstructions}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <div className={styles.nestedPanel}>
                      <ListItem>
                        <ListItemIcon>
                          <CloseIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Quit other Android File Transfer applications"
                          secondary="eg: 'Android File Transfer' by Google. Uninstall it if it keeps popping up everytime you connect your
                  Android device"
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
                          <UsbIcon />
                        </ListItemIcon>
                        <ListItemText primary="With a USB cable, connect your device to your computer" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TouchAppIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="On your device, tap the 'Charging this device via
                  USB' notification"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <RadioButtonCheckedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Under 'Use USB for' select File Transfer" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CachedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Click Refresh Button above" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SettingsInputHdmiIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Reconnect the cable and repeat the above steps if you keep
                  seeing this message"
                        />
                      </ListItem>
                    </div>
                  </List>
                </Collapse>

                <Divider className={styles.divider} />

                <ListItem
                  button
                  onClick={() =>
                    this._handleExpansionPanel({
                      key: 'keyboardNavigation',
                    })
                  }
                >
                  <ListItemIcon>
                    <KeyboardIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Keyboard Shortcuts"
                    secondary={
                      expansionPanel.keyboardNavigation
                        ? 'Click here to hide the shortcuts'
                        : 'Click here to view the shortcuts'
                    }
                  />
                  {expansionPanel.keyboardNavigation ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  in={expansionPanel.keyboardNavigation}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem>
                      <div className={styles.nestedPanel}>
                        <KeyboadShortcuts />
                      </div>
                    </ListItem>
                  </List>
                </Collapse>

                <Divider className={styles.divider} />

                <ListItem
                  button
                  onClick={() =>
                    this._handleExpansionPanel({
                      key: 'features',
                    })
                  }
                >
                  <ListItemIcon>
                    <StarRateIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Features"
                    secondary={
                      expansionPanel.features
                        ? 'Click here to hide the available features'
                        : 'Click here to view the available features'
                    }
                  />
                  {expansionPanel.features ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  in={expansionPanel.features}
                  timeout="auto"
                  unmountOnExit
                >
                  <div className={styles.nestedPanel}>
                    <Features hideTitle />
                  </div>
                </Collapse>
              </List>

              <NotificationDialog
                fullWidthDialog
                maxWidthDialog="sm"
                titleText={helpPhoneNotConnecting}
                bodyText={
                  <FileExplorerTableBodyEmptyHelpPhoneNotRecognizedRender />
                }
                trigger={showHelpPhoneNotRecognizedDialog}
                onClickHandler={this._handleHelpPhoneNotRecognizedDialog}
              />
            </Paper>
          </TableCell>
        </TableRow>
      );
    }
    return (
      <TableRow className={styles.emptyTableRowWrapper}>
        <TableCell
          colSpan={6}
          className={styles.tableCell}
          onContextMenu={(event) =>
            onContextMenuClick(event, {}, { ...tableData }, _eventTarget)
          }
        />
      </TableRow>
    );
  }
}

export default withStyles(styles)(FileExplorerTableBodyEmptyRender);
