import path from 'path';
import { remote } from 'electron';
import { getPlatform } from './getPlatform';
import { IS_PROD } from '../constants/env';
import { PATHS } from './paths';
import { isPackaged } from './isPackaged';

const { root } = PATHS;
const { getAppPath } = remote.app;

const binariesPath =
  IS_PROD && isPackaged
    ? path.join(path.dirname(getAppPath()), '..', './Resources', './bin')
    : path.join(root, './build', getPlatform(), './bin');

export const mtpCliPath = path.resolve(path.join(binariesPath, './mtp-cli'));

export const kalamLibPath = path.resolve(
  path.join(binariesPath, './kalam.dylib')
);
