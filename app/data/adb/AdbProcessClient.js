import { spawn } from 'child_process';

const ADB_ERROR = {
  cancelled: 'Transfer cancelled',
  unavailable: 'ADB unavailable',
  disconnected: 'Device disconnected',
  pairing: 'Pairing failed',
  permission: 'Permission denied',
};

const errorMessage = ({ error, stderr, code }) => {
  const output = `${stderr || ''}\n${error?.message || ''}`.toLowerCase();

  if (error?.code === 'ENOENT') return ADB_ERROR.unavailable;
  if (
    /device (offline|not found)|closed|no devices\/emulators found/.test(output)
  )
    return ADB_ERROR.disconnected;
  if (/failed to (pair|authenticate)|pairing/.test(output))
    return ADB_ERROR.pairing;
  if (/permission denied/.test(output)) return ADB_ERROR.permission;
  if (code === null) return ADB_ERROR.cancelled;

  return stderr?.trim() || error?.message || 'ADB command failed';
};

/**
 * Small, injectable process boundary for the platform-tools executable.
 * No command is passed through a shell: device serials and local paths remain
 * individual argv values, while remote shell paths are quoted by AdbTransport.
 */
export class AdbProcessClient {
  constructor({ adbPath, spawnImpl = spawn }) {
    this.adbPath = adbPath;
    this.spawnImpl = spawnImpl;
  }

  run(args, { onStdout, onStderr } = {}) {
    let child;

    const promise = new Promise((resolve) => {
      try {
        child = this.spawnImpl(this.adbPath, args, {
          windowsHide: true,
          stdio: ['ignore', 'pipe', 'pipe'],
        });
      } catch (error) {
        resolve({ error: errorMessage({ error }), stdout: '', stderr: '' });

        return;
      }

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
        onStdout?.(chunk);
      });
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
        onStderr?.(chunk);
      });
      child.on('error', (error) => {
        resolve({ error: errorMessage({ error, stderr }), stdout, stderr });
      });
      child.on('close', (code) => {
        resolve({
          error: code === 0 ? null : errorMessage({ stderr, code }),
          stdout,
          stderr,
          code,
        });
      });
    });

    return {
      promise,
      cancel: () => {
        if (child && !child.killed) child.kill('SIGTERM');
      },
    };
  }
}

export { ADB_ERROR };
