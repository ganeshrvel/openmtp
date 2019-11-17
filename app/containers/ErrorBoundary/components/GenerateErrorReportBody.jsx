

import React, { PureComponent, Fragment } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import SendIcon from '@material-ui/icons/Send';
import UsbIcon from '@material-ui/icons/Usb';
import EmailIcon from '@material-ui/icons/Email';
import Button from '@material-ui/core/Button';
import { DEVICES_LABEL, DEVICES_TYPE_CONST } from '../../../constants';

export default class GenerateErrorReportBody extends PureComponent {
  render() {
    const {
      styles,
      zippedLogFileBaseName,
      mailTo,
      mailToInstructions,
      AUTHOR_EMAIL,
      onGenerateErrorLogs
    } = this.props;
    return (
      <Fragment>
        <List>
          <ListItem>
            <ListItemIcon>
              <UsbIcon />
            </ListItemIcon>
            <ListItemText
              primary={`Unlock your ${
                DEVICES_LABEL[DEVICES_TYPE_CONST.mtp]
              } and connect it to your ${
                DEVICES_LABEL[DEVICES_TYPE_CONST.local]
              } via USB`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FileCopyIcon />
            </ListItemIcon>
            <ListItemText primary="Turn on the 'File Transfer' mode" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TouchAppIcon />
            </ListItemIcon>
            <ListItemText
              primary="Click the 'EMAIL ERROR LOGS' button below"
              secondary="This will launch your default email client"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AttachFileIcon />
            </ListItemIcon>
            <ListItemText
              primary="Attach the generated Error Log file along with the email"
              secondary={`Check Desktop Folder for ${zippedLogFileBaseName}`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SendIcon />
            </ListItemIcon>
            <ListItemText primary="Send the email" />
          </ListItem>
        </List>
        <Button
          variant="outlined"
          color="primary"
          className={styles.generateLogsBtn}
          onClick={onGenerateErrorLogs}
        >
          EMAIL ERROR LOGS
        </Button>
        <List component="div">
          <ListItem>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <a
              href={`${mailTo} ${mailToInstructions}`}
              className={styles.emailId}
            >
              {AUTHOR_EMAIL}
            </a>
          </ListItem>
        </List>
      </Fragment>
    );
  }
}
