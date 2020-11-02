import zlib from 'zlib';
import { createReadStream, createWriteStream } from 'fs';
import { log } from './log';

export const compressFile = (_input, _output) => {
  try {
    const gzip = zlib.createGzip();
    const input = createReadStream(_input);
    const output = createWriteStream(_output);

    input.pipe(gzip).pipe(output);

    return true;
  } catch (e) {
    log.error(e, `gzip -> compressFile`);
  }
};
