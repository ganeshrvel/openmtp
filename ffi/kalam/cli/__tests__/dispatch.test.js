import { run } from '../mtpCli';

/**
 * Build a fake Kalam engine whose methods are jest mocks. This lets us test the
 * CLI's command dispatch without a physical MTP device or the native dylib.
 */
function makeEngine(overrides = {}) {
  const ok = (data = null) => ({ error: null, stderr: null, data });

  return {
    initialize: jest.fn().mockResolvedValue(ok()),
    dispose: jest.fn().mockResolvedValue(ok()),
    fetchDeviceInfo: jest
      .fn()
      .mockResolvedValue(ok({ MtpDeviceInfo: { Model: 'Pixel 7' } })),
    listStorages: jest.fn().mockResolvedValue(
      ok([
        {
          Sid: 65537,
          Info: { StorageDescription: 'Internal storage' },
        },
      ])
    ),
    walk: jest.fn().mockResolvedValue(
      ok([
        { name: 'DCIM', isFolder: true },
        { name: 'song.mp3', isFolder: false },
      ])
    ),
    transferFiles: jest.fn().mockResolvedValue(ok()),
    ...overrides,
  };
}

function makeIo() {
  const out = [];
  const err = [];

  return {
    io: {
      log: (...a) => out.push(a.join(' ')),
      error: (...a) => err.push(a.join(' ')),
    },
    out,
    err,
  };
}

describe('run() dispatch', () => {
  it('prints usage and exits 0 on --help', async () => {
    const { io, out } = makeIo();
    const code = await run(['--help'], { io, createEngine: makeEngine });

    expect(code).toBe(0);
    expect(out.join('\n')).toMatch(/Usage:/);
  });

  it('prints usage and exits 1 when no command is given', async () => {
    const { io } = makeIo();
    const code = await run([], { io, createEngine: makeEngine });

    expect(code).toBe(1);
  });

  it('exits 2 on an unknown command', async () => {
    const { io, err } = makeIo();
    const code = await run(['frobnicate'], { io, createEngine: makeEngine });

    expect(code).toBe(2);
    expect(err.join('\n')).toMatch(/Unknown command: frobnicate/);
  });

  it('exits 2 on an unknown option without touching the engine', async () => {
    const { io } = makeIo();
    const engine = makeEngine();
    const code = await run(['ls', '--bogus'], {
      io,
      createEngine: () => engine,
    });

    expect(code).toBe(2);
    expect(engine.initialize).not.toHaveBeenCalled();
  });

  describe('list-devices', () => {
    it('initializes, fetches info + storages, and disposes', async () => {
      const { io, out } = makeIo();
      const engine = makeEngine();
      const code = await run(['list-devices'], {
        io,
        createEngine: () => engine,
      });

      expect(code).toBe(0);
      expect(engine.initialize).toHaveBeenCalledTimes(1);
      expect(engine.fetchDeviceInfo).toHaveBeenCalledTimes(1);
      expect(engine.listStorages).toHaveBeenCalledTimes(1);
      expect(engine.dispose).toHaveBeenCalledTimes(1);
      expect(out.join('\n')).toMatch(/Internal storage/);
    });

    it('emits JSON when --json is set', async () => {
      const { io, out } = makeIo();
      const code = await run(['list-devices', '--json'], {
        io,
        createEngine: makeEngine,
      });

      expect(code).toBe(0);
      const payload = JSON.parse(out.join('\n'));

      expect(payload.storages['65537'].name).toBe('Internal storage');
    });

    it('returns 1 when initialize fails (e.g. no device)', async () => {
      const { io, err } = makeIo();
      const engine = makeEngine({
        initialize: jest
          .fn()
          .mockResolvedValue({ error: 'no MTP devices found', data: null }),
      });
      const code = await run(['list-devices'], {
        io,
        createEngine: () => engine,
      });

      expect(code).toBe(1);
      expect(err.join('\n')).toMatch(/no MTP devices found/);
      expect(engine.dispose).toHaveBeenCalled();
    });
  });

  describe('ls', () => {
    it('walks the given device path on the default storage', async () => {
      const { io, out } = makeIo();
      const engine = makeEngine();
      const code = await run(['ls', '/DCIM'], {
        io,
        createEngine: () => engine,
      });

      expect(code).toBe(0);
      expect(engine.walk).toHaveBeenCalledWith({
        storageId: 65537,
        fullPath: '/DCIM',
        skipHiddenFiles: true,
      });
      expect(out.join('\n')).toMatch(/d DCIM/);
      expect(out.join('\n')).toMatch(/- song\.mp3/);
    });

    it('includes hidden files when --all is set', async () => {
      const { io } = makeIo();
      const engine = makeEngine();

      await run(['ls', '/', '--all'], { io, createEngine: () => engine });

      expect(engine.walk).toHaveBeenCalledWith(
        expect.objectContaining({ skipHiddenFiles: false })
      );
    });

    it('requires a device-path argument', async () => {
      const { io, err } = makeIo();
      const code = await run(['ls'], { io, createEngine: makeEngine });

      expect(code).toBe(2);
      expect(err.join('\n')).toMatch(/ls requires a <device-path>/);
    });
  });

  describe('upload', () => {
    it('transfers with direction=upload, source=local, destination=device', async () => {
      const { io } = makeIo();
      const engine = makeEngine();
      const code = await run(
        ['upload', '/local/watchface.fit', '/GARMIN/NEWFILES'],
        { io, createEngine: () => engine }
      );

      expect(code).toBe(0);
      expect(engine.transferFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'upload',
          storageId: 65537,
          sources: ['/local/watchface.fit'],
          destination: '/GARMIN/NEWFILES',
        })
      );
    });

    it('requires two arguments', async () => {
      const { io, err } = makeIo();
      const code = await run(['upload', '/only-one'], {
        io,
        createEngine: makeEngine,
      });

      expect(code).toBe(2);
      expect(err.join('\n')).toMatch(/upload requires two arguments/);
    });

    it('returns 1 when the transfer reports an error via onError', async () => {
      const { io, err } = makeIo();
      const engine = makeEngine({
        transferFiles: jest.fn().mockImplementation(async (args) => {
          args.onError({ error: 'disk full', data: null, stderr: null });

          return { error: null, data: null };
        }),
      });
      const code = await run(['upload', '/a', '/b'], {
        io,
        createEngine: () => engine,
      });

      expect(code).toBe(1);
      expect(err.join('\n')).toMatch(/Transfer failed: disk full/);
    });
  });

  describe('download', () => {
    it('transfers with direction=download, source=device, destination=local', async () => {
      const { io } = makeIo();
      const engine = makeEngine();
      const code = await run(
        ['download', '/DCIM/Camera/IMG_0001.jpg', '/local/dest'],
        { io, createEngine: () => engine }
      );

      expect(code).toBe(0);
      expect(engine.transferFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'download',
          sources: ['/DCIM/Camera/IMG_0001.jpg'],
          destination: '/local/dest',
        })
      );
    });
  });

  it('honors an explicit --storage id', async () => {
    const { io } = makeIo();
    const engine = makeEngine({
      listStorages: jest.fn().mockResolvedValue({
        error: null,
        stderr: null,
        data: [
          { Sid: 65537, Info: { StorageDescription: 'Internal' } },
          { Sid: 65538, Info: { StorageDescription: 'SD card' } },
        ],
      }),
    });

    await run(['ls', '/', '--storage', '65538'], {
      io,
      createEngine: () => engine,
    });

    expect(engine.walk).toHaveBeenCalledWith(
      expect.objectContaining({ storageId: 65538 })
    );
  });
});
