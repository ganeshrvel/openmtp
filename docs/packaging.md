# Packaging & CI/CD

## Code Signing & Notarization (macOS)

### Prerequisites

1. An [Apple Developer](https://developer.apple.com) account (paid).
2. A **Developer ID Application** certificate installed in your Keychain.
   - Create one at [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates/add) if missing.
3. An [app-specific password](https://appleid.apple.com/account/manage) for notarization.

### Setup

Create `.env` from `sample.env`:

```shell
cp sample.env .env
```

Add your Apple ID credentials:

```shell
security add-generic-password -a "<apple-id>" -w <app-specific-password> -s "APPLE_APP_SPECIFIC_PASSWORD"
```

Accept Apple's latest agreements at [App Store Connect](https://appstoreconnect.apple.com/agreements/).

### Export the Signing Certificate

1. Open Keychain Access → Login → My Certificates.
2. Search for `Developer ID Application`.
3. Right-click the private key → Export as `CERTIFICATE_PRIVATE_KEY.p12`.
4. Set a password (`CSC_KEY_PASSWORD`).
5. Encode for CI:

```shell
base64 -i CERTIFICATE_PRIVATE_KEY.p12 -o CERTIFICATE_PRIVATE_KEY.txt
```

### Sentry

```shell
npm install -g @sentry/wizard
sentry-wizard --integration electron

# Upload debug symbols after upgrading Electron
node sentry-symbols.js

sentry-cli login
```

- Auth Tokens: https://sentry.io/settings/account/api/auth-tokens/
- Scopes needed: `event:admin, event:read, member:read, org:read, project:read, project:releases, team:read`

### Build & Package

```shell
export GH_TOKEN="<github-token>"

# Current platform
yarn package

# All platforms
yarn package-all
```

## CI/CD: CodeMagic

1. Create a new app on [CodeMagic](https://codemagic.io) (Choose Others → Enter Electron).
2. Set these environment variables:

| Variable                      | Value                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `APPLEID`                     | Apple Developer account email                                                                |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password                                                                        |
| `APPLE_TEAM_ID`               | Team ID from [Membership Details](https://developer.apple.com/account#MembershipDetailsCard) |
| `SENTRY_URL`                  | `https://sentry.io/`                                                                         |
| `SENTRY_ORG`                  | Sentry organization name                                                                     |
| `SENTRY_PROJECT`              | Sentry project name                                                                          |
| `SENTRY_TOKEN_ID`             | Sentry auth token                                                                            |
| `GITHUB_TOKEN`                | GitHub personal access token (repo scope)                                                    |
| `CSC_LINK`                    | Base64-encoded `.p12` certificate                                                            |
| `CSC_KEY_PASSWORD`            | Certificate password                                                                         |
| `CODEMAGIC_AUTH_TOKEN_ID`     | CodeMagic API token                                                                          |

References:

- [electron-build code signing](https://www.electron.build/code-signing.html)
- [CodeMagic macOS signing](https://docs.codemagic.io/yaml-code-signing/signing-macos/)
