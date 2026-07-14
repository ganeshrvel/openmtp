# OpenMTP

Android File Transfer for macOS. Transfers files between macOS and Android/MTP devices over USB.

**License**: MIT  
**System Requirements**: macOS 11.0 (Big Sur) or later. Kalam MTP kernel requires macOS ≥ 11.0 — older versions are not supported.  
**Download**: [GitHub Releases](https://github.com/ganeshrvel/openmtp/releases) | `brew install openmtp --cask`

---

## Quick Start

1. Connect your Android device via USB.
2. Open OpenMTP — it detects the device automatically.
3. Tap "Allow" on the device's USB permission prompt (set to **File Transfer** mode).
4. Browse files on both sides. Drag, drop, or use keyboard shortcuts to transfer.

## Features

- USB plug-and-play, no setup
- Transfer files larger than 4GB
- Dark mode
- Drag-and-drop between panes
- Grid and list views
- Internal storage and SD card support
- Keyboard shortcuts for all operations
- No personal data collection

## Kalam Kernel

OpenMTP 3.0+ uses a custom MTP kernel (named after Dr. A. P. J. Abdul Kalam) written from scratch. Transfer speeds: 30–40 MB/s on mid-range devices, 100–120 MB/s on higher-end devices.

Built on [go-mtpx](https://github.com/ganeshrvel/go-mtpx).

## Documentation

| Document                                   | Description                                        |
| ------------------------------------------ | -------------------------------------------------- |
| [Installation](docs/installation.md)       | Homebrew, DMG, system requirements                 |
| [Building from Source](docs/building.md)   | Clone, dependencies, dev server                    |
| [Packaging & CI/CD](docs/packaging.md)     | Code signing, notarization, publishing             |
| [Troubleshooting](docs/troubleshooting.md) | Device not detected, Samsung issues, common errors |
| [Contributing](CONTRIBUTING.md)            | Guidelines for PRs and issues                      |

## Keyboard Shortcuts

| Action               | Shortcut            |
| -------------------- | ------------------- |
| Delete               | `⌫`                 |
| New Folder           | `⌘⇧N`               |
| Copy                 | `⌘C`                |
| Copy to Queue        | `⌘⇧C`               |
| Paste                | `⌘V`                |
| Refresh              | `⌘R`                |
| Folder Up            | `⌘B`                |
| Select All           | `⌘A`                |
| Rename               | `⌘D`                |
| Switch Pane          | `⌘1` / `⌘2`         |
| Open                 | `⏎`                 |
| Navigate             | `↑` `↓` `←` `→`     |
| Multi-select (List)  | `⇧↑` / `⇧↓`         |
| Multi-select (Grid)  | `⇧←` / `⇧→`         |
| Multi-select (mouse) | `⌘Click` / `⇧Click` |

## Screenshots

![File Explorer](https://github.com/ganeshrvel/openmtp/raw/master/blobs/images/file-explorer-bluebg.jpg)
![File Transfer](https://github.com/ganeshrvel/openmtp/raw/master/blobs/images/file-transfer-bluebg.jpg)

## Support

- [PayPal](https://paypal.me/ganeshrvel)
- [Buy Me a Coffee](https://buymeacoffee.com/ganeshrvel)

## Credits

- CI/CD sponsored by [CodeMagic](https://codemagic.io)
- Built on [electron-react-redux-advanced-boilerplate](https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate)
- Kalam kernel built on [go-mtpx](https://github.com/ganeshrvel/go-mtpx)
- Legacy MTP kernel by [android-file-transfer-linux](https://github.com/whoozle/android-file-transfer-linux)
- Icons by [flaticon](https://www.flaticon.com), [good-ware](https://www.flaticon.com/authors/good-ware), [kiranshastry](https://www.flaticon.com/authors/kiranshastry) (CC 3.0 BY)
- App logo by [Shubhendu Mitra](https://www.behance.net/soponhara)

## Contact

ganeshrvel@outlook.com

## License

MIT © 2018-Present Ganesh Rathinavel
