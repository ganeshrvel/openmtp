# OpenMTP Development

Build, package, publish and debug instructions for OpenMTP. For the app itself, see the [README](README.md 'README').

## Building from Source

Requirements: [Node.js v16](https://nodejs.org/en/download/ 'Install Node.js v16'), [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git 'Install Git') and [Yarn package manager](https://yarnpkg.com/lang/en/docs/install/ 'Install Yarn package manager')

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

### Debugging a Packaged App

```shell
# In the terminal, run
$ "/path/to/OpenMTP.app/Contents/MacOS/OpenMTP" --remote-debugging-port=6363
```

- Open a Chromium browser
- Input "about://inspect" into the URL bar
- Add a new connection `localhost:6363`
- Inspect OpenMTP at port `6363`

### Publishing using CI/CD:

- CodeMagic.io
  - Create a new App (Choose others -> Enter Electron)
  - Environment variables:
    - `APPLEID`: `<Apple developer account username>`
    - `APPLE_APP_SPECIFIC_PASSWORD`: `<App-Specific Password>`
      - Log into your [Apple Account](https://appleid.apple.com/account/manage 'Apple Account')
      - Go to **Sign-In and Security > App-Specific Passwords**
      - Click on **Generate Password...**, enter a password label and click _Create_
      - Copy the displayed _app-specific-password_
    - `APPLE_TEAM_ID`: `<Apple Team ID>`
      - To get Team ID, go to your [Apple Developer Account](https://developer.apple.com/account#MembershipDetailsCard)
      - Then click on "Membership details", and there you will find your Team ID.
    - `SENTRY_URL`: `https://sentry.io/`
    - `SENTRY_ORG`: `<Sentry Organization Name>`
    - `SENTRY_PROJECT`: `<Sentry Project>`
    - `SENTRY_TOKEN_ID`: `<Sentry Auth Token>`
      - Find it from here: [Auth Tokens](https://sentry.io/settings/account/api/auth-tokens)
      - Scopes: `event:admin, event:read, member:read, org:read, project:read, project:releases, team:read`
    - `GITHUB_TOKEN`: `Personal access token`
      - There are two options available:
        1. **Fine-grained personal access tokens**
        - https://github.com/settings/tokens?type=beta
        - Permissions: `Contents - (Read and Write access to code)`
        2. **Personal access tokens (classic)**
        - https://github.com/settings/tokens
        - Scopes: `admin:gpg_key, admin:public_key, repo, user, workflow`
    - `CSC_LINK`:
      - Keychain -> `Default Keychains` menu in the left -> Login -> My Certificates
      - Search for `Developer ID Application` in the top search bar
        - If there are no results for the `Developer ID Application`, for the organization, create one from here: [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/add)
        - Follow these steps to get the Apple Developer certificate installed on the local machine [Obtaining-an-Apple-Developer-ID-Certificate-for-macOS-Provisioning](https://forums.ivanti.com/s/article/Obtaining-an-Apple-Developer-ID-Certificate-for-macOS-Provisioning?language=en_US&ui-force-components-controllers-recordGlobalValueProvider.RecordGvp.getRecord=1)
      - Search for `Developer ID Application` in the top search bar
      - Expand `Developer ID Application: <User Name> (XXXYYYZZZ)`
      - See if the private key's name matches this: `Mac Developer ID Application: <User Name>`
        - Otherwise, rename the private key as (right click -> get info) `Mac Developer ID Application: <User Name>`
        - Close the window
      - Right-click on the private key -> `Mac Developer ID Application: <User Name>`
      - Export `Mac Developer ID Application: <User Name>`
      - File name: `CERTIFICATE_PRIVATE_KEY.p12`
      - Enter Password. This is the `CSC_KEY_PASSWORD`, note this down
      - Run (this step doesn't work if you are using fig or ohmyzsh, use raw terminal):
        - `base64 -i CERTIFICATE_PRIVATE_KEY.p12 -o CERTIFICATE_PRIVATE_KEY.txt`
      - Copy the whole content of the file `CERTIFICATE_PRIVATE_KEY.txt`
      - Paste the content as the value for the field `CSC_LINK`
    - `CSC_KEY_PASSWORD` is the password from the above step
    - `CODEMAGIC_AUTH_TOKEN_ID`: `<CodeMagic API Token>`
      - Find it from here: [Sidebar -> Teams -> Personal Account -> Integrations -> Codemagic API](https://codemagic.io/teams)
    - `CODEMAGIC_INTEL_X64_WORKFLOW_ID_PROD`: `<Prod Codemagic workflow id>`
      - Find the relevant workflow id from `codemagic.yaml`, (mostly `macos-intel-x64-build-prod`)
    - `CODEMAGIC_INTEL_X64_WORKFLOW_ID_DEV`: `<Dev Codemagic workflow id>`
      - Find the relevant workflow id from `codemagic.yaml`, (mostly `macos-intel-x64-build-dev`)
    - `PUBLISH_PROD_REPOSITORY`: `<Repository to publish the production app>`
    - `PUBLISH_DEV_REPOSITORY`: `<Repository to publish the dev app>`
    - `CODEMAGIC_PUBLISH_PROJECT_ID`: `<Codemagic intel project id>`
    - `PUBLISH_EMAIL`: `Email address to receive the updates on publish`
    - References:
      - [https://www.electron.build/code-signing.html](https://www.electron.build/code-signing.html)
      - [https://docs.codemagic.io/yaml-code-signing/signing-macos/#saving-the-api-key-to-environment-variables](https://docs.codemagic.io/yaml-code-signing/signing-macos/#saving-the-api-key-to-environment-variables)

### Packaging (locally) and Publishing

Set up the _code signing_ to build, package (locally) and publish the app.

**App Notarization for macOS** (skip this section for non-macOS builds)

- Rename _sample.env_ file as _.env_
- To update `APPLEID` and `APPLE_APP_SPECIFIC_PASSWORD` in the _.env_ file
- Log into your [Apple Account](https://appleid.apple.com/account/manage 'Apple Account')
- Go to **Sign-In and Security > App-Specific Passwords**
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
# Every time the electron.js version is upgraded, run:
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
- Built-in error logging and profile/settings management
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

- On macOS <= 10.14.x (Mojave) the `yarn install` will throw a npm-rebuild error
- To "test" or "debug" the app on macOS Mojave:
  - remove the `node-mac-permissions` dependency from `package.json`
  - Add the ignorePlugin line to `default.plugins` in the file `webpack/config.base.js`
    - `new webpack.IgnorePlugin({ resourceRegExp: /^(node-mac-permissions)$/u }),`
  - WARNING: **DO NOT commit** these changes to the upstream!!
- The `NODE_MAC_PERMISSIONS_MIN_OS` constant defines the minimum OS version that is required to show the macOS usage access permission pop-up
- For distribution, make sure to build the app on a machine which is at least 10.15 (Catalina)

[https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on](https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on 'https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on')

- Raise an issue if your device is undetected: https://github.com/ganeshrvel/openmtp/issues/new?template=contribute.md

#### The app goes blank while trying to connect a Samsung device

- Uninstall Samsung Smart Switch if installed: [https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29](https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29 'https://farazfazli.medium.com/how-i-reverse-engineered-keis-and-sidesync-and-fixed-mtp-8949acbb1c29'), [https://github.com/ganeshrvel/openmtp/issues/212](https://github.com/ganeshrvel/openmtp/issues/212 'https://github.com/ganeshrvel/openmtp/issues/212').

#### **Notarizing Electron apps throws - “You must first sign the relevant contracts online. (1048)” error**

[https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on](https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on 'https://stackoverflow.com/questions/58358449/notarizing-electron-apps-throws-you-must-first-sign-the-relevant-contracts-on')
