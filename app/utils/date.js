import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(advancedFormat);

export const yearMonthNow = ({ monthInletters = false }) => {
  let monthFormat = `MM`;

  if (monthInletters) {
    monthFormat = `MMM`;
  }

  return dayjs().format(`YYYY-${monthFormat}`);
};

export const dateTimeUnixTimestampNow = ({ monthInletters = false }) => {
  let monthFormat = `MM`;

  if (monthInletters) {
    monthFormat = `MMM`;
  }

  return dayjs().format(`YYYY-${monthFormat}-DD HH:mm:ss (x)`);
};

export const dateNow = ({ monthInletters = false }) => {
  let monthFormat = `MM`;

  if (monthInletters) {
    monthFormat = `MMM`;
  }

  return dayjs().format(`YYYY-${monthFormat}-DD`);
};

export const unixTimestampNow = () => {
  return dayjs().format(`x`);
};

export const msToTime = (milliseconds) => {
  const hours = milliseconds / (1000 * 60 * 60);
  const absoluteHours = Math.floor(hours);
  const h = absoluteHours > 9 ? absoluteHours : `0${absoluteHours}`;

  const minutes = (hours - absoluteHours) * 60;
  const absoluteMinutes = Math.floor(minutes);
  const m = absoluteMinutes > 9 ? absoluteMinutes : `0${absoluteMinutes}`;

  const seconds = (minutes - absoluteMinutes) * 60;
  const absoluteSeconds = Math.floor(seconds);
  const s = absoluteSeconds > 9 ? absoluteSeconds : `0${absoluteSeconds}`;

  return `${h}:${m}:${s}`;
};

export const daysDiff = (startDate, endDate) => {
  const start = dayjs(startDate, 'YYYY-MM-DD');
  const end = dayjs(endDate, 'YYYY-MM-DD');

  return start.diff(end, 'day');
};

export const appDateFormat = (dateTime) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
};
