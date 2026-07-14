# Building from Source

## Requirements

- [Node.js v16](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/)
- [Yarn](https://yarnpkg.com/)

## Clone & Install

```shell
git clone https://github.com/ganeshrvel/openmtp.git
cd openmtp

npm install -g yarn
npm -g i @sentry/cli

yarn
```

## Run (Development)

A fresh clone may throw an _undefined state_ error. Run once to fix:

```shell
# macOS / Linux
UPGRADE_EXTENSIONS=1 npm run dev

# Windows
set UPGRADE_EXTENSIONS=1 && npm run dev
```

Then start the dev server:

```shell
yarn dev
```

For pre-production:

```shell
yarn start
```

## Debug a Packaged App

```shell
# Terminal
/path/to/OpenMTP.app/Contents/MacOS/OpenMTP --remote-debugging-port=6363
```

1. Open a Chromium browser.
2. Navigate to `about://inspect`.
3. Add connection `localhost:6363`.
4. Inspect the app.

## Available Scripts

| Script             | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `yarn dev`         | Development server with HMR                  |
| `yarn start`       | Pre-production (packaged renderer, dev main) |
| `yarn build`       | Production build (lint + webpack)            |
| `yarn package`     | Package for current platform                 |
| `yarn package-all` | Package for macOS + Windows + Linux          |
| `yarn package-mac` | Package for macOS only                       |
| `yarn lint`        | Run ESLint                                   |

## Project Structure

```
openmtp/
├── app/                    # Electron renderer (React)
│   ├── components/         # Reusable UI components
│   ├── containers/         # Page-level components
│   ├── helpers/            # Business logic
│   ├── services/           # IPC, analytics, sentry
│   ├── store/              # Redux store configuration
│   ├── classes/            # Boot, Storage, etc.
│   └── main.dev.js         # Electron main process
├── ffi/
│   └── kalam/              # Go MTP kernel (kalam.dylib)
├── internals/              # Build scripts
├── webpack/                # Webpack configs (base, dev, prod, dll)
├── docs/                   # Documentation
└── package.json
```

## Tech Stack

- **Electron** 18 (main process + renderer)
- **React** 17 + Redux + react-router
- **Webpack** 5 (dev server with HMR + production build)
- **Material UI** 4 (components)
- **Kalam**: Go MTP kernel via koffi FFI
- **Legacy**: mtp-cli binary (fallback for older macOS)
