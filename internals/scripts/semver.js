exports.semverSatisfies = (version, range) => {
  const [gtOp, gtVersion] = gtSemver(range);
  const [ltOp, ltVersion] = ltSemver(range);
  const versionParts = version.split('.').map(Number);
  const gtVersionParts = gtVersion.split('.').map(Number);
  const ltVersionParts = ltVersion.split('.').map(Number);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 3; i++) {
    const vp = versionParts[i] || 0;
    const gtvp = gtVersionParts[i] || 0;
    const ltvp = ltVersionParts[i] || 0;

    if (vp > ltvp || (vp === ltvp && ltOp === '<')) {
      return false;
    }

    if (vp < gtvp || (vp === gtvp && gtOp === '>')) {
      return false;
    }
  }

  return true;
};

const gtSemver = (range) => {
  const gtPattern = />=?\s*(\d+(?:\.\d+(?:\.\d+)?)?)/.exec(range);

  return gtPattern ? ['>=', gtPattern[1]] : ['>=', '0.0.0'];
};

const ltSemver = (range) => {
  const ltPattern = /<=?\s*(\d+(?:\.\d+(?:\.\d+)?)?)/.exec(range);

  return ltPattern ? ['<=', ltPattern[1]] : ['<=', '9999.9999.9999'];
};
