# Icon Update Instructions for Issue #267

## Current Status

The current app icon does not follow macOS Big Sur design guidelines (rounded rectangle shape).

## What Needs to Be Done

### 1. Download the Big Sur-styled Icon

**Option A: From icon-icons.com (Recommended)**

- URL: https://icon-icons.com/icon/OpenMTP-macOS-BigSur/189870
- Download formats needed:
  - ICNS format (for macOS app)
  - PNG formats: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

**Option B: From macosicons.com**

- URL: https://macosicons.com/#/u/openmtp
- Download the OpenMTP icon package

**Option C: Create Your Own**

- Use Apple's official template: https://developer.apple.com/design/resources/#macos-apps
- Follow Big Sur design guidelines: https://developer.apple.com/design/human-interface-guidelines/foundations/app-icons#platform-considerations
- Icon should be a rounded rectangle with proper shadows and depth

### 2. Replace Current Icons

Replace the following files:

```bash
# Main icon file
build/icon.icns

# PNG variants
build/icons/16x16.png
build/icons/32x32.png
build/icons/64x64.png
build/icons/128x128.png
build/icons/256x256.png
build/icons/512x512.png
build/icons/1024x1024.png

# Additional icon files
build/icon.png
build/icon.ico (for Windows builds, if applicable)
app/app.icns
```

### 3. Verify Icon Format

The ICNS file should contain multiple resolutions:

- 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
- Both standard and @2x retina versions

### 4. Test the Icon

After replacing:

```bash
# Rebuild the app
yarn build

# Package for testing
yarn package-mac-without-notarize

# Check the icon appears correctly in:
# - Application bundle
# - macOS Dock
# - Finder
# - Application switcher (Cmd+Tab)
```

### 5. Commit Changes

```bash
git add build/icon.icns build/icons/* build/icon.png app/app.icns
git commit -m "Fix #267: Update app icon to Big Sur rounded-rectangle style"
```

## Notes

- The Big Sur style uses a rounded rectangle shape with specific corner radius
- Icons should have depth and shadow for the "lifted" appearance
- Background should be a gradient or solid color
- Icon should work on both light and dark backgrounds

## References

- Apple Design Guidelines: https://developer.apple.com/design/human-interface-guidelines/foundations/app-icons
- Big Sur Icon Template: https://developer.apple.com/design/resources/#macos-apps
- Issue #267: https://github.com/ganeshrvel/openmtp/issues/267
