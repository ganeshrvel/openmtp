# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenMTP is an Advanced Android File Transfer Application for macOS built with Electron 18 and React 17. It enables file transfers between macOS and Android/MTP devices using USB with a custom MTP kernel called "Kalam" written in Go.

**System Requirements:** macOS 11.0 (Big Sur) or higher
**Port:** 4642
**Node Version:** v16 or above

## Common Commands

### Development

```bash
# First run (fixes undefined state error)
UPGRADE_EXTENSIONS=1 npm run dev

# Normal development
yarn dev

# Pre-production
yarn start

# Build for development (with Kalam kernel)
./ffi/kalam/native/scripts/build.sh && yarn dev
```

### Build & Package

```bash
# Full build with linting
yarn build

# Build without linting
yarn build-no-verify

# Package for current platform
yarn package

# Package for all platforms
yarn package-all

# Package for Mac (with notarization)
yarn package-mac

# Package for Mac (without notarization, faster for testing)
yarn package-mac-without-notarize
```

### Linting & Code Quality

```bash
# Lint JavaScript
yarn lint

# Lint styles
yarn lint-styles

# Auto-fix JavaScript issues
yarn lint-fix

# Auto-fix style issues
yarn lint-styles-fix
```

### Publishing

```bash
# Publish to Mac (with build)
yarn publish-mac

# Publish to Mac (without linting)
yarn publish-mac-no-verify
```

### Debugging a Packaged App

```bash
# Run packaged app with remote debugging
"/path/to/OpenMTP.app/Contents/MacOS/OpenMTP" --remote-debugging-port=6363
```

Then open Chromium browser, go to `about://inspect`, add connection `localhost:6363`, and inspect OpenMTP.

## Architecture

### High-Level Structure

OpenMTP follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│  Electron Main Process (app/main.dev.js)               │
│  - Window management, IPC events, USB detection         │
│  - Boot loader, app updates, menu                       │
└─────────────────────────────────────────────────────────┘
                          ↕ IPC
┌─────────────────────────────────────────────────────────┐
│  React Renderer Process (app/index.js)                  │
│  - Redux store, React components, routing               │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│  Data Layer (app/data/file-explorer/)                   │
│  Controller → Repository → Data Sources                 │
│  (Local, Kalam, Legacy)                                 │
└─────────────────────────────────────────────────────────┘
                          ↕ FFI
┌─────────────────────────────────────────────────────────┐
│  Kalam Kernel (ffi/kalam/native/)                       │
│  - Go binaries for MTP operations                       │
│  - Uses go-mtpx package                                 │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

1. **Clean Architecture for File Operations**

   - `FileExplorerController`: Orchestrates file operations and analytics
   - `FileExplorerRepository`: Abstracts data source selection
   - `FileExplorerDataSource`: Three implementations:
     - `FileExplorerLocalDataSource`: Local filesystem operations
     - `FileExplorerKalamDataSource`: Kalam kernel (modern MTP)
     - `FileExplorerLegacyDataSource`: Legacy MTP mode

2. **Redux State Management**

   - Dynamic reducer injection for code splitting
   - Store configured in `app/store/configureStore/`
   - Separate dev/prod configurations with hot reloading support
   - Redux DevTools integration in development

3. **IPC Communication**

   - `IpcEventService` handles main ↔ renderer communication
   - Event types defined in `app/services/ipc-events/IpcEventType.js`
   - Windows created via `app/helpers/createWindows.js`

4. **Dual-Pane File Explorer**
   - `HomePage` container manages split-pane view
   - Each pane can show Local or MTP device
   - `DEVICE_TYPE` enum distinguishes between local/mtp
   - Configurable via Settings (show/hide local pane, left/right position)

### MTP Modes

The application supports two MTP modes:

- **Kalam Mode** (modern): Fast, full-featured MTP kernel (30-120 MB/s)

  - Built from Go source in `ffi/kalam/native/`
  - Requires macOS 11.0+
  - Uses FFI via `koffi` library

- **Legacy Mode**: Fallback for older systems or incompatible devices
  - Based on android-file-transfer-linux
  - Limited features (e.g., no file size info)

Mode selection stored in settings, queried via `getMtpModeSetting()`.

### Important Directories

