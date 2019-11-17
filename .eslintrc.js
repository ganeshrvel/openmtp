module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: '.'
  },
  env: {
    browser: true,
    node: true
  },
  plugins: [
    '@typescript-eslint',
    'react-hooks',
    'prettier',
    'import',
    'promise',
    'compat'
  ],
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint'
  ],
  settings: {
    'import/resolver': {
      node: {},
      webpack: {
        config: 'webpack/config.eslint.js'
      }
    }
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'arrow-body-style': 'off',
    'arrow-parens': 'off',
    'class-methods-use-this': 'off',
    'compat/compat': 'error',
    'consistent-return': 'off',
    'comma-dangle': 'off',
    'generator-star-spacing': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-cycle': 'off',
    'import/no-unresolved': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/prefer-default-export': 'off',
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
    'no-shadow': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^(theme|props|state|ownProps|dispatch|getState)|_',
        varsIgnorePattern: '^(variables|mixins|args|log)'
      }
    ],
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
    'react/jsx-fragments': 0,
    'react/jsx-no-bind': 'off',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.tsx'] }
    ],
    'react/prefer-stateless-function': 'off',
    'react/prop-types': 'off'
  }
};
