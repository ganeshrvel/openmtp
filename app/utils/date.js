'use strict';
import moment from 'moment';

export const dateNow = ({ monthInletters = false }) => {
  let monthFormat = `MM`;
  if (monthInletters) {
    monthFormat = `MMM`;
  }

  return moment().format(`YYYY-${monthFormat}-DD`);
};

export const dateTimeNow = ({ monthInletters = false }) => {
  let monthFormat = `MM`;
  if (monthInletters) {
    monthFormat = `MMM`;
  }

  return moment().format(`YYYY-${monthFormat}-DD HH:mm:ss`);
};

export const dateTimeUnixTimestampNow = ({ monthInletters = false }) => {
  let monthFormat = `MM`;
  if (monthInletters) {
    monthFormat = `MMM`;
  }

  return moment().format(`YYYY-${monthFormat}-DD HH:mm:ss (x)`);
};

export const unixTimestampNow = () => {
  return moment().format(`x`);
};
