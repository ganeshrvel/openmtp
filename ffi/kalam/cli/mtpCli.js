import { FILE_TRANSFER_DIRECTION } from '../../../app/enums';
import { KalamEngine } from '../src/KalamEngine';
import { resolveKalamLibPath } from './resolveLibPath';

export const USAGE = `OpenMTP MTP CLI - drive the Kalam MTP engine from the terminal.

Usage:
  openmtp-cli <command> [options]

Commands:
  list-devices                       Show the connected MTP device + its storages
  ls <device-path>                   List a directory on the device
  upload <local-path> <device-path>  Copy a file/folder TO the device
  download <device-path> <local-path> Copy a file/folder FROM the device

Options:
  --storage <id>     Storage id to operate on. Defaults to the first storage.
  --all              (ls) Include hidden files.
  --json             Emit machine-readable JSON instead of human text.
  -h, --help         Show this help.

Notes:
  Reuses OpenMTP's native "Kalam" engine (build/mac/bin/<arch>/kalam.dylib),
  the same engine the GUI uses. On macOS this can claim the MTP USB interface
  where libusb-based CLIs fail with libusb_claim_interface() = -3.
`;

/**
 * A tiny, dependency-free argv parser.
 *
 * @param {string[]} argv - Arguments after `node script`.
 * @returns {{ command: string|null, positionals: string[], options: object }}
 */
export function parseArgs(argv) {
  const options = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '-h' || token === '--help') {
      options.help = true;
    } else if (token === '--json') {
      options.json = true;
    } else if (token === '--all') {
      options.all = true;
    } else if (token === '--storage') {
      const value = argv[i + 1];

      if (value === undefined || value.startsWith('-')) {
        throw new Error(`--storage requires a value`);
      }

      const parsed = parseInt(value, 10);

      if (Number.isNaN(parsed)) {
        throw new Error(`--storage must be a number, got "${value}"`);
      }

      options.storage = parsed;
      i += 1;
    } else if (token.startsWith('--')) {
      throw new Error(`Unknown option: ${token}`);
    } else {
      positionals.push(token);
    }
  }

  const command = positionals.shift() ?? null;

  return { command, positionals, options };
}

/**
 * Pick the storage id to operate on. If `--storage` was supplied, validate it
 * exists; otherwise default to the first storage returned by the engine.
 *
 * @param {object} storages - Map of `{ [storageId]: { name, ... } }`.
 * @param {number|undefined} requested - Requested storage id.
 * @returns {number} The resolved storage id.
 */
export function resolveStorageId(storages, requested) {
  const ids = Object.keys(storages ?? {});

  if (ids.length === 0) {
    throw new Error('No storages found on the device.');
  }

  if (requested !== undefined) {
    if (!Object.prototype.hasOwnProperty.call(storages, String(requested))) {
      throw new Error(
        `Storage id ${requested} not found. Available: ${ids.join(', ')}`
      );
    }

    return requested;
  }

  return parseInt(ids[0], 10);
}

/**
 * Shape the raw `listStorages` engine output into a simple map.
 * Mirrors `FileExplorerKalamDataSource.listStorages`.
 */
function toStorageList(data) {
  const storageList = {};

  (data ?? []).forEach((a, index) => {
    storageList[a.Sid] = {
      name: a.Info?.StorageDescription,
      selected: index === 0,
      info: a.Info,
    };
  });

  return storageList;
}

const noop = () => {};

/**
 * Run a single CLI invocation.
 *
 * The Kalam engine is injected via `createEngine` so command dispatch can be
 * unit-tested without a physical device or the native dylib.
 *
 * @param {string[]} argv - Args after `node script`.
 * @param {Object} [deps]
 * @param {() => object} [deps.createEngine] - Factory returning a Kalam engine.
 * @param {{ log: Function, error: Function }} [deps.io] - Output sinks.
 * @returns {Promise<number>} Process exit code.
 */
