import path from 'path';

/**
 * Resolve the absolute path to the bundled native `kalam.dylib` engine without
 * depending on Electron (`electron-root-path`).
 *
 * The GUI resolves this path via `app/helpers/binaries.js`, which pulls in
 * `electron-root-path` and therefore only works inside the Electron runtime.
 * The CLI runs under plain Node, so it mirrors the same arch-directory layout
 * (`build/<platform>/bin/<arch>/kalam.dylib`) using the repo root instead.
 *
 * @param {Object} [options]
 * @param {string} [options.repoRoot] - Override the repo root (used in tests).
 * @param {string} [options.arch] - Override `process.arch` (used in tests).
 * @param {string} [options.platform] - Override `process.platform` (tests).
 * @returns {string} Absolute path to `kalam.dylib`.
 */
export function resolveKalamLibPath({ repoRoot, arch, platform } = {}) {
  const _arch = arch ?? process.arch;
  const _platform = platform ?? process.platform;

  if (_platform !== 'darwin') {
    throw new Error(
      `The OpenMTP MTP CLI currently only supports macOS (darwin). ` +
        `Detected platform: ${_platform}.`
    );
  }

  // `ffi/kalam/cli/resolveLibPath.js` -> repo root is three levels up.
  const root = repoRoot ?? path.resolve(__dirname, '..', '..', '..');

  const archDir = _arch === 'arm64' ? 'arm64' : 'amd64';

  return path.resolve(
    path.join(root, 'build', 'mac', 'bin', archDir, 'kalam.dylib')
  );
}
