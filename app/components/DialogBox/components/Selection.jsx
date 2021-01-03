import React, { PureComponent, Fragment } from 'react';
import classnames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { styles } from '../styles/Selection';
import { isEmpty } from '../../../utils/funcs';

class Selection extends PureComponent {
  _handleListItemClick = ({ ...args }) => {
    const { onClose } = this.props;

    onClose({ ...args });
  };

  render() {
    const { list, titleText, open, showAvatar, classes: styles } = this.props;

    if (isEmpty(list)) {
      return <Fragment />;
    }

    return (
      <Dialog
        onClose={() =>
          this._handleListItemClick({
            selectedValue: null,
            triggerChange: false,
          })
        }
        open={open}
      >
        <DialogTitle>{titleText}</DialogTitle>
        <div>
          <List>
            {list.map((item) => {
              return (
                <Fragment key={item.value}>
                  <ListItem
                    button
                    onClick={() => {
                      this._handleListItemClick({
                        selectedValue: item.value,
                        triggerChange: true,
                      });
                    }}
                  >
                    {showAvatar && (
                      <ListItemAvatar>
                        <Avatar
                          className={classnames({
                            [styles.selectedAvatar]: item.selected,
                          })}
                        >
                          <FontAwesomeIcon
                            icon={item.icon}
                            title={item.name}
                            className={classnames({
                              [styles.selectedIcon]: item.selected,
                            })}
                          />
                        </Avatar>
                      </ListItemAvatar>
                    )}

                    <Tooltip title={item.hint ?? ''}>
                      <ListItemText primary={item.name} />
                    </Tooltip>
                  </ListItem>
                </Fragment>
              );
            })}
          </List>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(styles)(Selection);
