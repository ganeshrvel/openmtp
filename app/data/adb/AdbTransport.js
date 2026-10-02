import path from 'path';
import { statSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { AdbProcessClient, ADB_ERROR } from './AdbProcessClient';
import { adbPath } from '../../helpers/binaries';
import { appDateFormat } from '../../utils/date';
import { log } from '../../utils/log';

export const ANDROID_STORAGE_ROOT = '/storage/emulated/0';

const shellQuote = (value) => `'${String(value).replace(/'/g, "'\\\"'\\\"'")}'`;
const remotePath = (value) => path.posix.normalize(value);
const isStoragePath = (value) =>
  value === ANDROID_STORAGE_ROOT ||
  value.startsWith(`${ANDROID_STORAGE_ROOT}/`);
const commandFor = (script, args) =>
  `${script} ${args.map(shellQuote).join(' ')}`;

const parseDevices = (stdout) =>
  stdout
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const [serial, state, ...properties] = line.trim().split(/\s+/);
      const info = properties.reduce((result, item) => {
        const separator = item.indexOf(':');

        if (separator > 0) {
          // eslint-disable-next-line no-param-reassign
          result[item.slice(0, separator)] = item.slice(separator + 1);
        }

        return result;
      }, {});
      const wireless = serial.includes(':') || info.transport_id === undefined;

      return {
        serial,
        state,
        model: info.model?.replace(/_/g, ' ') || serial,
        manufacturer: info.product || null,
        transport: wireless ? 'wifi' : 'usb',
        address: wireless ? serial : null,
      };
    });

const parseList = (stdout, ignoreHidden) => {
  const fields = stdout.split('\0');
  const entries = [];

  for (let index = 0; index + 4 < fields.length; index += 5) {
    const [fullPath, type, size, modified, name] = fields.slice(
      index,
      index + 5
    );

    // eslint-disable-next-line no-continue
    if (!fullPath || (ignoreHidden && name.startsWith('.'))) continue;
    entries.push({
      name,
      path: fullPath,
      extension: type === 'd' ? null : path.posix.extname(name),
      size: Number(size) || 0,
      isFolder: type === 'd',
      symlink: type === 'l' ? fullPath : null,
      dateAdded: Number(modified)
        ? appDateFormat(new Date(Number(modified) * 1000))
        : '',
    });
  }

  return entries;
};

/**
 * DeviceTransport implementation backed by the official adb executable.
 * It deliberately keeps ADB/SYNC implementation details outside the UI.
 */
export class AdbTransport {
  constructor({ serial = null, client = null } = {}) {
    this.serial = serial;
    this.client = client || new AdbProcessClient({ adbPath });
    this.operations = new Map();
    this.transferQueue = Promise.resolve();
  }

  _deviceArgs(args) {
    if (!this.serial) throw new Error('No ADB device selected');

    return ['-s', this.serial, ...args];
  }

  async _run(args, options) {
    const result = await this.client.run(args, options).promise;

    if (result.error) log.info(`ADB: ${result.error}`, 'AdbTransport', false);

    return result;
  }

  async discover() {
    const result = await this._run(['devices', '-l']);

    if (result.error) return { error: result.error, data: [] };

    return { error: null, data: parseDevices(result.stdout) };
  }

  async connect({ host, port }) {
    if (
      !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) ||
      !Number.isInteger(Number(port)) ||
      Number(port) < 1 ||
      Number(port) > 65535
    ) {
      return { error: 'Invalid network address or port', data: null };
    }

    const endpoint = `${host}:${port}`;
    const result = await this._run(['connect', endpoint]);

    if (!result.error) this.serial = endpoint;

