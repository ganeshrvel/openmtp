#!/usr/bin/env node
/* eslint-disable no-process-exit */

/**
 * OpenMTP MTP CLI entry point.
 *
 * Drives the native "Kalam" MTP engine from the terminal so that MTP file
 * operations can be scripted/automated on macOS, where libusb-based CLIs fail
 * to claim the device's USB interface (libusb_claim_interface() = -3).
 *
 * Run via: `yarn mtp-cli <command>` (see package.json) or, after a build, the
 * `openmtp-cli` bin. Requires the bundled `kalam.dylib` (shipped in
 * `build/mac/bin/<arch>/`).
 */
import { run } from './mtpCli';

(async () => {
  const argv = process.argv.slice(2);
  const exitCode = await run(argv);

  process.exit(exitCode);
})();
