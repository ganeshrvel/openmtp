import { exec } from 'child_process';
import { log } from '../utils/log';

/**
 * macOS starts these on demand for any device exposing an MTP/PTP interface
 * and they hold that interface exclusively. While they hold it, libusb cannot
 * claim interface 0: `ClaimInterface` returns `LIBUSB_ERROR_ACCESS` and the
 * first transfer then fails with `LIBUSB_ERROR_NOT_FOUND`, which surfaces as
 * `ErrorDeviceSetup`. The phone stays visible to `adb` throughout, because adb
 * speaks to a different interface on the same device.
 */
const MTP_INTERFACE_CLAIMANTS = ['ptpcamerad', 'mscamerad-xpc'];

/**
 * description - End one claimant by exact process name.
 *
 * '-x' matches the process name exactly. '-f' would match whole command lines,
 * which is far too broad: it would end any process merely mentioning the name
 * in its arguments, and could reach unrelated daemons like 'appleh13camerad'.
 *
 * @param name
 * @return {Promise<{name: string, killed: boolean, code: number|null}>}
 */
function killByExactName(name) {
  return new Promise((resolve) => {
    try {
      // SIGKILL, not the default SIGTERM: these daemons ignore SIGTERM and
      // survive it, while pkill still exits 0 for having signalled them. That
      // reports a successful release while the interface is still held.
      exec(`/usr/bin/pkill -9 -x ${name}`, (error) => {
        // pkill exits 1 when nothing matched, which is not a failure for us
        resolve({ name, killed: !error, code: error?.code ?? 0 });
      });
    } catch (e) {
      resolve({ name, killed: false, code: null, error: `${e}` });
    }
  });
}

/**
 * description - Hand the MTP interface back from macOS' Image Capture daemons.
 *
 * Both run as the current user and launchd restarts them on demand, so ending
 * them is safe and reversible. This is only called after a handshake has
 * already failed, never pre-emptively.
 *
 * There is deliberately no `process.platform` guard here. In the renderer
 * `process` can resolve to a browser shim whose `platform` is not `darwin`,
 * which would silently skip the whole thing. On a platform without these
 * daemons `pkill` simply matches nothing.
 *
 * @return {Promise<boolean>} whether anything was actually released
 */
export async function releaseMtpInterfaceClaimants() {
  const results = await Promise.all(
    MTP_INTERFACE_CLAIMANTS.map((name) => killByExactName(name))
  );

  const released = results.some((item) => item.killed);

  // written to the log file so this is diagnosable from a packaged build
  log.info(
    `released=${released} ${JSON.stringify(results)}`,
    'releaseMtpInterfaceClaimants',
    true,
    true,
    false
  );

  return released;
}
