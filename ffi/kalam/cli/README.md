# OpenMTP MTP CLI

A small command-line interface that drives OpenMTP's native **Kalam** MTP
engine from the terminal, so MTP file operations can be scripted and automated
on macOS.

## Why

On macOS, the standard `libmtp` CLI tools (`mtp-detect`, `mtp-sendfile`, …)
often **cannot claim the USB interface** of MTP devices — they fail with
`libusb_claim_interface() = -3` (`LIBUSB_ERROR_ACCESS`) because IOKit will not
hand the interface to userspace libusb. OpenMTP's GUI works regardless because
it ships its own MTP engine (Kalam mode), but until now that engine was only
reachable through the Electron GUI. This CLI exposes the **same engine** for
automation (CI, scripted backups, side-loading files onto devices such as
Garmin watches).

## How it reuses the engine

The koffi FFI binding to `kalam.dylib` was extracted from `Kalam.js` into an
Electron-free class, [`KalamEngine`](../src/KalamEngine.js):

- The GUI keeps using [`Kalam`](../src/Kalam.js), now a thin subclass that
  injects the Electron-resolved `kalamLibPath` and the Sentry-backed `log`.
  Its public API is unchanged (`new Kalam()` still works exactly as before).
- The CLI constructs `KalamEngine` directly with a plain-Node dylib path
  ([`resolveLibPath.js`](./resolveLibPath.js)) and a `console` logger, so the
  identical engine runs outside Electron.

No MTP logic is reimplemented — the CLI calls the same `initialize`, `walk`,
`transferFiles`, `listStorages`, … methods the GUI uses.

## Usage

```shell
# Show the connected device and its storages
yarn mtp-cli list-devices

# List a directory on the device (default storage)
yarn mtp-cli ls /DCIM/Camera

# Copy a local file TO the device
yarn mtp-cli upload ./watchface.fit /GARMIN/NEWFILES

# Copy a file FROM the device to a local folder
yarn mtp-cli download /DCIM/Camera/IMG_0001.jpg ./downloads

# Machine-readable output
yarn mtp-cli list-devices --json
```

Options:

| Option           | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `--storage <id>` | Storage id to operate on (defaults to first storage).  |
| `--all`          | (`ls`) include hidden files.                           |
| `--json`         | Emit JSON instead of human-readable text.              |
| `-h`, `--help`   | Show usage.                                            |

After a build/install the `openmtp-cli` bin (declared in `package.json`) points
at the same entry point.

## Tests

Unit tests cover argument parsing, storage resolution, the dylib path resolver,
and command dispatch (with the engine mocked, so no physical device is needed):

```shell
yarn test
```