export async function run(argv, deps = {}) {
  const io = deps.io ?? {
    log: (...a) => console.info(...a),
    error: (...a) => console.error(...a),
  };

  let parsed;

  try {
    parsed = parseArgs(argv);
  } catch (e) {
    io.error(e.message);
    io.error('');
    io.error(USAGE);

    return 2;
  }

  const { command, positionals, options } = parsed;

  if (options.help || command === null || command === 'help') {
    io.log(USAGE);

    return command === null && !options.help ? 1 : 0;
  }

  const knownCommands = ['list-devices', 'ls', 'upload', 'download'];

  if (!knownCommands.includes(command)) {
    io.error(`Unknown command: ${command}`);
    io.error('');
    io.error(USAGE);

    return 2;
  }

  const createEngine =
    deps.createEngine ??
    (() => new KalamEngine({ libPath: resolveKalamLibPath() }));

  const engine = createEngine();

  const emit = (payload) => {
    if (options.json) {
      io.log(JSON.stringify(payload, null, 2));
    }
  };

  const fail = (message) => {
    io.error(message);
  };

  try {
    const init = await engine.initialize();

    if (init.error) {
      fail(`Failed to initialize MTP device: ${init.error}`);

      return 1;
    }

    switch (command) {
      case 'list-devices': {
        const info = await engine.fetchDeviceInfo();

        if (info.error) {
          fail(`Failed to fetch device info: ${info.error}`);

          return 1;
        }

        const storagesRes = await engine.listStorages();

        if (storagesRes.error) {
          fail(`Failed to list storages: ${storagesRes.error}`);

          return 1;
        }

        const storages = toStorageList(storagesRes.data);

        emit({ device: info.data, storages });

        if (!options.json) {
          io.log('Connected MTP device:');
          io.log(JSON.stringify(info.data, null, 2));
          io.log('');
          io.log('Storages:');
          Object.entries(storages).forEach(([id, s]) => {
            io.log(`  [${id}] ${s.name}`);
          });
        }

        return 0;
      }

      case 'ls': {
        const [devicePath] = positionals;

        if (!devicePath) {
          fail('ls requires a <device-path> argument.');

          return 2;
        }

        const storagesRes = await engine.listStorages();

        if (storagesRes.error) {
          fail(`Failed to list storages: ${storagesRes.error}`);

          return 1;
        }

        const storages = toStorageList(storagesRes.data);
        const storageId = resolveStorageId(storages, options.storage);

        const res = await engine.walk({
          storageId,
          fullPath: devicePath,
          skipHiddenFiles: !options.all,
        });

        if (res.error) {
          fail(`Failed to list ${devicePath}: ${res.error}`);

          return 1;
        }

        emit({ storageId, path: devicePath, files: res.data });

        if (!options.json) {
          (res.data ?? []).forEach((f) => {
            const kind = f.isFolder ? 'd' : '-';

            io.log(`${kind} ${f.name}`);
          });
        }

        return 0;
      }

      case 'upload':
      case 'download': {
        const direction =
          command === 'upload'
            ? FILE_TRANSFER_DIRECTION.upload
            : FILE_TRANSFER_DIRECTION.download;

        const [first, second] = positionals;

        if (!first || !second) {
          const argHint =
            command === 'upload'
              ? '<local-path> <device-path>'
              : '<device-path> <local-path>';

          fail(`${command} requires two arguments: ${argHint}`);

          return 2;
        }

        // upload: source = local file, destination = device dir
        // download: source = device file, destination = local dir
        const source = first;
        const destination = second;

        const storagesRes = await engine.listStorages();

        if (storagesRes.error) {
          fail(`Failed to list storages: ${storagesRes.error}`);

          return 1;
        }

        const storages = toStorageList(storagesRes.data);
        const storageId = resolveStorageId(storages, options.storage);

        let transferError = null;

        const res = await engine.transferFiles({
          direction,
          storageId,
          sources: [source],
          destination,
          preprocessFiles: true,
          onError: ({ error }) => {
            transferError = error;
          },
          onPreprocess: noop,
          onProgress: ({ filesSentProgress, currentFile }) => {
            if (!options.json && filesSentProgress !== undefined) {
              io.log(`  ${filesSentProgress}%  ${currentFile ?? ''}`);
            }
          },
          onCompleted: noop,
        });

        const err = transferError ?? res?.error;

        if (err) {
          fail(`Transfer failed: ${err}`);

          return 1;
        }

        emit({ direction, storageId, source, destination, ok: true });

        if (!options.json) {
          io.log(`${command} complete: ${source} -> ${destination}`);
        }

        return 0;
      }

      default:
        fail(`Unhandled command: ${command}`);

        return 2;
    }
  } finally {
    try {
      await engine.dispose();
    } catch (e) {
      // best-effort cleanup; ignore dispose errors
    }
  }
}
