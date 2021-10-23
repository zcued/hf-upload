module.exports = {
  extends: '@zcool/eslint-config-browser-ts',
  parserOptions: { project: './tsconfig.eslint.json' },
  rules: {
    'react/react-in-jsx-scope': [0],
  },
}
