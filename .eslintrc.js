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
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        argsIgnorePattern: '^(theme|props|state|ownProps|dispatch|getState)|_',
        varsIgnorePattern: '^(variables|mixins|args|log)'
      }
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: true }
    ],
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
    'jsx-a11y/control-has-associated-label': 'off',
    'no-console': [
      'error',
      {
        allow: ['info', 'error', 'warn']
      }
    ],
    'no-use-before-define': [
      'error',
      { functions: false, classes: false, variables: true }
    ],
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
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['block-like'], next: '*' },
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var']
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
          'defaultProps',
          'static-variables',
          'static-methods',
          'instance-variables',
          'type-annotations',
          'lifecycle',
          'everything-else',
          'render'
        ]
      }
    ],
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'ignore' }
    ],
    'react/jsx-fragments': 0,
    'react/jsx-no-bind': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/jsx-filename-extension': [
      'error',
      { extensions: ['.js', '.jsx', '.tsx'] }
    ],
    'react/prefer-stateless-function': 'off',
    'react/prop-types': 'off'
  }
};