- `app/containers/`: React container components (HomePage, Settings, etc.)
- `app/components/`: Reusable React components
- `app/helpers/`: Utility functions (settings, device info, file ops, logs)
- `app/services/`: Analytics, IPC events, Sentry integration
- `app/constants/`: App-wide constants (paths, keymaps, meta, env)
- `app/enums/`: Enums (DEVICE_TYPE, MTP_MODE, events, errors)
- `app/utils/`: Low-level utilities (log, date, event handling, etc.)
- `ffi/kalam/native/`: Go source for Kalam MTP kernel
- `build/mac/bin/`: Compiled binaries (Kalam dylib, mtp-cli)
- `webpack/`: Webpack configurations for main/renderer processes

### State Management Flow

1. User interacts with FileExplorer component
2. Component dispatches Redux action (e.g., from `containers/HomePage/actions.js`)
3. Action processed by reducer (with optional async operations via thunk)
4. Reducer updates state
5. Selector (using reselect) computes derived state
6. Component re-renders with new props

### Boot Process

The `bootLoader()` function (in `app/helpers/bootHelper.js`) checks:

- System permissions (USB access via `node-mac-permissions`)
- Kalam kernel availability (`isKalamModeSupported()`)
- Device bootability

If device not bootable, shows `nonBootableDeviceWindow()`.

## Kalam Kernel Development

The Kalam kernel is a Go-based MTP implementation using FFI.

### Building Kalam Kernel

```bash
cd ffi/kalam/native

# Update dependencies
go get -u

# Upgrade specific package
go get github.com/ganeshrvel/go-mtpx@<git-commit-hash>

# Build (from project root)
cd /path/to/openmtp
zx ./ffi/kalam/native/scripts/build.mjs
```

### Prerequisites for Kalam Build

```bash
# Install dependencies
xcode-select --install
brew install llvm gcc pkg-config libusb

# Add to ~/.zshrc
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
export SDKROOT=$(xcrun --sdk macosx --show-sdk-path)

source ~/.zshrc
```

### Kalam FFI Integration

- JS calls Go functions via `koffi` FFI library
- Data sources invoke Kalam operations through repository pattern
- Kalam binaries stored in `build/mac/bin/{arm64,amd64}/kalam.dylib`
- Separate binaries for ARM64 (Apple Silicon) and AMD64 (Intel)

## Configuration Files

- `config/env/env.dev.js` & `config/env/env.prod.js`: Environment configs (PORT, etc.)
- `config/dev-app-update.yml`: GitHub repo variables for electron-updater
- `config/google-analytics-key.js`: Google Analytics tracking ID
- `package.json` build.publish: Publishing configuration
- `electron-builder-config.js`: Electron Builder configuration for packaging
- `.env`: Local environment variables (APPLEID, APPLE_APP_SPECIFIC_PASSWORD for notarization)
- `sample.env`: Template for .env file

## Testing

This project does not currently have automated tests configured.

## Code Style

- ESLint with Airbnb config + Prettier
- Husky pre-commit hooks run linting
- JSX for React components
- JSS and SASS/SCSS for styling
- Material-UI components used throughout

## Contribution Workflow

1. Create a new issue on GitHub
2. Fork and create branch from **master**
3. Make changes and ensure linting passes (`yarn lint`)
4. Add meaningful commit messages with issue URL
5. Issue pull request to **development** branch
6. Add a reviewer

## Key Dependencies

- **electron**: Desktop app framework (v18)
- **react** + **react-dom**: UI framework (v17)
- **redux** + **react-redux**: State management
- **redux-thunk**: Async actions
- **reselect**: Memoized selectors
- **@electron/remote**: Remote module for renderer process
- **koffi**: FFI library for calling Go/C functions
- **usb-detection**: USB hotplug event detection
- **fs-extra**: Enhanced filesystem operations
- **@sentry/electron**: Error tracking
- **electron-updater**: Auto-update functionality

## Common Issues & Solutions

### "Undefined state" error on fresh clone

```bash
UPGRADE_EXTENSIONS=1 npm run dev
```

### node-mac-permissions error on macOS ≤ 10.14

For testing on Mojave only (DO NOT commit):

1. Remove `node-mac-permissions` from package.json
2. Add to `webpack/config.base.js` default.plugins:
   ```js
   new webpack.IgnorePlugin({ resourceRegExp: /^(node-mac-permissions)$/u });
   ```

### Samsung device causes blank screen

