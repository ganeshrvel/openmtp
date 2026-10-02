# ADB implementation tracker

Status legend: **done** means implemented and source-checked; **pending** means
not implemented; **blocked** means it needs an external prerequisite.

## Completed groundwork

- [x] ADB process boundary using the official `adb` executable.
- [x] Development path override through `OPENMTP_ADB_PATH`.
- [x] Packaged-resource path resolution (`Contents/Resources/bin/adb`).
- [x] Electron-builder configuration includes the `adb` resource and MAS binary.
- [x] ADB discovery through `adb devices -l`.
- [x] Explicit serial targeting for all device commands (`adb -s <serial>`).
- [x] Modern Wireless Debugging primitives: pairing (`adb pair`) and connection
  (`adb connect`), with validation of IPv4 address, port, and six-digit code.
- [x] ADB device model includes serial, state, model, transport, and address.
- [x] `/storage/emulated/0` is the only normal remote browsing root.
- [x] NUL-delimited remote directory listing; no parsing of human-formatted
  `ls` output.
- [x] File operations: list, mkdir, rename, delete, and existence check.
- [x] Path containment checks for mutations and refusal to delete the storage
  root.
- [x] Upload/download via `adb push` / `adb pull`.
- [x] Transfer process ownership and cancellation by terminating the spawned
  `adb` process.
- [x] File-explorer controller/repository/data-source integration points.
- [x] Parser unit-test source plus JavaScript syntax and whitespace checks.
- [x] Architecture and packaging documentation in [adb-transport.md](adb-transport.md).

## Pending implementation

### Renderer and UX

- [x] Add an **Add Android Device** entry point in the OpenMTP UI.
- [x] Add the Wireless Debugging pairing form: IP address, pairing port, code,
  validation feedback, and safe error messages.
- [x] Discover/select ADB devices, including multiple connected devices.
- [x] Add an ADB Internal Storage browser without changing the existing MTP pane.
- [x] Display device name and connection type: USB / ADB or Wi-Fi / ADB.
- [ ] Wire `DEVICE_TYPE.adb` through Home state, selectors, reducers, toolbar,
  context menu, keyboard focus, and drag/drop rules.
- [x] Use the selected device serial when initializing the ADB data source.
- [x] Add refresh for the ADB device browser. Disconnected/offline state remains pending.
- [x] Add a visible transfer cancel button that calls `cancelAdbTransfer`.

### Transfer quality

- [x] Report byte-level transfer progress and transfer rate from `adb -p`
  process output; `adb push/pull` remains the deliberately isolated first
  implementation.
- [x] Add overwrite confirmation before upload or download replaces an item.
- [x] Add a sequential per-device transfer queue and prevent conflicting
  operations in the browser UI.
- [x] Handle a disconnect during transfer with a clear failure state; periodic
  discovery reselects a remembered device when it returns.
- [ ] Evaluate a direct ADB SYNC client only after measuring the process-based
  implementation.

### Discovery and resilience

- [x] Add periodic discovery refresh for mDNS-advertised Wireless Debugging
  devices (15-second interval).
- [x] Persist only non-sensitive device selection metadata; never pairing codes
  or ADB credentials.
- [x] Implement reconnect UX after a wireless device disappears and returns.

### Packaging and release

- [x] Stage the official, executable universal macOS Platform Tools binary at
  `build/mac/bin/adb` before packaging.
- [ ] Confirm code-signing/notarization behavior for the bundled executable on
  both Apple Silicon and Intel release builds.
- [x] Document the Platform Tools version and update process.

### Tests and real-device verification

- [ ] Run the included parser unit tests after dependencies are installed.
- [x] Add mocked process tests for discovery and file operations. Pairing,
  cancellation, and error-path coverage remains pending execution/expansion.
- [ ] Test USB ADB, modern wireless pairing, and a Wi-Fi reconnect on real
  devices.
- [ ] Test upload/download for small, large, Unicode, space-containing, and
  nested paths.
- [ ] Run `yarn lint`, `yarn build`, and macOS packaging.

## Current blockers

- The workspace has no usable `node_modules`. The repository's install guard
  rejects the environment's npm 11.13.0; it requires npm 6 through 8.16.0.
- No Android device was attached during the ADB discovery check.
- The bundled `build/mac/bin/adb` release artifact has not yet been supplied.

## Recommended next step

Implement the Add Android Device dialog and selected-device state first. That
makes the already implemented transport reachable while keeping MTP entirely
separate. Then run the real-device transfer tests before optimizing progress or
reconnection behavior.
