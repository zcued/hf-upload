module.exports = {
  extends: '@zcool/eslint-config-browser-ts',
  parserOptions: { project: './tsconfig.json' },
  include: [".eslintrc.js", "webpack.config.js", "**/*.ts", "**/*.js", "**/*.tsx", "*.js"],
  rules: {
    'react/react-in-jsx-scope': [0],
  },
}