Uninstall Samsung SmartSwitch if installed.

### stdlib.h not found error (Kalam build)

Add to `~/.zshrc`:

```bash
export SDKROOT=$(xcrun --sdk macosx --show-sdk-path)
source ~/.zshrc
```

## Analytics & Monitoring

- **Google Analytics**: Tracks user interactions (electron-ga)
- **Mixpanel**: Additional analytics
- **Sentry**: Error logging and crash reporting
  - Upload debug symbols after Electron version upgrade: `node sentry-symbols.js`
  - Auth token required (see README for scopes)

## CI/CD

Builds are automated via CodeMagic.io with workflows defined in `codemagic.yaml`:

- Separate workflows for Intel (x64) and ARM64 builds
- Dev and production build variants
- Automated notarization and publishing to GitHub releases

Environment variables needed for CI/CD are documented in README.md (Section: "Publishing using CI/CD").

## Known Issues & Open Bugs

As of October 2025, there are 100 open issues in the GitHub repository. Key recurring themes:

### Critical Bugs

- **#431, #420**: File timestamps incorrect (timezone offset issues)
- **#429**: Empty directories not copied
- **#427**: File copy freezes with unusual characters in filenames
- **#425**: Kalam mode not working for some users
- **#418**: Mobile storage not cleared after deletion
- **#408**: Files transferred show as zero bytes
- **#406**: Poor multiple device handling
- **#403, #399**: Not working on macOS Sequoia 15.1.1 / Sequoia in general
- **#413**: M4 MacBook Pro can't recognize Xiaomi phones
- **#411**: Kalam mode issues with Sequoia + Android 14
- **#394**: File transfer fails to start
- **#387**: "Error occurred while reading MTP file object"
- **#353**: Slow file transfer (freeze at 100% per file)

### Device Compatibility Issues

- **#336**: Cannot connect to Pixel Pro with Android 14
- **#341**: Samsung phones fail to connect
- **#393**: Not connecting to Pixel 6a
- **#414**: Cannot open Pixel 6 Pro Android 15
- **#390**: Xiaomi 13T Pro not recognized
- **#270**: Samsung Galaxy S20+ not recognized
- **#389**: Garmin Edge 1050 doesn't work

### macOS Compatibility

- **#430**: System-wide lag on macOS 26 (Electron needs update)
- **#391**: Not working with Sonoma 14.6.1
- **#396**: Need to restart Mac after disconnecting phone
- **#239**: Crashes on macOS Monterey 12 Beta

### Feature Requests (Enhancement)

- **#428**: Group select functionality missing
- **#419**: Use computer's default file explorer
- **#415**: Option to transfer without duplicates
- **#402**: Show total and used disk size
- **#395**: Support bookmark current path
- **#388**: Translate to other languages
- **#384**: Organize existing files without copying
- **#369**: "List View" option
- **#352**: Disable "overall progress" by default
- **#351**: Mount `/` instead of `/storage/emulated/0/`
- **#349**: Calculate & display folder sizes
- **#344**: Favorites feature
- **#342**: Skip files already on destination
- **#331**: Click-drag for multiple file selection
- **#330**: Compact list option
- **#327**: Universal macOS binary
- **#325**: Don't discard selection after copy
- **#316**: Click + Shift+click range selection
- **#309**: Search for specific file format/name
- **#306**: Skip existing files
- **#267**: Round-rectangle icon for Big Sur style
- **#264**: Add folders to Favorites
- **#263**: Windows version request
- **#248**: Make analytics opt-in instead of opt-out
- **#246**: Crypto donation link
- **#243**: Group selection of large files
- **#242**: Image thumbnails
- **#238, #237**: Skip duplicates, avoid animations

### UX Issues

- **#386**: Forced app restart after auto-update
- **#381**: Update blocks all operations
- **#365**: Illegal character confusion/bad UX
- **#308**: 15-second wait per file after transfer
- **#313**: Transfer speeds and MBs differ
- **#328**: Show hidden files setting doesn't work
- **#295**: Need throbber/"working" indicator
- **#265**: Can't drag and drop inside phone
- **#257**: Files with emoji in name cannot be moved
- **#256**: Copied timestamp doesn't copy timezone
- **#241**: File progress bar should jump to 0, not animate
- **#240**: Make file listing asynchronous for large folders
- **#227**: Refuses to transfer files with question marks

