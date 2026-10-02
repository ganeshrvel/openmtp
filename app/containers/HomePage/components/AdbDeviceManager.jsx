import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { withReducer } from '../../../store/reducers/withReducer';
import reducers from '../reducers';
import { setAdbDevice } from '../actions';
import { makeAdbDevice } from '../selectors';
import fileExplorerController from '../../../data/file-explorer/controllers/FileExplorerController';
import { DEVICE_TYPE } from '../../../enums';
import {
  getAdbSelectedDeviceSetting,
  setAdbSelectedDeviceSetting,
} from '../../../helpers/settings';

const emptyPairing = { host: '', port: '', code: '' };

class AdbDeviceManager extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      pairing: emptyPairing,
      message: null,
      messageIsError: false,
      pairingBusy: false,
    };
  }

  componentDidMount() {
    const { actionSetAdbDevice } = this.props;

    actionSetAdbDevice({ remembered: getAdbSelectedDeviceSetting() });
    this.refreshDevices();
    this.discoveryTimer = setInterval(this.refreshDevices, 15000);
  }

  componentWillUnmount() {
    clearInterval(this.discoveryTimer);
  }

  refreshDevices = async () => {
    const { actionSetAdbDevice, adbDevice } = this.props;

    actionSetAdbDevice({ isLoading: true, error: null });
    const result = await fileExplorerController.discoverAdbDevices();
    const devices = result.data || [];
    const { remembered } = adbDevice;
    const rememberedDevice = devices.find(
      (device) =>
        device.serial === remembered?.serial && device.state === 'device'
    );
    const selectedIsPresent = devices.some(
      (device) =>
        device.serial === adbDevice.selected?.serial &&
        device.state === 'device'
    );

    actionSetAdbDevice({
      devices,
      error: result.error || null,
      isLoading: false,
    });

    if (adbDevice.selected && !selectedIsPresent) {
      actionSetAdbDevice({
        selected: null,
        error: 'Device disconnected. Waiting for it to reconnect.',
      });
    } else if (
      !adbDevice.selected &&
      !rememberedDevice &&
      devices.length === 1
    ) {
      // Auto-select the only connected device if none is selected
      this.selectDevice(devices[0], true);
    }

    if (
      rememberedDevice &&
      rememberedDevice.serial !== adbDevice.selected?.serial
    ) {
      this.selectDevice(rememberedDevice, false);
    }
  };

  selectDevice = async (device, persist = true) => {
    const { actionSetAdbDevice } = this.props;
    const result = await fileExplorerController.initialize({
      deviceType: DEVICE_TYPE.adb,
      serial: device.serial,
    });

    if (result.error) {
      actionSetAdbDevice({ error: result.error });

      return;
    }

    if (persist) setAdbSelectedDeviceSetting(device);
    actionSetAdbDevice({ selected: device, remembered: device, error: null });
    this.setState({
      message: `${device.model} is connected through ADB.`,
      messageIsError: false,
    });
  };

  updatePairing = (key) => (event) => {
    this.setState(({ pairing }) => ({
      pairing: { ...pairing, [key]: event.target.value },
    }));
  };

  pairAndDiscover = async () => {
    const { pairing } = this.state;

    this.setState({ pairingBusy: true, message: null, messageIsError: false });
    const pairingResult = await fileExplorerController.pairAdbDevice(pairing);

    if (pairingResult.error) {
      this.setState({
        pairingBusy: false,
        message: pairingResult.error,
        messageIsError: true,
      });

      return;
    }

    this.setState({
      pairingBusy: false,
      pairing: emptyPairing,
      message: 'Paired. Select the device when it appears below.',
      messageIsError: false,
    });
    this.refreshDevices();
  };

  render() {
    const { adbDevice } = this.props;
    const { open, pairing, message, messageIsError, pairingBusy } = this.state;

    return (
      <div style={{ position: 'fixed', right: 16, top: 58, zIndex: 1300 }}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => this.setState({ open: true })}
        >
          {adbDevice.selected
            ? `${adbDevice.selected.model} · ${
                adbDevice.selected.transport === 'wifi' ? 'Wi-Fi' : 'USB'
              } / ADB`
            : 'Add Android Device'}
        </Button>
        <Dialog
          open={open}
          onClose={() => this.setState({ open: false })}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Add Android Device</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1">Wireless Debugging</Typography>
            <Typography variant="body2" color="textSecondary">
              On Android, open Developer options → Wireless debugging → Pair
              device with pairing code.
            </Typography>
            <TextField
              label="IP Address"
              value={pairing.host}
              onChange={this.updatePairing('host')}
              margin="dense"
              fullWidth
            />
            <TextField
              label="Pairing Port"
              value={pairing.port}
              onChange={this.updatePairing('port')}
              margin="dense"
              fullWidth
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              label="Pairing Code"
              value={pairing.code}
              onChange={this.updatePairing('code')}
              margin="dense"
              fullWidth
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            />
            <Button
              color="primary"
              onClick={this.pairAndDiscover}
              disabled={pairingBusy}
            >
              {pairingBusy ? 'Pairing…' : 'Pair Device'}
            </Button>
            {(message || adbDevice.error) && (
              <Typography
                color={
                  messageIsError || adbDevice.error ? 'error' : 'textPrimary'
                }
              >
                {message || adbDevice.error}
              </Typography>
            )}
            <Typography variant="subtitle1" style={{ marginTop: 16 }}>
              Available ADB devices
            </Typography>
            <Button
              onClick={this.refreshDevices}
              disabled={adbDevice.isLoading}
            >
              {adbDevice.isLoading ? 'Refreshing…' : 'Refresh devices'}
            </Button>
            <List dense>
              {adbDevice.devices.map((device) => (
                <ListItem
                  button
                  key={device.serial}
                  onClick={() => this.selectDevice(device)}
                  disabled={device.state !== 'device'}
                  selected={adbDevice.selected?.serial === device.serial}
                >
                  <ListItemText
                    primary={device.model}
                    secondary={`${
                      device.state === 'device' ? 'Connected via' : device.state
                    } ${device.transport === 'wifi' ? 'Wi-Fi' : 'USB'} · ADB${
                      device.address ? ` · ${device.address}` : ''
                    }${
                      adbDevice.selected?.serial === device.serial
                        ? ' ✓ Active'
                        : ''
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ open: false })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ adbDevice: makeAdbDevice(state) });
const mapDispatchToProps = (dispatch) => ({
  actionSetAdbDevice: (data) => dispatch(setAdbDevice(data)),
});

export default withReducer(
  'Home',
  reducers
)(connect(mapStateToProps, mapDispatchToProps)(AdbDeviceManager));
