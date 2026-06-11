import { kalamLibPath } from '../../../app/helpers/binaries';
import { log } from '../../../app/utils/log';
import { KalamEngine } from './KalamEngine';

/**
 * Kalam
 *
 * GUI-facing wrapper around the Electron-free {@link KalamEngine}. It simply
 * injects the Electron-resolved `kalamLibPath` and the Sentry-backed `log` so
 * that the rest of the Electron app can keep calling `new Kalam()` with no
 * arguments exactly as before.
 *
 * All of the actual koffi FFI binding to the native `kalam.dylib` engine lives
 * in {@link KalamEngine}, which is shared with the MTP CLI (`ffi/kalam/cli`).
 */
export class Kalam extends KalamEngine {
  constructor() {
    super({ libPath: kalamLibPath, logger: log });
  }
}
