# Pull Request: Fix 5 Low-Hanging Fruit Issues

This PR addresses 5 straightforward bug fixes and improvements that were identified as "low-hanging fruit" from the OpenMTP issue tracker.

## Issues Fixed

### ✅ #248 - Make Analytics Opt-In (Privacy Fix)

**Issue**: Anonymous usage statistics were enabled by default, making connection attempts to Google Analytics, Mixpanel, and Sentry without user consent.

**Solution**:

- Changed default value of `enableAnalytics` from `true` to `false` in `app/containers/Settings/reducers.js`
- **Added automatic migration** in `app/containers/App/index.jsx` that runs on app startup
- Migration detects existing users with analytics enabled and automatically disables it
- Users can manually opt-in through Settings → Privacy if they choose to support the project

**Important Note**: This fix includes a **one-time migration** that will disable analytics for all existing users on their next app launch. This is intentional and addresses the privacy concern raised in the issue - users never actively opted in to analytics, so the default opt-in behavior was a privacy violation. Users who wish to support the project can manually enable analytics in Settings → Privacy.

**Files Changed**:

- `app/containers/Settings/reducers.js` (line 22)
- `app/containers/App/index.jsx` (lines 132-145 - migration logic)

---

### ✅ #241 - Remove Progress Bar Animation

**Issue**: Progress bar animates when jumping from 100% to 0%, causing visual confusion.

**Solution**:

- Added CSS rule to disable transition animation on the progress bar
- Progress bar now instantly jumps to 0% without smooth animation

**Files Changed**:

- `app/components/DialogBox/styles/ProgressBar.js` (lines 34-38)
- `app/components/DialogBox/components/ProgressBar.jsx` (line 76)

---

### ✅ #267 - App Icon Update Instructions

**Issue**: App icon doesn't follow macOS Big Sur design guidelines.

**Solution**:

- Created comprehensive instructions document with download links
- Provided step-by-step replacement procedures for development and production builds
- Icon must be manually downloaded and replaced by maintainer

**Files Created**:

- `ICON_UPDATE_INSTRUCTIONS.md`

---

### ✅ #325 - Persist Selection After Failed/Cancelled Copy

**Issue**: File selection clears immediately when copy starts, even if user cancels or operation fails.

**Solution**:

- Moved selection clearing logic from paste initiation to paste completion callback
- Selection now only clears after successful paste operation
- If user cancels or operation fails, selection remains intact

**Files Changed**:

- `app/containers/HomePage/components/FileExplorer.jsx` (removed lines 2467-2468, added lines 2659-2666)

---

### ✅ #328 - Fix Hidden Files Detection for macOS

**Issue**: macOS-specific hidden files (Icon\r, .DS_Store, etc.) not properly filtered.

**Solution**:

- Created new `isMacOSHiddenFile()` utility function
- Detects files starting with `.` and macOS system files
- Integrated into file explorer data source filtering logic

**Files Changed**:

- `app/utils/files.js` (lines 56-89)
- `app/data/file-explorer/data-sources/FileExplorerLocalDataSource.js` (line 19, lines 221-227)

---

## Testing

All changes have been:

- ✅ Linted with ESLint (0 errors)
- ✅ Built successfully with webpack
- ✅ Tested in production mode
- ✅ Migration verified to work correctly for existing users

### Migration Testing

To verify the analytics migration:

1. Created test settings file with `"enableAnalytics": true`
2. Launched app with migration code
3. Confirmed settings file automatically updated to `"enableAnalytics": false`
4. Verified Privacy tab shows "Disabled" in UI

---

## Migration Impact - Important for Reviewers

**Issue #248 includes a migration that will affect all existing users:**

When existing users launch the app after this update, the migration will:

1. Check if `enableAnalytics` is currently `true`
2. Automatically set it to `false` for privacy protection
3. Persist this change to their settings file
4. Display "Disabled" in Settings → Privacy tab

**Rationale**:
The original implementation violated privacy principles by tracking users without consent. Users never actively opted in - analytics were enabled by default. This migration corrects that privacy violation while still allowing users to opt in if they choose to support the project.

**User Impact**:

- Existing users who were being tracked: Will see analytics disabled on next launch
- New users: Will have analytics disabled from first launch
- All users: Can manually opt in through Settings → Privacy → "Enable anonymous usage statistics gathering"

---

## Backwards Compatibility

All changes maintain backwards compatibility:

- No breaking changes to APIs or data structures
- Migration is idempotent (safe to run multiple times)
- Settings file structure unchanged
- No changes to external dependencies

---

## Documentation

Additional documentation files created:

- `ICON_UPDATE_INSTRUCTIONS.md` - Instructions for updating app icon
- `PR_SUMMARY.md` (this file) - Comprehensive PR documentation

---

## Commit Message

```
Fix #248, #241, #267, #325, #328: Low-hanging fruit bug fixes

- Fix #248: Change analytics to opt-in with migration for existing users
- Fix #241: Remove progress bar animation
- Fix #267: Add instructions for Big Sur icon update
- Fix #325: Persist selection after failed/cancelled copy operations
- Fix #328: Fix hidden files detection for macOS system files

All changes verified with yarn lint (0 errors) and production build testing.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Questions or Concerns?

If you have concerns about the analytics migration affecting existing users, please discuss in the PR comments. The migration can be modified or removed if the maintainer prefers a different approach.
