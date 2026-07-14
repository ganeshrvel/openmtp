# Troubleshooting

## Device Not Recognized

### Check USB Connection

1. Unlock your Android device.
2. Tap the **"Charging via USB"** notification.
3. Select **File Transfer** (not Charging Only, not Photo Transfer).
4. If prompted, tap **Allow** on "Allow access to device data."

### Quit Conflicting Apps

These apps interfere with USB access. Quit them completely:

- Google Android File Transfer (recommended: uninstall it)
- Google Drive
- Dropbox
- OneDrive
- Preview (macOS Ventura)
- Samsung SmartSwitch

### Disable USB Hotplug (if facing frequent disconnections)

Settings → General tab → Turn off "Enable auto device detection (USB Hotplug)."

### Grant macOS Permissions

If OpenMTP can't access local folders:

1. Open **System Preferences → Security & Privacy → Privacy**.
2. Select **Files and Folders**.
3. Find OpenMTP and check the folders you want to access.

For persistent access issues:

1. Go to **System Preferences → Security & Privacy → Privacy → Full Disk Access**.
2. Add OpenMTP (+ button → Applications → OpenMTP).

## Samsung Devices

The app may go blank when connecting a Samsung device. Fix:

1. **Uninstall Samsung SmartSwitch** and its drivers.
   - Guide: https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29
   - Issue: https://github.com/ganeshrvel/openmtp/issues/212
2. Restart OpenMTP.

## "Operation Not Permitted" on Local Folders

macOS requires explicit permission for Desktop, Documents, Downloads, iCloud Drive, and external volumes.

1. If you see a pop-up prompting access → click **OK**.
2. Open **System Preferences → Security & Privacy → Privacy → Files and Folders**.
3. Enable OpenMTP for the affected folders.
4. If still blocked, grant **Full Disk Access** (steps above).

## "Allow access to the device data" Keeps Popping Up

1. Unlock your device.
2. Tap **Allow** on the prompt.
3. If it appears repeatedly, reconnect your device and try again.
4. See the full guide in-app: Help → FAQs.

## Notarization Error: "You must first sign the relevant contracts online. (1048)"

1. Log into [App Store Connect](https://appstoreconnect.apple.com/agreements/).
2. Accept all pending agreements.
3. Retry notarization.

Reference: https://stackoverflow.com/questions/58358449

## Startup Crash: "Cannot read property 'state' of undefined"

Run the initialization command once:

```shell
# macOS / Linux
UPGRADE_EXTENSIONS=1 npm run dev

# Windows
set UPGRADE_EXTENSIONS=1 && npm run dev
```

## Unsupported macOS Versions

OpenMTP requires **macOS 11.0 (Big Sur) or later**. The Kalam MTP kernel does not support macOS ≤ 10.15. There is no legacy fallback — older macOS versions cannot run this application.

## Report an Issue

If your device remains undetected:

https://github.com/ganeshrvel/openmtp/issues/new?template=contribute.md
