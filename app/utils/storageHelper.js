'use strict';

import { PATHS } from './paths';
import Storage from '../classes/storage';

const { settingsFile } = PATHS;

export const settingsStorage = new Storage(settingsFile);