### Interference Issues

- **#426**: App connects to internet despite features disabled (security/privacy concern)
- **#421**: Another program blocks OpenMTP
- **#350**: Won't connect after using Samsung Smart Switch
- **#245**: Google Drive/Dropbox interfere with OpenMTP

### Setup/Recognition Issues

- **#422**: JavaScript error preventing MTP open
- **#329, #300**: "Error occurred while setting up the phone"
- **#334**: Cannot copy WhatsApp Images folder
- **#333**: Cannot open large folders (1.9TB, 5200 items)
- **#366**: Session closed when browsing folders with too many items
- **#276, #262**: Blank screen or device not recognized
- **#249**: Just a big blank window

Use `gh issue view <number>` to get detailed information about any specific issue.

## Low-Hanging Fruit Bugs (Easy Fixes)

These issues could be resolved relatively quickly and have existing PRs or clear solutions:

### Issues with Existing PRs (Review/Merge Needed)

- **#386: Forced App Restart After Update** - PR #392 already implements "update on quit" functionality
- **#349: Calculate & Display Folder Sizes** - PR #404 implements this feature

### Quick Wins (No PR Yet)

1. **#241: Progress Bar Animation** ⭐ EASIEST

   - **Issue:** Progress bar animates to 0% instead of jumping instantly between files
   - **Location:** `app/components/DialogBox/components/ProgressBar.jsx:75-79`
   - **Fix:** Add CSS override or prop to disable Material-UI LinearProgress transition
   - **Difficulty:** Very Easy (CSS/props change)
   - **Estimated Time:** 10-15 minutes

2. **#248: Analytics Opt-In Instead of Opt-Out** ⭐⭐ HIGH IMPACT

   - **Issue:** Analytics (Google Analytics, Mixpanel, Sentry) enabled by default - privacy concern
   - **Location:** `app/containers/Settings/reducers.js:22`
   - **Current:** `enableAnalytics: true,`
   - **Fix:** Change to `enableAnalytics: false,` + optionally add first-run opt-in dialog
   - **Difficulty:** Easy (1-line for basic fix, +2 hours for opt-in dialog)
   - **Estimated Time:** 5 minutes (basic) or 2-3 hours (with dialog)
   - **Impact:** HIGH - Addresses legitimate privacy concerns

3. **#325: Don't Discard Selection After Copy** ⭐⭐

   - **Issue:** Selection cleared after copy, even if copy fails/is cancelled
   - **Location:** Search for selection clearing in `app/containers/HomePage/components/`
   - **Fix:** Only clear selection on successful copy, maintain on error/cancel
   - **Difficulty:** Easy-Medium
   - **Estimated Time:** 2-3 hours
   - **Impact:** Significant UX improvement

4. **#267: Update App Icon to Big Sur Style** ⭐

   - **Issue:** Icon not following macOS Big Sur rounded-rectangle guidelines
   - **Location:** `build/icon.icns` and icon files in `build/icons/`
   - **Fix:** Use existing icon from https://macosicons.com/ or create new rounded version
   - **Difficulty:** Easy (asset replacement only)
   - **Estimated Time:** 15-30 minutes
   - **Impact:** Professional appearance

5. **#328: Show Hidden Files Setting Doesn't Work** ⭐⭐
   - **Issue:** macOS hidden files still show despite setting disabled
   - **Current:** Only hides files starting with "." (Unix convention)
   - **Problem:** Doesn't handle macOS-specific hidden files (e.g., "Icon" file)
   - **Location:** `app/data/file-explorer/data-sources/FileExplorer*DataSource.js`
   - **Fix:** Extend hidden file detection for macOS file attributes
   - **Difficulty:** Medium
   - **Estimated Time:** 3-4 hours
   - **Impact:** Fixes reported bug

### Recommended Implementation Order

1. **#248** (5 min) - Change default `enableAnalytics: false` - Immediate privacy win
2. **#241** (15 min) - Fix progress bar animation - Easy CSS fix
3. **#267** (30 min) - Update app icon - Simple asset replacement
4. Review/test **PR #392** (#386) - Update on quit functionality
5. Review/test **PR #404** (#349) - Folder size display
6. **#325** (2-3 hrs) - Persist selection after failed copy
7. **#328** (3-4 hrs) - Fix hidden files on macOS
