import { parseArgs, resolveStorageId } from '../mtpCli';

describe('parseArgs', () => {
  it('parses a bare command with no options', () => {
    const { command, positionals, options } = parseArgs(['list-devices']);

    expect(command).toBe('list-devices');
    expect(positionals).toEqual([]);
    expect(options).toEqual({});
  });

  it('returns a null command when argv is empty', () => {
    const { command, positionals } = parseArgs([]);

    expect(command).toBeNull();
    expect(positionals).toEqual([]);
  });

  it('collects positionals for ls', () => {
    const { command, positionals } = parseArgs(['ls', '/']);

    expect(command).toBe('ls');
    expect(positionals).toEqual(['/']);
  });

  it('collects two positionals for upload', () => {
    const { command, positionals } = parseArgs([
      'upload',
      '/local/file.fit',
      '/GARMIN/NEWFILES',
    ]);

    expect(command).toBe('upload');
    expect(positionals).toEqual(['/local/file.fit', '/GARMIN/NEWFILES']);
  });

  it('parses --storage as a number', () => {
    const { options } = parseArgs(['ls', '/', '--storage', '65537']);

    expect(options.storage).toBe(65537);
  });

  it('throws when --storage has no value', () => {
    expect(() => parseArgs(['ls', '/', '--storage'])).toThrow(
      /--storage requires a value/
    );
  });

  it('throws when --storage is not numeric', () => {
    expect(() => parseArgs(['ls', '/', '--storage', 'abc'])).toThrow(
      /--storage must be a number/
    );
  });

  it('parses boolean flags --json and --all and --help', () => {
    const { options } = parseArgs(['ls', '/', '--json', '--all', '--help']);

    expect(options.json).toBe(true);
    expect(options.all).toBe(true);
    expect(options.help).toBe(true);
  });

  it('supports -h short help flag', () => {
    const { options } = parseArgs(['-h']);

    expect(options.help).toBe(true);
  });

  it('throws on unknown options', () => {
    expect(() => parseArgs(['ls', '--nope'])).toThrow(/Unknown option: --nope/);
  });
});

describe('resolveStorageId', () => {
  const storages = {
    65537: { name: 'Internal storage' },
    65538: { name: 'SD card' },
  };

  it('defaults to the first storage id', () => {
    expect(resolveStorageId(storages, undefined)).toBe(65537);
  });

  it('returns the requested storage id when it exists', () => {
    expect(resolveStorageId(storages, 65538)).toBe(65538);
  });

  it('throws when the requested storage id is missing', () => {
    expect(() => resolveStorageId(storages, 99999)).toThrow(
      /Storage id 99999 not found/
    );
  });

  it('throws when there are no storages', () => {
    expect(() => resolveStorageId({}, undefined)).toThrow(/No storages found/);
  });
});
