const path = require('path');
const saveFile = require('fs').writeFileSync;

const pkgJsonPath = path.join(
  `${require.main.paths[0].split('node_modules')[0]}`,
  '../../',
  'package.json'
);

const json = require(pkgJsonPath);

// json.dependencies['node-mac-permissions'] = '^2.2.1';

saveFile(pkgJsonPath, JSON.stringify(json, null, 2));
