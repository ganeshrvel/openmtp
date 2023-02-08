import 'zx/globals';

require('dotenv').config();

process.env.FORCE_COLOR = 3;
$.shell = '/bin/zsh';

await $`export LANG=en_US.UTF-8`;
await $`export LC_ALL=en_US.UTF-8`;
