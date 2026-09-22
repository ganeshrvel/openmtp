# OpenMTP | Android File Transfer for macOS

- Author: [Ganesh Rathinavel](https://www.linkedin.com/in/ganeshrvel 'Ganesh Rathinavel')
- License: [MIT](https://github.com/ganeshrvel/openmtp/blob/master/LICENSE 'MIT')
- System Requirements: macOS 10.14 (Mojave) or higher. macOS 10.13 and earlier have limited support and require OpenMTP v3.1.15 with Legacy MTP mode.
- Website URL: [https://openmtp.ganeshrvel.com](https://openmtp.ganeshrvel.com/ 'https://openmtp.ganeshrvel.com')
- Repo URL: [https://github.com/ganeshrvel/openmtp](https://github.com/ganeshrvel/openmtp/ 'https://github.com/ganeshrvel/openmtp')
- Contacts: ganeshrvel@outlook.com

## Introduction

### Advanced Android File Transfer Application for macOS.

Transferring files between macOS and Android or any other MTP devices has always been a nightmare. There are a few File Transfer MTP apps that are available online but most of them are either too expensive or come with bad UI/UX. The official "Android File Transfer" app for macOS from Google comes with bugs, innumerable limitations, some of which include - not being able to transfer files larger than 4GB, frequent disconnections, and being unable to rename the folders or files on the Android/MTP devices. Most of the other apps available online use either WiFi or ADB protocol to transfer the files, which is an extremely time-consuming process.

Countless searches to find an app to solve these problems and failing to find one made me restless. So, I took the leap and decided to create an app for us that could help us have a smooth and hassle-free file transfer process from macOS to Android/MTP devices. Created with the objective of giving back to the community, we can all use this app for free in this lifetime.

### Thank you 🎉

OpenMTP has crossed **1.4 million downloads**, from users in **170+ countries**, and the repo has picked up **7.4K+ stars** along the way. It is the **#1 open-source MTP app for Mac**, and it stays free, open-source and ad-free.

| Milestone                     | Value        |
| ----------------------------- | ------------ |
| Downloads                     | 1.4 million+ |
| Countries                     | 170+         |
| GitHub stars                  | 7.4K+        |
| Open-source MTP app for macOS | #1           |

Thank you for using it, reporting issues and testing devices I don't own. 🎉

The next generation of OpenMTP is in active development and coming soon. It's a major upgrade with new features and big improvements to stability and performance. Stay tuned, and thanks for all the support!

### Features

- Safe, Transparent and Open-Source
- Plug and Play via USB. No hassles, easy and instant connection.
- Select between Internal Memory and SD Card
- Transfer multiple files which are larger than 4GB
- Dark mode
- Drag-and-drop support
- Split pane views for both Local Computer and Android device
- Choose between Grid and List view.
- Use Keyboard Shortcuts to navigate through your files.
- No collection of personally identifiable information.

### Kalam Kernel

OpenMTP 3.0 features a new MTP kernel and it was written from scratch. It promises a file copy speed of 30 to 40 MB/s on low and mid-range devices and 100 to 120 MB/s on higher end devices. The all-new and powerful MTP kernel is named after [Dr. A. P. J. Abdul Kalam](https://en.wikipedia.org/wiki/A._P._J._Abdul_Kalam 'Dr. A. P. J. Abdul Kalam')

Do check out the Go package which I've written to build Kalam Kernel: [github.com/ganeshrvel/go-mtpx](https://github.com/ganeshrvel/go-mtpx 'https://github.com/ganeshrvel/go-mtpx'). Feel free to raise PRs.

### Installation

> ⚠️ **Only download OpenMTP from the official sources below.** There are copycat websites that use the OpenMTP name, logo and content, redirect to various other pages. The only official sources are the official website [openmtp.ganeshrvel.com](https://openmtp.ganeshrvel.com/ 'https://openmtp.ganeshrvel.com'), this Github repository [github.com/ganeshrvel/openmtp](https://github.com/ganeshrvel/openmtp 'https://github.com/ganeshrvel/openmtp'), and [Homebrew](https://formulae.brew.sh/cask/openmtp 'Homebrew Cask').

- Download the [Mac Apple Silicon](https://openmtp.ganeshrvel.com/?downloadApp=github&release=stable&platform=mac&arch=arm64 'Mac Apple Silicon') version
- Download the [Mac Intel](https://openmtp.ganeshrvel.com/?downloadApp=github&release=stable&platform=mac&arch=x64 'Mac Intel') version
- Using Homebrew Cask

```shell
  # newer versions:
  brew install openmtp --cask
  # older versions:
  brew cask install openmtp
```

- Find the latest _dmg_ file from [GitHub Releases](https://github.com/ganeshrvel/openmtp/releases 'GitHub Releases')

### System Requirements and Support

- To support macOS version below Big Sur the Kalam kernel needs to be compiled on an older macOS machine every time there is an update, which is practically very difficult
- Only the latest 3 versions of macOS will receive the `Kalam` Kernel updates, which include new device support, fixes, and stability improvements. macOS Big Sur (11.0) or above will receive the above-mentioned updates
- We have now officially retired the support for `Kalam` Kernel on macOS 10.13 (OS X High Sierra) and lower. Only the "Legacy" MTP mode will continue working on these outdated machines.
- We will continue releasing the updates for both `Intel` and `ARM64` machines

#### Running OpenMTP on macOS 10.13 (High Sierra) and lower

If the latest OpenMTP doesn't launch or doesn't work on your older Mac, use [OpenMTP v3.1.15](https://github.com/ganeshrvel/openmtp/releases/download/v3.1.15/OpenMTP-3.1.15.dmg 'Download OpenMTP v3.1.15') with the "Legacy" MTP mode instead. Auto-update has to be turned off, otherwise the app will replace itself with a version your Mac cannot run.

1. Download [OpenMTP v3.1.15](https://github.com/ganeshrvel/openmtp/releases/download/v3.1.15/OpenMTP-3.1.15.dmg 'Download OpenMTP v3.1.15')
2. Drag the app into the Applications folder
3. Turn off the internet
4. Launch v3.1.15 of the app
5. Go to Settings
6. In the Update tab, turn off auto-update
7. Turn the internet back on

### Screengrabs

![OpenMTP File Explorer](https://github.com/ganeshrvel/openmtp/raw/master/blobs/images/file-explorer-bluebg.jpg 'OpenMTP File Explorer')

![OpenMTP File Transfer](https://github.com/ganeshrvel/openmtp/raw/master/blobs/images/file-transfer-bluebg.jpg 'OpenMTP File Transfer')

### Keyboard Shortcuts

| Command                                           | Keyboard Shortcut                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| Delete                                            | <kbd>backspace</kbd>                                                         |
| New Folder                                        | <kbd>command (⌘)</kbd>+<kbd>n</kbd>                                          |
| Copy                                              | <kbd>command (⌘)</kbd>+<kbd>c</kbd>                                          |
| Copy to Queue                                     | <kbd>command (⌘)</kbd>+<kbd>shift</kbd>+<kbd>c</kbd>                         |
| Paste                                             | <kbd>command (⌘)</kbd>+<kbd>v</kbd>                                          |
| Refresh                                           | <kbd>command (⌘)</kbd> +<kbd>r</kbd>                                         |
| Folder Up                                         | <kbd>command (⌘)</kbd>+<kbd>b</kbd>                                          |
| Select All                                        | <kbd>command (⌘)</kbd>+<kbd>a</kbd>                                          |
| Rename                                            | <kbd>command (⌘)</kbd>+<kbd>d</kbd>                                          |
| Switch Tab                                        | <kbd>command(⌘)</kbd>+<kbd>1</kbd>                                           |
| Open                                              | <kbd>enter</kbd>                                                             |
| Navigate Left                                     | <kbd>left</kbd>                                                              |
| Navigate Right                                    | <kbd>right</kbd>                                                             |
| Navigate Up                                       | <kbd>up</kbd>                                                                |
| Navigate Down                                     | <kbd>down</kbd>                                                              |
| Select Multiple Items Forward **(in Grid View)**  | <kbd>shift</kbd>+<kbd>left</kbd>                                             |
| Select Multiple Items Backward **(in Grid View)** | <kbd>shift</kbd>+<kbd>right</kbd>                                            |
| Select Multiple Items Forward **(in List View)**  | <kbd>shift</kbd>+<kbd>up</kbd>                                               |
| Select Multiple Items Backward **(in List View)** | <kbd>shift</kbd>+<kbd>down</kbd>                                             |
| Select Multiple Items **(with mouse)**            | <kbd>command (⌘)</kbd>+<kbd>click</kbd> or <kbd>shift</kbd>+<kbd>click</kbd> |

## Development

Building from source, packaging, publishing and debugging are documented in [DEVELOPMENT.md](DEVELOPMENT.md 'DEVELOPMENT.md').

### Troubleshooting

#### OpenMTP doesn't launch or doesn't work on my Mac

- Check your macOS version first: OpenMTP requires macOS 10.14 (Mojave) or higher
- On macOS 10.13 (High Sierra) and lower, use [OpenMTP v3.1.15](https://github.com/ganeshrvel/openmtp/releases/download/v3.1.15/OpenMTP-3.1.15.dmg 'Download OpenMTP v3.1.15') with the "Legacy" MTP mode: [Running OpenMTP on macOS 10.13 (High Sierra) and lower](#running-openmtp-on-macos-1013-high-sierra-and-lower)
- Still stuck? See the [troubleshooting guide](https://github.com/ganeshrvel/openmtp/issues/276 'Troubleshooting guide')

### More open-source projects from the author

- [npm: electron-root-path](https://github.com/ganeshrvel/npm-electron-root-path 'Get the root path of an Electron Application')
- [Electron React Redux Advanced Boilerplate](https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate 'Electron React Redux advanced boilerplate')
- [Tutorial Series by Ganesh Rathinavel](https://github.com/ganeshrvel/tutorial-series-ganesh-rathinavel 'Tutorial Series by Ganesh Rathinavel')

### Credits

- Special thanks to [CodeMagic](http://codemagic.io/ 'Codemagic - CI/CD') and [Kevin Suhajda](https://www.linkedin.com/in/kevinsuhajda 'Kevin Suhajda') for sponsoring their CI/CD VMs, thus making the app releases more streamlined and much easier now. 🎊🎊 Do check out their [products](https://codemagic.io/integrations 'Codemagic - integrations') section for more.

- Special shoutout to [@CodyJung](https://github.com/CodyJung 'CodyJung') for adding the [Fujifilm](https://github.com/ganeshrvel/go-mtpfs/pull/2) and [Garmin](https://github.com/ganeshrvel/go-mtpfs/pull/1) device support. 🔥🔥

- Thanks to Ms [Ayushi Bothra](https://www.linkedin.com/in/ayushi-bothra-3103/ 'Ayushi Bothra') for contributing to the documentation and pages.

- App logo was contributed by [Shubhendu Mitra](https://www.linkedin.com/in/shubhendum/ 'Shubhendu Mitra - LinkedIn'). Make sure to check out more of his work on [Behance](https://www.behance.net/soponhara 'Shubhendu Mitra - Behance').

- Thanks to [Vladimir Menshakov](https://github.com/whoozle 'Vladimir Menshakov') for [android-file-transfer-linux](https://github.com/whoozle/android-file-transfer-linux 'android-file-transfer-linux') (the legacy MTP Kernel)

- Shoutout to [@yennsarah](https://github.com/yennsarah 'yennsarah'), [@h0tk3y](https://github.com/h0tk3y), [@riginoommen](https://github.com/riginoommen 'riginoommen'), [@AjithKumarvm](https://github.com/AjithKumarvm 'AjithKumarvm'), [@kiranshaji555](https://github.com/kiranshaji555), Dick Cowan, Kjell Dankert, Thorolf E.R. Weißhuhn and to all other community members who helped me test the application.

- This app was built upon [https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate](https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate 'https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate'), which is a heavily modified fork of [https://github.com/electron-react-boilerplate/electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate 'https://github.com/electron-react-boilerplate/electron-react-boilerplate').

- The icons used in the app were made by [flaticon](https://www.flaticon.com), [good-ware](https://www.flaticon.com/authors/good-ware) and [kiranshastry](https://www.flaticon.com/authors/kiranshastry) which are licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/ 'Creative Commons BY 3.0').

- The "no image found" icon was made by [Phonlaphat Thongsriphong](https://www.iconfinder.com/phatpc 'Phonlaphat Thongsriphong').

### Contribute

If you are interested in fixing issues and contributing directly to the code base, please see the [guidelines](https://github.com/ganeshrvel/openmtp/blob/master/CONTRIBUTING.md 'guidelines').

### Support OpenMTP

Help me keep the app FREE and open for all.

- Support us via PayPal: [paypal.me/ganeshrvel](https://paypal.me/ganeshrvel 'https://paypal.me/ganeshrvel')
- Buy Me A Coffee (UPI, PayPal, Credit/Debit Cards, Internet Banking): [buymeacoffee.com/ganeshrvel](https://buymeacoffee.com/ganeshrvel 'https://buymeacoffee.com/ganeshrvel')

### Contacts

Please feel free to contact me at ganeshrvel@outlook.com

### License

OpenMTP | Android File Transfer for macOS is released under the [MIT License](https://github.com/ganeshrvel/openmtp/blob/master/LICENSE 'MIT License').

Copyright © 2018-Present Ganesh Rathinavel
