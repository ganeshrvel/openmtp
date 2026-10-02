/* eslint-env node */
import assert from 'assert';
import {
  AdbTransport,
  parseDevices,
  parseList,
  ANDROID_STORAGE_ROOT,
} from './AdbTransport';

class FakeAdbClient {
  constructor(results = []) {
    this.results = results;
    this.calls = [];
  }

  run(args) {
    this.calls.push(args);

    return {
      cancel: () => {},
      promise: Promise.resolve(
        this.results.shift() || { error: null, stdout: '', stderr: '' }
      ),
    };
  }
}

// Kept dependency-free so it can run with Babel/register in this legacy app.
export function runAdbTransportUnitTests() {
  const devices = parseDevices(
    `List of devices attached\nusb-1 device product:panther model:Pixel_8 transport_id:1\n192.168.1.10:37123 device product:panther model:Pixel_8\n`
  );

  assert.strictEqual(devices.length, 2);
  assert.strictEqual(devices[0].transport, 'usb');
  assert.strictEqual(devices[1].transport, 'wifi');

  const entries = parseList(
    `${ANDROID_STORAGE_ROOT}/Download\x00d\x000\x001700000000\x00Download\x00${ANDROID_STORAGE_ROOT}/hello world.txt\x00f\x0012\x001700000000\x00hello world.txt\x00`,
    false
  );

  assert.strictEqual(entries.length, 2);
  assert.strictEqual(entries[0].isFolder, true);
  assert.strictEqual(entries[1].name, 'hello world.txt');
  assert.strictEqual(
    parseList(
      `${ANDROID_STORAGE_ROOT}/.hidden\x00f\x001\x000\x00.hidden\x00`,
      true
    ).length,
    0
  );
}

export async function runAdbTransportOperationUnitTests() {
  const entry = `${ANDROID_STORAGE_ROOT}/Download\x00d\x000\x001700000000\x00Download\x00`;
  const client = new FakeAdbClient([
    {
      error: null,
      stdout: `List of devices attached\nserial device model:Pixel_8 transport_id:1\n`,
      stderr: '',
    },
    { error: null, stdout: entry, stderr: '' },
    { error: null, stdout: '', stderr: '' },
    { error: null, stdout: '', stderr: '' },
    { error: null, stdout: '', stderr: '' },
  ]);
  const transport = new AdbTransport({ serial: 'serial', client });
  const discovered = await transport.discover();

  assert.strictEqual(discovered.data[0].serial, 'serial');
  const listed = await transport.list(ANDROID_STORAGE_ROOT);

  assert.strictEqual(listed.data[0].name, 'Download');
  assert.strictEqual(
    (await transport.mkdir(`${ANDROID_STORAGE_ROOT}/New Folder`)).data,
    true
  );
  assert.strictEqual(
    (
      await transport.rename(
        `${ANDROID_STORAGE_ROOT}/Download`,
        `${ANDROID_STORAGE_ROOT}/Downloads`
      )
    ).data,
    true
  );
  assert.strictEqual(
    (await transport.delete(`${ANDROID_STORAGE_ROOT}/Downloads`)).data,
    true
  );
  assert.strictEqual(
    (await transport.delete(ANDROID_STORAGE_ROOT)).error,
    'Refusing to delete Android storage root'
  );
  assert.strictEqual(client.calls.length, 5);
}