    return { error: result.error, data: result.error ? null : endpoint };
  }

  async pair({ host, port, code }) {
    if (
      !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) ||
      !Number.isInteger(Number(port)) ||
      !/^\d{6}$/.test(String(code))
    ) {
      return { error: 'Invalid pairing details', data: null };
    }

    const result = await this._run(['pair', `${host}:${port}`, String(code)]);

    return { error: result.error, data: result.error ? null : true };
  }

  async disconnect() {
    if (!this.serial) return { error: null, data: true };
    const result = await this._run(['disconnect', this.serial]);

    if (!result.error) this.serial = null;

    return { error: result.error, data: !result.error };
  }

  async list(filePath, ignoreHidden = false) {
    const normalized = remotePath(filePath);

    if (!isStoragePath(normalized))
      return { error: 'Invalid storage path', data: null };
    // A NUL-delimited record avoids parsing human-formatted ls output.
    const script =
      // eslint-disable-next-line no-template-curly-in-string
      'root=$1; for e in "$root"/* "$root"/.[!.]* "$root"/..?*; do [ -e "$e" ] || [ -L "$e" ] || continue; t=f; [ -d "$e" ] && t=d; [ -L "$e" ] && t=l; s=$(wc -c < "$e" 2>/dev/null || echo 0); m=$(stat -c %Y "$e" 2>/dev/null || echo 0); n=${e##*/}; printf "%s\\0%s\\0%s\\0%s\\0%s\\0" "$e" "$t" "$s" "$m" "$n"; done';
    const result = await this._run(
      this._deviceArgs([
        'shell',
        commandFor(`sh -c ${shellQuote(script)} --`, [normalized]),
      ])
    );

    return {
      error: result.error,
      stderr: result.stderr,
      data: result.error ? null : parseList(result.stdout, ignoreHidden),
    };
  }

  async stat(filePath) {
    const normalized = remotePath(filePath);

    if (!isStoragePath(normalized) || normalized === ANDROID_STORAGE_ROOT) {
      return { error: 'Invalid storage path', data: null };
    }

    const result = await this.list(path.posix.dirname(normalized), false);

    if (result.error) return result;
    const entry = result.data.find((item) => item.path === normalized);

    return entry
      ? { error: null, stderr: null, data: entry }
      : { error: 'File does not exist', stderr: null, data: null };
  }

  async mkdir(filePath) {
    return this._mutate('mkdir -p --', [filePath]);
  }

  async rename(oldPath, newPath) {
    return this._mutate('mv --', [oldPath, newPath]);
  }

  async delete(filePath) {
    const normalized = remotePath(filePath);

    if (normalized === ANDROID_STORAGE_ROOT)
      return { error: 'Refusing to delete Android storage root', data: false };

    return this._mutate('rm -rf --', [normalized]);
  }

  async _mutate(command, paths) {
    const normalized = paths.map(remotePath);

    if (normalized.some((item) => !isStoragePath(item)))
      return { error: 'Invalid storage path', data: false };
    const result = await this._run(
      this._deviceArgs(['shell', commandFor(command, normalized)])
    );

    return { error: result.error, stderr: result.stderr, data: !result.error };
  }

  transfer({
    direction,
    sources,
    destination,
    onProgress = () => {},
    onCompleted = () => {},
    onError = () => {},
  }) {
    const operationId = uuid();
    const localToRemote = direction === 'upload';
    const operation = { cancelled: false, cancel: null };

    this.operations.set(operationId, operation);

    const runNext = async () => {
      let total = 0;
      let sent = 0;

      if (localToRemote) {
        total = sources.reduce((sum, source) => {
          try {
            return sum + statSync(source).size;
          } catch (_) {
            return sum;
          }
        }, 0);
      } else {
        const remoteEntries = await Promise.all(
          sources.map(async (source) => {
            const parent = path.posix.dirname(source);
            const result = await this.list(parent, false);

            return result.data?.find((entry) => entry.path === source);
          })
        );

        total = remoteEntries.reduce(
          (sum, entry) => sum + (entry?.size || 0),
          0
        );
      }

      for (let index = 0; index < sources.length; index += 1) {
        if (operation.cancelled) throw new Error(ADB_ERROR.cancelled);
        const source = sources[index];
        const target = localToRemote
          ? destination
          : path.join(destination, path.posix.basename(source));
        const args = localToRemote
          ? this._deviceArgs(['push', '-p', source, destination])
          : this._deviceArgs(['pull', '-p', source, target]);
        const activeSize = localToRemote
          ? (() => {
              try {
                return statSync(source).size;
              } catch (_) {
                return 0;
              }
            })()
          : total / sources.length;
        const startedAt = Date.now();
        let activeProgress = 0;
        // eslint-disable-next-line no-loop-func
        const emitProgress = () => {
          const activeSent = (activeSize * activeProgress) / 100;
          const elapsedMs = Math.max(Date.now() - startedAt, 1);
          const speed = activeSent / elapsedMs / 1000;

          onProgress({
            currentFile: source,
            totalFiles: sources.length,
            filesSent: index,
            filesSentProgress: (index / sources.length) * 100,
            totalFileSize: total,
            totalFileSizeSent: sent + activeSent,
            totalFileProgress: total
              ? ((sent + activeSent) / total) * 100
              : activeProgress,
            activeFileSize: activeSize,
            activeFileSizeSent: activeSent,
            activeFileProgress: activeProgress,
            speed,
            elapsedTime: `${Math.floor(elapsedMs / 1000)}s`,
            direction,
          });
        };
        const onOutput = (chunk) => {
          const matches = chunk.toString().match(/(\d{1,3})%/g);

          if (!matches) return;
          activeProgress = Math.min(
            100,
            Number(matches[matches.length - 1].replace('%', ''))
          );
          emitProgress();
        };
        const task = this.client.run(args, {
          onStdout: onOutput,
          onStderr: onOutput,
        });

        operation.cancel = task.cancel;
        // eslint-disable-next-line no-await-in-loop
        const result = await task.promise;

        if (result.error) throw new Error(result.error);
        sent += activeSize;
        activeProgress = 100;
        emitProgress();
      }
    };

    this.transferQueue = this.transferQueue
      .catch(() => {})
      .then(runNext)
      .then(() => onCompleted())
      .catch((error) =>
        onError({
          error:
            error.message === ADB_ERROR.cancelled
              ? ADB_ERROR.cancelled
              : error.message,
          stderr: null,
          data: null,
        })
      )
      .finally(() => this.operations.delete(operationId));

    return operationId;
  }

  cancel(operationId) {
    const operation = this.operations.get(operationId);

    if (!operation) return false;
    operation.cancelled = true;
    operation.cancel?.();

    return true;
  }
}

export { parseDevices, parseList };
