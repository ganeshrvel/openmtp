module.exports = {
  '*.{js,jsx,mjs}': ['yarn lint', 'yarn postlint-fix', 'git add'],
  '{*.json,.{babelrc,eslintrc,prettierrc,stylelintrc}}': [
    'prettier --ignore-path .eslintignore --parser json --write',
    'git add',
  ],
  '*.{css,scss}': ['yarn lint-styles', 'yarn postlint-styles-fix', 'git add'],
  '*.{html,md,yml}': [
    'prettier --ignore-path .eslintignore --single-quote --write',
    'git add',
  ],
  '*.{js,jsx,mjs,ts,tsx,css,scss,html,md,yml}': ['git add'],
};
