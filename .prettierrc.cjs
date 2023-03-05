module.exports = {
  semi: false,
  singleQuote: true,
  // https://github.com/pnpm/pnpm/issues/3323
  plugins: [require('prettier-plugin-packagejson')],
}
