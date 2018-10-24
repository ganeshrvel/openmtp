'use strict';

import { PATHS } from './paths';
import Storage from './storage';

const { settingsFile } = PATHS;

export const settingsStorage = new Storage(settingsFile);
