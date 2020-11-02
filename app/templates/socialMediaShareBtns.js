import { APP_DESC, APP_NAME, APP_WEBSITE } from '../constants/meta';

const twitterShareText = `Tired of using expensive, outdated, bug heavy, Android File Transfer apps for macOS?

Get "${APP_DESC}" by @ganeshrvel.
It's Safe, Transparent, Open-Source and FREE for a lifetime!

`;

export const twitterShareUrl = `http://twitter.com/share?text=${encodeURIComponent(
  twitterShareText
)}&hashtags=${APP_NAME},AndroidFileTransfer,macOS&url=${APP_WEBSITE}`;

export const fbShareUrl = `http://www.facebook.com/sharer/sharer.php?u=${APP_WEBSITE}`;

const redditShareText = `Tired of using expensive, outdated, bug heavy, Android File Transfer apps for macOS? Get "${APP_DESC}" by /u/ganeshrnet. It's Safe, Transparent, Open-Source and FREE for a lifetime!`;

export const redditShareUrl = `http://www.reddit.com/submit?url=${APP_WEBSITE}&title=${encodeURIComponent(
  redditShareText
)}`;
