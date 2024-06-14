import { PATHS } from '../constants/paths';
import Storage from '../classes/Storage';

const { settingsFile, identifierFile } = PATHS;

export const identifierStorage = new Storage(identifierFile, true);

export const settingsStorage = new Storage(settingsFile, false);
