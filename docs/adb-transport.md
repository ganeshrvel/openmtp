# ADB transport

OpenMTP's existing MTP path remains `FileExplorerController → Repository → Kalam
data source → Go/Kalam`. ADB is an adjacent data source with the same file
operations and callback-shaped transfer API:

`FileExplorerController → Repository → FileExplorerAdbDataSource → AdbTransport → adb`.

`AdbTransport` retains a device serial and adds `-s <serial>` to every command,
so more than one device cannot be selected implicitly. It discovers devices with
`adb devices -l`, supports modern Wireless Debugging with `adb pair host:port
code` followed by discovery and `adb connect host:port`, and exposes only
`/storage/emulated/0` (not the Android root filesystem).

Remote listings use NUL-delimited records generated on-device rather than
human-readable `ls` output. Mutating paths are normalized and rejected unless
they remain beneath the storage root; deleting the storage root is refused.

For a packaged macOS build, place the notarized, executable Android Platform
Tools `adb` at `build/mac/bin/adb`; electron-builder copies it to
`Contents/Resources/bin/adb`. Development builds use that same location, or the
explicit `OPENMTP_ADB_PATH=/absolute/path/to/adb` override. The app does not
fall back to a globally installed `adb`.

The initial transfer implementation invokes `adb push` / `adb pull` and owns
the spawned child process so cancellation terminates the underlying command.
This is intentionally isolated in `AdbTransport`, leaving room for a future
direct ADB SYNC client without UI changes.

At present this commit provides the transport and file-explorer API boundary;
the existing two-pane renderer has not yet been expanded with the device picker
and pairing form. Consumers can call `discoverAdbDevices`, `pairAdbDevice`,
`connectAdbDevice`, and then `initialize({ deviceType: DEVICE_TYPE.adb,
serial })`. The next renderer change should make those calls from an explicit
"Add Android Device" flow and add an ADB pane, rather than overloading MTP
state.

See [the implementation tracker](adb-implementation-tracker.md) for the
remaining renderer, release, and verification work.

## Bundled Platform Tools

The current macOS resource binary is Android Platform Tools ADB `1.0.41`
(`37.0.1-15733141`), a universal Mach-O executable containing both x86_64 and
arm64 slices. It is staged at `build/mac/bin/adb` and copied to the app's
resource directory by electron-builder.

To update it, replace that file only with the official macOS Platform Tools
release, preserve its executable bit, verify `file build/mac/bin/adb` reports
both required architectures, then run the signed/notarized macOS packaging
pipeline. Never source a release binary implicitly from a developer's PATH.
