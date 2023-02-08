# OpenMTP | Android File Transfer for macOS

- Author: [Ganesh Rathinavel](https://www.linkedin.com/in/ganeshrvel 'Ganesh Rathinavel')
- License: [MIT](https://github.com/ganeshrvel/openmtp/blob/master/LICENSE 'MIT')
- System Requirements: macOS 11.0 (Big Sur) or higher
- Website URL: [https://openmtp.ganeshrvel.com](https://openmtp.ganeshrvel.com/ 'https://openmtp.ganeshrvel.com')
- Repo URL: [https://github.com/ganeshrvel/openmtp](https://github.com/ganeshrvel/openmtp/ 'https://github.com/ganeshrvel/openmtp')
- Contacts: ganeshrvel@outlook.com

## Introduction

### Advanced Android File Transfer Application for macOS.

Transferring files between macOS and Android or any other MTP devices has always been a nightmare. There are a few File Transfer MTP apps which are available online but most of them are either too expensive or come with bad UI/UX. The official "Android File Transfer" app for macOS from Google comes with bugs, innumerable limitations, some of which include - not being able to transfer files larger than 4GB, frequent disconnections, unable to rename the folders or files on the android/MTP devices. Most of the other apps available online uses either WiFi or ADB protocol to transfer the files, which is an extremely time-consuming process.

Countless searches to find an app to solve these problems and failing to find one made me restless. So, I took the leap and decided to create an app for us that could help us have a smooth and hassle-free file transfer process from macOS to Android/MTP devices. Created with the objective of giving back to the community, we can all use this app for free in this lifetime.

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

OpenMTP 3.0 features a new MTP kernel and it was written from the scratch. It promises a file copy speed of 30 to 40 MB/s on low and mid range devices and 100 to 120 MB/s on higher end devices. The all new and powerful MTP kernel is named after [Dr. A. P. J. Abdul Kalam](https://en.wikipedia.org/wiki/A._P._J._Abdul_Kalam 'Dr. A. P. J. Abdul Kalam')

Do checkout the Go package which I've written to build Kalam Kernel: [github.com/ganeshrvel/go-mtpx](https://github.com/ganeshrvel/go-mtpx 'https://github.com/ganeshrvel/go-mtpx'). Feel free to raise PRs.

### System Requirements and Support

- To support macOS version below Big Sur the Kalam kernel needs to be compiled on an older macOS machine everytime there is an update, which is practically very difficult
- Only the latest 3 versions of macOS will receive the `Kalam` Kernel updates, which includes new device supports, fixes, stability improvements. macOS Big Sur (11.0) or above will receive the above said updates
- We have now officially retired the support for `Kalam` Kernel on macOS 10.13 (OS X El High Sierra) and lower. Only the "Legacy" MTP mode will continue working on these outdated machines.
- We will continue releasing the updates for both `Intel` and `ARM64` machines

### Installation

- Download the [Mac Apple Silicon](https://openmtp.ganeshrvel.com/?downloadApp=github&release=stable&platform=mac&arch=arm64 'Mac Apple Silicon') version
- Download the [Mac Intel Silicon](https://openmtp.ganeshrvel.com/?downloadApp=github&release=stable&platform=mac&arch=x64 'Mac Intel Silicon') version
- Using Homebrew Cask

```shell
  # newer versions:
  brew install openmtp --cask
  # older versions:
  brew cask install openmtp
```

- Find the latest _dmg_ file from [GitHub Releases](https://github.com/ganeshrvel/openmtp/releases 'GitHub Releases')

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

## Building from Source

Requirements: [Node.js v10](https://nodejs.org/en/download/ 'Install Node.js v10'), [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git 'Install Git') and [Yarn package manager](https://yarnpkg.com/lang/en/docs/install/ 'Install Yarn package manager')

### Clone

```shell
$ git clone https://github.com/ganeshrvel/openmtp.git

$ cd openmtp

# install yarn
npm install -g yarn

# install sentry cli
npm -g i @sentry/cli
```

```shell
$ yarn
```

### Run

A fresh clone might throw _undefined state_ error. Run the following commands once to fix the issue.

```shell
# For Mac and Linux
$ UPGRADE_EXTENSIONS=1 npm run dev

# For Windows
$ set UPGRADE_EXTENSIONS=1 && npm run dev
```

```shell
# Development
$ yarn dev

# Pre-production
$ yarn start

```

### Debugging a Packaged app

```shell
# On terminal run
$ "/path/to/OpenMTP.app/Contents/MacOS/OpenMTP" --remote-debugging-port=6363
```

- Open a Chromium browser
- Input "about://inpsect" into the URL bar
- Add a new connection `localhost:6363`
- Inpect OpenMTP @ port `6363`

### Publishing using CI/CD:

- CodeMagic.io
  - Create a new App (Choose others -> Enter Electron)
  - Environment variables:
    - `APPLEID`: `<Apple developer account username>`
    - `APPLE_APP_SPECIFIC_PASSWORD`: `<App-Specific Password>`
      - Log into your [Apple Account](https://appleid.apple.com/account/manage 'Apple Account')
      - Goto **Sign-In and Security > App-Specific Passwords**
      - Click on **Generate Password...**, enter a password label and click _Create_
      - Copy the displayed _app-specific-password_
    - `SENTRY_URL`: `https://sentry.io/`
    - `SENTRY_ORG`: `<Sentry Organization Name>`
    - `SENTRY_PROJECT`: `<Sentry Project>`
    - `SENTRY_TOKEN_ID`: `<Sentry Auth Token>`
      - Find it from here: [Auth Tokens](https://sentry.io/settings/account/api/auth-tokens)
      - Scopes: `event:admin, event:read, member:read, org:read, project:read, project:releases, team:read`
    - `GITHUB_TOKEN`: `Personal access token`
      - Find it from here: [Personal access tokens](https://github.com/settings/tokens)
      - Scopes: `admin:gpg_key, admin:public_key, repo, user, workflow`
    - `CSC_LINK`:
      - Keychain -> `Default Keychains` menu in the left -> Login -> My Certificates
      - Search for `Developer ID Application` in the top search bar
        - If there are no results for the `Developer ID Application`, for the organization, create one from here: [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/add)
        - Follow these steps to get the Apple Developer certificated installed in the local machine [Obtaining-an-Apple-Developer-ID-Certificate-for-macOS-Provisioning](https://forums.ivanti.com/s/article/Obtaining-an-Apple-Developer-ID-Certificate-for-macOS-Provisioning?language=en_US&ui-force-components-controllers-recordGlobalValueProvider.RecordGvp.getRecord=1)
      - Search for `Developer ID Application` in the top search bar
      - Expand `Developer ID Application: <User Name> (XXXYYYZZZ)`
      - See if the private key's name matches this: `Mac Developer ID Application: <User Name>`
        - Else rename the private key as (right click -> get info) `Mac Developer ID Application: <User Name>`
        - Close the window
      - Right Click on the private key -> `Mac Developer ID Application: <User Name>`
      - Export `Mac Developer ID Application: <User Name>`
      - File name: `CERTIFICATE_PRIVATE_KEY.p12`
      - Enter Password. This is the `CSC_KEY_PASSWORD`, note this down
      - Run (this step doesnt work if you are using fig or ohmyzsh, use raw terminal):
        - `base64 -i CERTIFICATE_PRIVATE_KEY.p12 -o CERTIFICATE_PRIVATE_KEY.txt`
      - Copy the whole content of the file `CERTIFICATE_PRIVATE_KEY.txt`
      - Paste the content as the value for the field `CSC_LINK`
    - `CSC_KEY_PASSWORD` is the password from the above step
    - `CODEMAGIC_AUTH_TOKEN_ID`: `<CodeMagic API Token>`
      - Find it from here: [Sidebar -> Teams -> Personal Account -> Integrations -> Codemagic API](https://codemagic.io/teams)
    - `CODEMAGIC_INTEL_X64_WORKFLOW_ID_PROD`: `<Prod codeMagic workflow id>`
      - Find the relevant workflow id from `codemagic.yaml`, (mostly `macos-intel-x64-build-prod`)
    - `CODEMAGIC_INTEL_X64_WORKFLOW_ID_DEV`: `<Dev codeMagic workflow id>`
      - Find the relevant workflow id from `codemagic.yaml`, (mostly `macos-intel-x64-build-dev`)
    - `PUBLISH_PROD_REPOSITORY`: `<Repository to publish the production app>`
    - `PUBLISH_DEV_REPOSITORY`: `<Repository to publish the dev app>`
    - `CODEMAGIC_PUBLISH_PROJECT_ID`: `<Codemagic intel project id>`
    - `PUBLISH_EMAIL`: `Email address to receive the updates on publish`
    - References:
      - [https://www.electron.build/code-signing.html](https://www.electron.build/code-signing.html)
      - [https://docs.codemagic.io/yaml-code-signing/signing-macos/#saving-the-api-key-to-environment-variables](https://docs.codemagic.io/yaml-code-signing/signing-macos/#saving-the-api-key-to-environment-variables)

### Packaging (locally) and Publishing

Setup the _code signing_ to build, package (locally) and publish the app.

**App Notarization for macOS** (skip this section for non macOS builds)

- Rename _sample.env_ file as _.env_
- To update `APPLEID` and `APPLE_APP_SPECIFIC_PASSWORD` in _.env_ file
- Log into your [Apple Account](https://appleid.apple.com/account/manage 'Apple Account')
- Goto **Sign-In and Security > App-Specific Passwords**
- Click on **Generate Password...**, enter a password label and click _Create_
- Copy the displayed _app-specific-password_
- Run

```shell
security add-generic-password -a "<apple-developer-account-username>" -w <app-specific-password> -s "APPLE_APP_SPECIFIC_PASSWORD"
```

- Log into your [Apple App Store Connect Account](https://appstoreconnect.apple.com/agreements/# 'Apple App Store Connect Account') and accept the presented terms and conditions
- The statuses shall turn _Active_

**Sentry**

- Auth Tokens Settings page: [https://sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)

```shell
npm install -g @sentry/wizard
sentry-wizard --integration electron

# Upload Debug Information
# Everytime the electron.js version is upgraded run:
node sentry-symbols.js

sentry-cli login
```

**Packaging**
Instructions: [https://www.electron.build/code-signing](https://www.electron.build/code-signing 'https://www.electron.build/code-signing')

```shell
$ export GH_TOKEN="<github token>"
```

```shell
# For local platform
$ yarn package

# For multiple platforms
$ yarn package-all
```

### Technical Features

- Built using Electron v17 and React v18
- Loadables, Dynamic Reducer Injection, Selectors for code splitting and performance optimization
- Hot module reload (HMR) for instant feedback
- Inbuilt error logging and profile/settings management
- Industry standard state management
- JSS, SASS/SCSS styling
- Port assigned: **4642**

### Configurations

- _config/env/env.dev.js_ and _config/env/env.prod.js_ contain the PORT number of the app.
- _config/dev-app-update.yml_ file holds the GitHub repo variables required by _electron-updater_.
- _config/google-analytics-key.js_ file contains the Google Analytics Tracking ID.
- _package.json_ **build.publish** object holds the values for publishing the packaged application.
- _app/constants_ folder contains all the constants required by the app.

### Debugging

#### **Debugging Guide**

[https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/400 'Debugging Guide')

#### **Dispatching redux actions from the main process**

[https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/118](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/118 'https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/118')

[https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/108](https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/108 'https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/108')

#### **VM112:2 Uncaught TypeError: Cannot read property 'state' of undefined error**

```shell
# For Mac and Linux
$ UPGRADE_EXTENSIONS=1 npm run dev

# For Windows
$ set UPGRADE_EXTENSIONS=1 && npm run dev
```

### Troubleshooting

#### Your device is not recognized

#### **node-mac-permissions** throws `Speech framework is not compatible with macOS < 10.15`

- On macOS <= 10.14.x (mojave) the `yarn install` will throw a npm-rebuild error
- To "test" or "debug" the app on macOS mojave:
  - remove the `node-mac-permissions` dependency from `package.json`
  - Add the ignorePlugin line to `default.plugins` in the file `webpack/config.base.js`
    - `new webpack.IgnorePlugin({ resourceRegExp: /^(node-mac-permissions)$/u }),`
  - WARNING: **DO NOT commit** these changes to the upstream!!
- The `NODE_MAC_PERMISSIONS_MIN_OS` constant defines the minimum os version that is required to show the macos usage access permission popup
- For distribution make sure to build the app on a machine which is at least 10.15 (Catalina)

[https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on](https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on 'https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on')

- Raise an issue if your device is undetected: https://github.com/ganeshrvel/openmtp/issues/new?template=contribute.md

#### The app goes blank while trying to connect a Samsung device

- Uninstall Samsung SmartSwitch, if installed: [https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29](https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29 'https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29'), [https://github.com/ganeshrvel/openmtp/issues/212](https://github.com/ganeshrvel/openmtp/issues/212 'https://github.com/ganeshrvel/openmtp/issues/212').

#### **Notarizing Electron apps throws - “You must first sign the relevant contracts online. (1048)” error**

[https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on](https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on 'https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on')

### More repos

- [npm: electron-root-path](https://github.com/ganeshrvel/npm-electron-root-path 'Get the root path of an Electron Application')
- [Electron React Redux Advanced Boilerplate](https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate 'Electron React Redux advanced boilerplate')
- [Tutorial Series by Ganesh Rathinavel](https://github.com/ganeshrvel/tutorial-series-ganesh-rathinavel 'Tutorial Series by Ganesh Rathinavel')

### Credits

- A special thanks to [CodeMagic](http://codemagic.io/ 'Codemagic - CI/CD') and [Kevin Suhajda](https://www.linkedin.com/in/kevinsuhajda 'Kevin Suhajda') for sponsoring their CI/CD VMs, thus making the app releases more streamlined and much easier now. 🎊🎊 Do checkout their [products](https://codemagic.io/integrations 'Codemagic - integrations') section for more.

- Special shoutout to [@CodyJung](https://github.com/CodyJung 'CodyJung') for adding the [Fujifilm](https://github.com/ganeshrvel/go-mtpfs/pull/2) and [Garmin](https://github.com/ganeshrvel/go-mtpfs/pull/1) devices support. 🔥🔥

- Thanks to Ms [Ayushi Bothra](https://www.linkedin.com/in/ayushi-bothra-3103/ 'Ayushi Bothra') for contributing to the documentation and pages.

- App logo was contributed by [Shubhendu Mitra](https://www.linkedin.com/in/shubhendum/ 'Shubhendu Mitra - LinkedIn'). Make sure to check out more of his works on [Behance](https://www.behance.net/soponhara 'Shubhendu Mitra - Behance').

- Thanks to [Vladimir Menshakov](https://github.com/whoozle 'Vladimir Menshakov') for [android-file-transfer-linux](https://github.com/whoozle/android-file-transfer-linux 'android-file-transfer-linux') (the MTP legacy Kernel)

- Shoutout to [@yennsarah](https://github.com/yennsarah 'yennsarah'), [@h0tk3y](https://github.com/h0tk3y), [@riginoommen](https://github.com/riginoommen 'riginoommen'), [@AjithKumarvm](https://github.com/AjithKumarvm 'AjithKumarvm'), [@kiranshaji555](https://github.com/kiranshaji555), Dick Cowan, Kjell Dankert, Thorolf E.R. Weißhuhn and to all other community members who helped me test the application.

- This app was built upon [https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate](https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate 'https://github.com/ganeshrvel/electron-react-redux-advanced-boilerplate') which is a heavily modified fork of [https://github.com/electron-react-boilerplate/electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate 'https://github.com/electron-react-boilerplate/electron-react-boilerplate').

- The icons used in the app were made by [flaticon](https://www.flaticon.com), [good-ware](https://www.flaticon.com/authors/good-ware) and [kiranshastry](https://www.flaticon.com/authors/kiranshastry) which is licensed under [CC 3.0 BY](https://creativecommons.org/licenses/by/3.0/ 'Creative Commons BY 3.0').

- The "no image found" icon was made by [Phonlaphat Thongsriphong](https://www.iconfinder.com/phatpc 'Phonlaphat Thongsriphong').

### Contribute

If you are interested in fixing issues and contributing directly to the code base, please see the [guidelines](https://github.com/ganeshrvel/openmtp/blob/master/CONTRIBUTING.md 'guidelines').

### Support OpenMTP

Help me keep the app FREE and open for all.

- Donate Via PayPal: [paypal.me/ganeshrvel](https://paypal.me/ganeshrvel 'https://paypal.me/ganeshrvel')
- Buy Me A Coffee (UPI, PayPal, Credit/Debit Cards, Internet Banking): [buymeacoffee.com/ganeshrvel](https://buymeacoffee.com/ganeshrvel 'https://buymeacoffee.com/ganeshrvel')

### Contacts

Please feel free to contact me at ganeshrvel@outlook.com

### License

OpenMTP | Android File Transfer for macOS is released under [MIT License](https://github.com/ganeshrvel/openmtp/blob/master/LICENSE 'MIT License').

Copyright © 2018-Present Ganesh Rathinavel
