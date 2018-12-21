'use strict';

import zlib from 'zlib';
import { createReadStream, createWriteStream, writeFile } from 'fs';
import { log } from './log';

const gzip = zlib.createGzip();

export const compressFile = (_input, _output) => {
  try {
    const input = createReadStream(_input);
    const output = createWriteStream(_output);

    input.pipe(gzip).pipe(output);

    return true;
  } catch (e) {
    log.error(e, `gzip -> compressFile`);
  }
};
