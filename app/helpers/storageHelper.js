import { PATHS } from '../constants/paths';
import Storage from '../classes/Storage';

const { settingsFile } = PATHS;

export const settingsStorage = new Storage(settingsFile);
