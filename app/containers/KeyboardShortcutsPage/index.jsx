import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Helmet } from 'react-helmet';
import { APP_TITLE } from '../../constants/meta';
import { resetOverFlowY } from '../../utils/styleResets';
import { styles } from './styles';
import KeyboadShortcuts from './components/KeyboadShortcuts';
import { KEYBOARD_SHORTCUTS_PAGE_TITLE } from '../../templates/keyboardShortcutsPage';

class KeyboardShortcutsPage extends Component {
  componentWillMount() {
    resetOverFlowY();
  }

  render() {
    const { classes: styles } = this.props;
    return (
      <div className={styles.root}>
        <Helmet titleTemplate={`%s - ${APP_TITLE}`}>
          <title>{KEYBOARD_SHORTCUTS_PAGE_TITLE}</title>
        </Helmet>
        <Typography variant="h6" color="secondary">
          Keyboard Shortcuts
        </Typography>
        <div className={styles.body}>
          <KeyboadShortcuts />
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(KeyboardShortcutsPage);
