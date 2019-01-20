module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    allowImportExportEverywhere: true
  },
  env: {
    browser: true,
    node: true
  },
  plugins: ['import', 'promise', 'compat', 'react'],
  extends: ['airbnb', 'plugin:prettier/recommended', 'prettier/react'],
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack/config.eslint.js'
      }
    }
  },
  rules: {
    'arrow-parens': 'off',
    'compat/compat': 'error',
    'consistent-return': 'off',
    'comma-dangle': 'off',
    'generator-star-spacing': 'off',
    'import/no-unresolved': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'no-console': [
      'error',
      {
        allow: ['info', 'error', 'warn']
      }
    ],
    'no-use-before-define': 'off',
    'no-multi-assign': 'off',
    'prettier/prettier': ['error', { singleQuote: true }],
    'promise/param-names': 'error',
    'promise/always-return': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-native': 'off',
    'react/sort-comp': [
      'error',
      {
        order: [
          'type-annotations',
          'static-methods',
          'lifecycle',
          'everything-else',
          'render'
        ]
      }
    ],
    'react/jsx-no-bind': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx'] }],
    'react/prefer-stateless-function': 'off',
    strict: 'off',
    'import/prefer-default-export': 'off',
    'arrow-body-style': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-shadow': 'off',
    'react/prop-types': 'off',
    'import/no-dynamic-require': 'off',
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^(theme|props|state|ownProps|dispatch|getState)|_',
        varsIgnorePattern: '^(variables|mixins|args|log)'
      }
    ]
  }
};
